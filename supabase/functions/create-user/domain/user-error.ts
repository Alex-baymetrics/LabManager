export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Usuário com email ${email} já existe`);
    this.name = "UserAlreadyExistsError";
  }
}

export class InvalidUserError extends Error {
  constructor(message = "Usuário inválido") {
    super(message);
    this.name = "InvalidUserError";
    }
  }
