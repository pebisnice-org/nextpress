import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core"

export const postStatusEnum = pgEnum("post_status", ["draft", "published"])

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull().default(""),
  coverImage: text("cover_image"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  status: postStatusEnum("status").notNull().default("draft"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
