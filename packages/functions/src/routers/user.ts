import { z } from "zod";
import { publicProcedure, t } from "../trpc";
import { db } from "../db/drizzle";
import { sessions, users } from "../db/schema";
import { and, eq, gt } from "drizzle-orm";
import { generateNonce, SiweMessage } from "siwe";
import { TRPCError } from "@trpc/server";
import { createSession, findOrCreateUser } from "../lib/auth";

export const userRouter = t.router({
  nonce: publicProcedure.query(async () => {
    const nonce = generateNonce();
    return nonce;
  }),
  signIn: publicProcedure
    .input(
      z.object({
        signature: z.string(),
        message: z.any(),
        nonce: z.string(),
        username: z.string(),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { signature, message, nonce, username, email } = input;

      let SIWEObject = new SiweMessage(message);
      const {
        data: { address },
        error,
      } = await SIWEObject.verify({
        signature,
        nonce,
      });

      if (error) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "could not verify message",
        });
      }

      const user = await findOrCreateUser(address, username, email);

      const session = await createSession(user.address);

      return {
        user,
        session,
      };
    }),
});

export type UserRouter = typeof userRouter;
