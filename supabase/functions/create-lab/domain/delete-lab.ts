import { z } from "https://esm.sh/zod@3.22.4";

const DeleteLabSchema = z.object({
  id: z.number().int().positive("ID do laboratorio invalido."),
});

export type DeleteLabResult = {
  id: number;
  name: string;
  status: boolean;
};

export type SupabaseDeleteLabClient = {
  schema: (schemaName: "labmanager") => {
    from: (tableName: "laboratory") => {
      update: (payload: { status: boolean }) => {
        eq: (column: "id", value: number) => {
          select: (columns: "id, name, status") => {
            single: () => PromiseLike<{
              data: DeleteLabResult | null;
              error: { message: string } | null;
            }>;
          };
        };
      };
    };
  };
};

export async function deleteLab(
  req: Request,
  supabase: SupabaseDeleteLabClient
): Promise<Response> {
  const body = await req.json();
  const parsedBody = DeleteLabSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const { id } = parsedBody.data;

  const { data: updatedLab, error: deleteLabError } = await supabase
    .schema("labmanager")
    .from("laboratory")
    .update({ status: false })
    .eq("id", id)
    .select("id, name, status")
    .single();

  if (deleteLabError) {
    return errorResponse("Erro ao inativar laboratorio.", 500, deleteLabError.message);
  }

  return successResponse(updatedLab, 200);
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
