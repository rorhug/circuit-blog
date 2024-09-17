import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/drizzle";
import { sessions, users } from "../db/schema";

export const getSession = async (sessionId: string) => {
  const now = new Date();

  const session = await db.query.sessions.findFirst({
    with: {
      user: true,
    },
    where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)),
  });

  return session;
};

export const findOrCreateUser = async (address: string, username?: string) => {
  // let user: typeof users.$inferSelect;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.address, address),
  });

  if (existingUser) {
    return existingUser;
  } else {
    const newUser = await db
      .insert(users)
      .values({
        address,
        username: username ?? "",
      })
      .returning();

    return newUser[0];
  }
};

export const createSession = async (address: string) => {
  const oneDay = 1000 * 60 * 60 * 24;

  const session = await db
    .insert(sessions)
    .values({
      address,
      expiresAt: new Date(Date.now() + oneDay),
    })
    .returning();

  return session;
};
