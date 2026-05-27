import { enrollHandler } from "./handler/handlerEnroll.ts";

export default {
  fetch: (req: Request) => enrollHandler(req),
};
