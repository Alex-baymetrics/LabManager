import { loginHandler } from "./handler/handlerLogin.ts";

export default {
  fetch: (req: Request) => loginHandler(req),
};