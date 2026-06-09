import { labHandler } from "./handler/handlerLab.ts";

export default {
  fetch: (req: Request) => labHandler(req),
};
