import { rds } from "./db";

const dlq = new sst.aws.Queue("BlogPostNotificationDLQ");
dlq.subscribe({
  handler: "packages/functions/src/subscriber.dlq",
  link: [rds],
});

const emailQueue = new sst.aws.Queue("BlogPostEmailQ");
emailQueue.subscribe({
  handler: "packages/functions/src/subscriber.sendEmailsAboutPost",
  link: [rds],
});

// create main queue
const postQueue = new sst.aws.Queue("BlogPostNotificationQ", {
  dlq: dlq.arn,
});

postQueue.subscribe({
  handler: "packages/functions/src/subscriber.notifyAboutPost",
  link: [rds, emailQueue],
});

export { postQueue, emailQueue, dlq };
