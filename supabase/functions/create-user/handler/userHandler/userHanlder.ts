import { createUser } from "../../domain/create-user.ts";
import { createSupabaseAdminClient } from "../../../_shared/supabaseClient.ts";

export async function userHandler(req: Request): Promise<Response> {
  const supabase = createSupabaseAdminClient();
  return createUser(req, supabase);
  
}
