import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, t } from "../trpc";
import { db } from "../db/drizzle";
import { eq, and } from "drizzle-orm";
import { follows } from "../db/schema";

export const followsRouter = t.router({
  follow: protectedProcedure
    .input(z.object({ followedAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { followedAddress } = input;
      const followerAddress = ctx.user.address;

      if (followerAddress === followedAddress) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }

      const existingFollow = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followerAddress, followerAddress),
            eq(follows.followedAddress, followedAddress)
          )
        )
        .execute();

      if (existingFollow.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already following this user",
        });
      }

      await db
        .insert(follows)
        .values({
          followerAddress,
          followedAddress,
        })
        .execute();

      return { success: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ followedAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { followedAddress } = input;
      const followerAddress = ctx.user.address;

      const result = await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerAddress, followerAddress),
            eq(follows.followedAddress, followedAddress)
          )
        )
        .execute();

      if (result.numberOfRecordsUpdated === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not following this user",
        });
      }

      return { success: true };
    }),
});
