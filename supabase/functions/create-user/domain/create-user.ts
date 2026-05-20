import { z } from "https://esm.sh/zod@3.22.4";

const CreateUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail invalido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  user_type: z.enum(["admin", "usuario", "colaborador"]),
  status: z.boolean().optional(),
});

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  user_type: UserType;
  status: boolean;
};

type CreateUserResult = {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
  status: boolean;
};

export type SupabaseCreateUserClient = {
  schema: (schemaName: "labmanager") => {
    from: (tableName: "users") => {
      insert: (payload: CreateUserPayload) => {
        select: (columns: "id, name, email, user_type, status") => {
          single: () => PromiseLike<{
            data: CreateUserResult | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export async function createUser(req: Request,supabase: SupabaseCreateUserClient): Promise<Response> {
  const body = await req.json();
  const parsedBody = CreateUserSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Dados invalidos.", 400, parsedBody.error.flatten());
  }

  const input = parsedBody.data;

  const { data: createdUser, error: createUserError } = await supabase
    .schema("labmanager")
    .from("users")
    .insert({
      name: input.name,
      email: input.email,
      password: input.password,
      user_type: input.user_type,
      status: input.status ?? true,
    })
    .select("id, name, email, user_type, status")
    .single();

  if (createUserError) {
    return errorResponse("Erro ao criar usuario.", 500, createUserError.message);
  }

  return successResponse(createdUser, 201);
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
    headers: {
      "Content-Type": "application/json",
    },
  });
}
