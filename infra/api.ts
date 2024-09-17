// import { bucket } from "./storage";
import { rds } from "./db";

export const trpc = new sst.aws.Function("Trpc", {
  url: true,
  handler: "packages/functions/src/index.handler",
  link: [rds],
});
