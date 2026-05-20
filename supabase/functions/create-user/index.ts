import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { userHandler } from "./handler/userHandler/userHanlder.ts";

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, (req) => userHandler(req)),
};
