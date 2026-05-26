import { z } from "https://esm.sh/zod@3.22.4";


const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const cepRegex = /^\d{5}-?\d{3}$/;


const CreateLabSchema = z.object({
  fk_user_manager_id: z.number().int().positive().optional(),
  name: z.string().min(1, "Nome e obrigatorio.").max(100, "Nome deve ter no maximo 100 caracteres."),
  opening_time: z.string().regex(timeRegex, "Horario de abertura invalido."),
  closure_time: z.string().regex(timeRegex, "Horario de fechamento invalido."),
  status: z.boolean().optional(),
  cep: z.string().regex(cepRegex, "CEP invalido. Use o formato 00000-000 ou 00000000."),
  number: z.string().min(1, "Numero e obrigatorio.").max(20, "Numero deve ter no maximo 20 caracteres."),
  max_capacity: z.number().int().positive("Capacidade maxima deve ser um numero positivo."),
});

type ViaCepResponse = {
  erro?: boolean;
  logradouro: string;
  localidade: string;
  uf: string;
};

export type CreateLabPayload = {
  fk_user_manager_id?: number;
  name: string;
  opening_time: string;
  closure_time: string;
  status: boolean;
  uf: string;
  city: string;
  street: string;
  number: string;
  max_capacity: number;
};

export type CreateLabResult = {
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
};

export type SupabaseCreateLabClient = {
  schema: (schemaName: "labmanager") => {
    from: (tableName: "laboratory") => {
      insert: (payload: CreateLabPayload) => {
        select: (
          columns: "id, fk_user_manager_id, name, opening_time, closure_time, status, uf, city, street, number, max_capacity"
        ) => {
          single: () => PromiseLike<{
            data: CreateLabResult | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

async function getAddressByCep(cep: string): Promise<ViaCepResponse> {
  const cleanCep = cep.replace("-", "");
  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

  if (!response.ok) {
    throw new Error("Falha ao consultar o ViaCEP.");
  }

  const data: ViaCepResponse = await response.json();

  if (data.erro) {
    throw new Error("CEP nao encontrado.");
  }

  return data;
}

export async function createLab(
  req: Request,
  supabase: SupabaseCreateLabClient
): Promise<Response> {
  const body = await req.json();
  const parsedBody = CreateLabSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const input = parsedBody.data;

  let address: ViaCepResponse;
  try {
    address = await getAddressByCep(input.cep);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }

  const { data: createdLab, error: createLabError } = await supabase
    .schema("labmanager")
    .from("laboratory")
    .insert({
      ...(input.fk_user_manager_id !== undefined && {
        fk_user_manager_id: input.fk_user_manager_id,
      }),
      name: input.name,
      opening_time: input.opening_time,
      closure_time: input.closure_time,
      status: input.status ?? false,
      uf: address.uf,
      city: address.localidade,
      street: address.logradouro,
      number: input.number,
      max_capacity: input.max_capacity,
    })
    .select(
      "id, fk_user_manager_id, name, opening_time, closure_time, status, uf, city, street, number, max_capacity"
    )
    .single();

  if (createLabError) {
    return errorResponse("Erro ao criar laboratorio.", 500, createLabError.message);
  }

  return successResponse(createdLab, 201);
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
