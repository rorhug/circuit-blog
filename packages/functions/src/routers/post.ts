import { z } from "zod";
import { protectedProcedure, t } from "../trpc";
import { db } from "../db/drizzle";
import { posts, users } from "../db/schema";
import { and, eq, gt } from "drizzle-orm";
import { generateNonce, SiweMessage } from "siwe";
import { TRPCError } from "@trpc/server";

export const postRouter = t.router({
  getAll: t.procedure.query(async () => {
    const posts = await db.query.posts.findMany({
      // where: eq(users.address, address),
    });

    return posts;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          authorAddress: ctx.user.address,
        })
        .returning();

      return post;
    }),
});
