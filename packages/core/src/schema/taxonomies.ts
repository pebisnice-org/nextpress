import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core"
import { posts } from "./posts"

export const taxonomyTypeEnum = pgEnum("taxonomy_type", ["category", "tag", "custom"])

export const taxonomies = pgTable("taxonomies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: taxonomyTypeEnum("type").notNull().default("tag"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const termRelationships = pgTable("term_relationships", {
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  taxonomyId: uuid("taxonomy_id")
    .notNull()
    .references(() => taxonomies.id, { onDelete: "cascade" }),
})

export type Taxonomy = typeof taxonomies.$inferSelect
export type NewTaxonomy = typeof taxonomies.$inferInsert
