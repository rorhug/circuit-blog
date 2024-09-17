import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import {
  EmailBatchAboutPostSchemaT,
  NotifyAboutPostSchemaT,
} from "../subscriber";
import { db } from "../db/drizzle";
import { and, desc, eq } from "drizzle-orm";
import { follows, posts } from "../db/schema";

const client = new SQSClient();

const BATCH_SIZE = 100;

export const notifyAboutPost = async (postId: string) => {
  const body: NotifyAboutPostSchemaT = { postId };

  await client.send(
    new SendMessageCommand({
      QueueUrl: Resource.BlogPostNotificationQ.url,
      MessageBody: JSON.stringify(body),
    })
  );
};

export const processNotifyAboutPost = async ({
  postId,
}: NotifyAboutPostSchemaT) => {
  console.log("processNotifyAboutPost", postId);

  const post = await db.query.posts.findFirst({
    with: {
      author: true,
    },
    where: eq(posts.id, postId),
  });

  if (!post) {
    throw new Error("post not found");
  }

  const { author } = post;

  let pageCount = 0;
  let lastPageLength;
  do {
    const followRecords = await db.query.follows.findMany({
      where: eq(follows.followedAddress, author.address),
      with: {
        follower: true,
      },
      orderBy: desc(follows.createdAt),
      limit: BATCH_SIZE,
      offset: pageCount * BATCH_SIZE,
    });

    lastPageLength = followRecords.length;

    const emails = followRecords
      .map((rec) => rec.follower.email)
      .filter(Boolean) as string[];

    if (emails.length === 0) {
      console.log("no emails to send to");
      return;
    }

    const body: EmailBatchAboutPostSchemaT = { postId, emails };

    await client.send(
      new SendMessageCommand({
        QueueUrl: Resource.BlogPostEmailQ.url,
        MessageBody: JSON.stringify(body),
      })
    );

    pageCount++;
    console.log(`page ${pageCount} with ${lastPageLength} emails`);
  } while (lastPageLength !== 0);
};

export const processEmailBatchAboutPost = async ({
  postId,
  emails,
}: EmailBatchAboutPostSchemaT) => {
  console.log("sending emails to ", emails.join(", "));
};
