import { z } from "https://esm.sh/zod@3.22.4";
import type { AuthUser } from "../../_shared/verificar-jwt.ts";

const CheckoutLabSchema = z.object({
  lab_id: z.number().int().positive("ID do laboratorio invalido."),
});

export type SupabaseCheckoutLabClient = {
  schema: (schemaName: "labmanager") => {
    rpc: (
      fn: "checkout_user_from_lab",
      params: { p_auth_id: string; p_lab_id: number }
    ) => PromiseLike<{
      data: unknown | null;
      error: { message: string } | null;
    }>;
  };
};

export async function checkoutLab(
  req: Request,
  authUser: AuthUser,
  supabase: SupabaseCheckoutLabClient
): Promise<Response> {
  const body = await req.json();
  const parsedBody = CheckoutLabSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const { lab_id } = parsedBody.data;

  const { data, error } = await supabase.schema("labmanager").rpc("checkout_user_from_lab", {
    p_auth_id: authUser.auth_id,
    p_lab_id: lab_id,
  });

  if (error) {
    return errorResponse(error.message, 400);
  }

  return successResponse(data, 200);
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
