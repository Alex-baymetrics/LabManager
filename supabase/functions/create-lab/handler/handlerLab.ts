import { createLab, type SupabaseCreateLabClient } from "../domain/create-lab.ts";
import { deleteLab, type SupabaseDeleteLabClient } from "../domain/delete-lab.ts";
import { assignManager, type SupabaseAssignManagerClient } from "../domain/assign-manager.ts";
import { createSupabaseAdminClient } from "../../_shared/supabaseClient.ts";
import { listLabs, type SupabaseListLabsClient } from "../domain/list-lab.ts";
import { verificarJwt, unauthorizedResponse, forbiddenResponse } from "../../_shared/verificar-jwt.ts";

export async function labHandler(req: Request): Promise<Response> {
  const authUser = await verificarJwt(req);
  if (!authUser) {
    return unauthorizedResponse();
  }

  const supabase = createSupabaseAdminClient();

  switch(req.method) {
    case "GET":
      return listLabs(supabase as unknown as SupabaseListLabsClient);
    case "POST":
      if (authUser.user_type !== "admin") return forbiddenResponse();
      return createLab(req, supabase as unknown as SupabaseCreateLabClient);
    case "DELETE":
      if (authUser.user_type !== "admin") return forbiddenResponse();
      return deleteLab(req, supabase as unknown as SupabaseDeleteLabClient);
    case "PATCH":
      if (authUser.user_type !== "admin") return forbiddenResponse();
      return assignManager(req, supabase as unknown as SupabaseAssignManagerClient);
    default:
      return new Response(JSON.stringify({ success: false, message: "Metodo nao permitido." }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
  }

}
