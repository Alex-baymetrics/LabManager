import { createClient } from "npm:@supabase/supabase-js@2";

export function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL não configurada.");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY não configurada.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
