import { z } from "https://esm.sh/zod@3.22.4";

const AssignManagerSchema = z.object({
  lab_id: z.number().int().positive("ID do laboratorio invalido."),
  user_id: z.number().int().positive("ID do usuario invalido."),
});

export type SupabaseAssignManagerClient = {
  schema: (schemaName: "labmanager") => {
    rpc: (
      fn: "assign_manager_to_lab",
      params: { p_lab_id: number; p_user_id: number }
    ) => PromiseLike<{
      data: unknown | null;
      error: { message: string } | null;
    }>;
  };
};

export async function assignManager(
  req: Request,
  supabase: SupabaseAssignManagerClient
): Promise<Response> {
  const body = await req.json();
  const parsedBody = AssignManagerSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const { lab_id, user_id } = parsedBody.data;

  const { data, error } = await supabase.schema("labmanager").rpc("assign_manager_to_lab", {
    p_lab_id: lab_id,
    p_user_id: user_id,
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
