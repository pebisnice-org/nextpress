import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  alt: text("alt"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
