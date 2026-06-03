import { userHandler } from "./handler/userHandler/userHanlder.ts";

export default {
  fetch: (req: Request) => userHandler(req),
};
