import { z } from "https://esm.sh/zod@3.22.4";
import type { SupabaseClient } from "@supabase/supabase-js";

enum UserType {
  ADMIN = "admin",
  USUARIO = "usuario",
  COLABORADOR = "colaborador",
}

const CreateUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail invalido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  user_type: z.enum([UserType.ADMIN, UserType.USUARIO, UserType.COLABORADOR]),
  status: z.boolean().optional(),
});

export async function createUser(req: Request, supabase: SupabaseClient): Promise<Response> {
  const body = await req.json();
  const parsedBody = CreateUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const { name, email, password, user_type, status = true } = parsedBody.data;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { user_type },
    user_metadata: { name },
  });

  if (authError || !authData.user) {
    return errorResponse("Erro ao criar usuario.", 500, authError?.message);
  }

  const { data: createdUser, error: insertError } = await supabase
    .schema("labmanager")
    .from("users")
    .insert({ name, email, auth_id: authData.user.id, user_type, status })
    .select("id, name, email, user_type, status")
    .single();

  if (insertError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return errorResponse("Erro ao criar usuario.", 500, insertError.message);
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (sessionError || !sessionData.session) {
    return errorResponse("Usuario criado, mas erro ao gerar token.", 500, sessionError?.message);
  }

  return successResponse({
    token: sessionData.session.access_token,
    user: createdUser,
  }, 201);
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
