type ListLabsResult = {
    id: number;
    fk_user_manager_id: number | null;
    name: string;
    opening_time: string;
    closure_time: string;
    status: boolean;
    uf: string;
    city: string;
    street: string;
    number: string;
    max_capacity: number;
}

export type SupabaseListLabsClient = {
  schema: (schemaName: "labmanager") => {
    from: (tableName: "laboratory") => {
      select: (
        columns: "id, fk_user_manager_id, name, opening_time, closure_time, status, uf, city, street, number, max_capacity"
      ) => {
        eq: (column: "status", value: true) => PromiseLike<{
          data: ListLabsResult[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export async function listLabs(supabase: SupabaseListLabsClient): Promise<Response> {
    const { data, error } = await supabase
      .schema("labmanager")
      .from("laboratory")
      .select("id, fk_user_manager_id, name, opening_time, closure_time, status, uf, city, street, number, max_capacity")
      .eq("status", true);

    if (error) {
        return errorResponse("Erro ao listar laboratorios.", 500, error.message);
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