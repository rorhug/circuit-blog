// import { bucket } from "./storage";
import { rds } from "./db";
import { postQueue, emailQueue } from "./queues";

export const trpc = new sst.aws.Function("Trpc", {
  url: true,
  handler: "packages/functions/src/index.handler",
  link: [rds, postQueue, emailQueue],
});
