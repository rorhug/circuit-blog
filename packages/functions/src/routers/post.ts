import { z } from "zod";
import { protectedProcedure, publicProcedure, t } from "../trpc";
import { db } from "../db/drizzle";
import { comments, posts, users } from "../db/schema";
import { and, eq, gt, ilike, isNotNull, lt } from "drizzle-orm";
import { generateNonce, SiweMessage } from "siwe";
import { TRPCError } from "@trpc/server";
import { notifyAboutPost } from "../lib/notifications";

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

      await notifyAboutPost(post[0].id);

      return post;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await db
        .update(posts)
        .set({
          title: input.title,
          content: input.content,
        })
        .where(eq(posts.id, input.id));

      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
    }),

  search: publicProcedure
    .input(
      z.object({
        authorAddress: z.string().optional(),
        titleContains: z.string().optional(),
        beforeDate: z.date().optional(),
        afterDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      // let predicates = [];

      // if (input.authorAddress) {
      //   predicates.push(eq(posts.authorAddress, input.authorAddress));
      // }

      // if (input.titleContains) {
      //   predicates.push(ilike(posts.title, `%${input.titleContains}%`));
      // }

      // if (input.beforeDate) {
      //   predicates.push(lt(posts.createdAt, input.beforeDate));
      // }

      // if (input.afterDate) {
      //   predicates.push(gt(posts.createdAt, input.afterDate));
      // }

      const filteredPosts = await db.query.posts.findMany({
        // where: predicates.length > 0 ? and(...predicates) : undefined,
        limit: 10,
      });

      return filteredPosts;
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await db.insert(comments).values({
        postId: input.postId,
        content: input.content,
        authorAddress: ctx.user.address,
      });

      return comment;
    }),
});
