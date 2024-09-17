import { z } from "zod";
import {
  // APIGatewayEvent,
  awsLambdaRequestHandler,
  CreateAWSLambdaContextOptions,
} from "@trpc/server/adapters/aws-lambda";
import { initTRPC, TRPCError } from "@trpc/server";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from "aws-lambda";
import { getSession } from "./lib/auth";
import { userRouter } from "./routers/user";

export const t = initTRPC
  .context<CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>>()
  .create();

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  const sessionId = ctx.event.headers["x-session-id"];

  if (!sessionId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Must provide x-session-id header.",
    });
  }

  const session = await getSession(sessionId);

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session not found or expired.",
    });
  }

  return next({
    ctx: {
      sessionId: session.id,
      user: session.user,
    },
  });
});

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
