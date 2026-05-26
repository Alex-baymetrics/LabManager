import { login } from "../domain/login.ts";
import { createSupabaseAdminClient } from "../../_shared/supabaseClient.ts";

export async function loginHandler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Metodo nao permitido." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const authClient = createSupabaseAdminClient();
  const dbClient = createSupabaseAdminClient();
  return login(req, authClient, dbClient);
}
