import { SQSEvent } from "aws-lambda";
import { z } from "zod";
import {
  processNotifyAboutPost,
  processEmailBatchAboutPost,
} from "./lib/notifications";

const NotifyAboutPostSchema = z.object({
  postId: z.string(),
});

export type NotifyAboutPostSchemaT = z.infer<typeof NotifyAboutPostSchema>;

const EmailBatchAboutPostSchema = z.object({
  postId: z.string(),
  emails: z.array(z.string()),
});

export type EmailBatchAboutPostSchemaT = z.infer<
  typeof EmailBatchAboutPostSchema
>;

export const notifyAboutPost = async (event: SQSEvent) => {
  console.log("notifyAboutPost", event.Records[0].body);
  // throw new Error("test dlq");
  const parsed = NotifyAboutPostSchema.parse(JSON.parse(event.Records[0].body));
  return processNotifyAboutPost(parsed);
};

export const dlq = async (event: SQSEvent) => {
  console.log("notifyAboutPost dlq", event.Records[0].body);
  return "ok";
};

export const sendEmailsAboutPost = async (event: SQSEvent) => {
  console.log("sendEmailsAboutPost", event.Records[0].body);

  const parsed = EmailBatchAboutPostSchema.parse(
    JSON.parse(event.Records[0].body)
  );
  return processEmailBatchAboutPost(parsed);
};
