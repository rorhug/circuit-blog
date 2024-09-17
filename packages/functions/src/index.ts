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
import { t } from "./trpc";
import { postRouter } from "./routers/post";
import { followsRouter } from "./routers/follows";

export const router = t.router({
  user: userRouter,
  post: postRouter,
  follows: followsRouter,
});

export type Router = typeof router;

const createContext = ({
  event,
  context,
  info,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => ({
  event,
  context,
  info,
});
type Context = Awaited<ReturnType<typeof createContext>>;

export const handler = awsLambdaRequestHandler({
  router,
  createContext,
});
