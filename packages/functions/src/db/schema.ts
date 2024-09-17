import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  address: text("address").primaryKey(), // eth address
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: text("email"),
});

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  posts: many(posts),
  comments: many(comments),
  follows: many(follows),
}));

// todo: table should be vaccummed
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  address: text("address")
    .references(() => users.address)
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.address],
    references: [users.address],
  }),
}));

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorAddress: text("author_address")
    .notNull()
    .references(() => users.address),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorAddress],
    references: [users.address],
  }),
}));

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id),
  authorAddress: text("author_address")
    .notNull()
    .references(() => users.address),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const follows = pgTable(
  "follows",
  {
    followerAddress: text("follower_address")
      .notNull()
      .references(() => users.address),
    followedAddress: text("followed_address")
      .notNull()
      .references(() => users.address),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerAddress, table.followedAddress] }),
  })
);

export const followRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerAddress],
    references: [users.address],
  }),
}));
