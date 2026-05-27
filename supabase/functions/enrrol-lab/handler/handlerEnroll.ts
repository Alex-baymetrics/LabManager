import { enrollLab, type SupabaseEnrollLabClient } from "../domain/enroll-lab.ts";
import { checkoutLab, type SupabaseCheckoutLabClient } from "../domain/checkout-lab.ts";
import { createSupabaseAdminClient } from "../../_shared/supabaseClient.ts";
import { verificarJwt, unauthorizedResponse } from "../../_shared/verificar-jwt.ts";

export async function enrollHandler(req: Request): Promise<Response> {
  const authUser = await verificarJwt(req);
  if (!authUser) {
    return unauthorizedResponse();
  }

  const supabase = createSupabaseAdminClient();

  switch (req.method) {
    case "POST":
      return enrollLab(req, authUser, supabase as unknown as SupabaseEnrollLabClient);
    case "DELETE":
      return checkoutLab(req, authUser, supabase as unknown as SupabaseCheckoutLabClient);
    default:
      return new Response(JSON.stringify({ success: false, message: "Metodo nao permitido." }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
  }
}
