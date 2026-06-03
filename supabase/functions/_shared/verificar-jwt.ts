import { createSupabaseAdminClient } from "./supabaseClient.ts";

const bearer = "Bearer ";

export type AuthUser = {
  auth_id: string;
  email: string;
  user_type: "admin" | "colaborador" | "usuario";
};

export async function verificarJwt(req: Request): Promise<AuthUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith(bearer)) return null;

  const token = authHeader.replace(bearer, "");
  const supabase = createSupabaseAdminClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return {
    auth_id: user.id,
    email: user.email!,
    user_type: user.app_metadata?.user_type ?? "usuario",
  };
}

export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ success: false, message: "Token invalido ou ausente." }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

export function forbiddenResponse(): Response {
  return new Response(
    JSON.stringify({ success: false, message: "Sem permissao para esta acao." }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}
