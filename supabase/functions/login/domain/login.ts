import { z } from "https://esm.sh/zod@3.22.4";
import type { SupabaseClient } from "@supabase/supabase-js";

const LoginSchema = z.object({
  email: z.string().email("E-mail invalido."),
  password: z.string().min(1, "Senha e obrigatoria."),
});

type UserRecord = {
  id: number;
  name: string;
  email: string;
  user_type: string;
  status: boolean;
};

export async function login(req: Request, supabase: SupabaseClient, dbClient: SupabaseClient): Promise<Response> {
  const body = await req.json();
  const parsedBody = LoginSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const { email, password } = parsedBody.data;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
              
  if (authError || !authData.user || !authData.session) {
    return errorResponse("Email ou senha incorretos.", 401);
  }

  const { data: user, error: userError } = await dbClient
    .schema("labmanager")
    .from("users")
    .select("id, name, email, user_type, status")
    .eq("auth_id", authData.user.id)
    .single();

  if (userError || !user) {
    return errorResponse("Usuario nao encontrado.", 404);
  }

  if (!(user as UserRecord).status) {
    return errorResponse("Usuario inativo.", 403);
  }

  const { id, name, user_type } = user as UserRecord;

  return successResponse({
    token: authData.session.access_token,
    user: { id, name, email, user_type },
  });
}

function successResponse(data: unknown, status = 200): Response {
  return jsonResponse({ success: true, data }, status);
}

function errorResponse(message: string, status = 400, details?: unknown): Response {
  return jsonResponse({ success: false, message, details }, status);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },

  });
}
