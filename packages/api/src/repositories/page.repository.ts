import type { Database } from "@nextpress/core/db"
import { pages } from "@nextpress/core/schema"
import type { CreatePageInput, UpdatePageInput } from "@nextpress/core/validators"
import { eq, sql } from "drizzle-orm"
import { sanitizeContent } from "../sanitize"

export class PageRepository {
  constructor(private readonly db: Database) {}

  async findMany() {
    return this.db.select().from(pages).orderBy(sql`${pages.createdAt} desc`)
  }

  async findBySlug(slug: string) {
    const result = await this.db.select().from(pages).where(eq(pages.slug, slug)).limit(1)
    return result[0] ?? null
  }

  async findById(id: string) {
    const result = await this.db.select().from(pages).where(eq(pages.id, id)).limit(1)
    return result[0] ?? null
  }

  async create(input: CreatePageInput) {
    const result = await this.db.insert(pages).values(sanitizeContent(input)).returning()
    // biome-ignore lint/style/noNonNullAssertion: INSERT RETURNING always yields a row
    return result[0]!
  }

  async update(id: string, input: UpdatePageInput) {
    const result = await this.db
      .update(pages)
      .set({ ...sanitizeContent(input), updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning()
    return result[0] ?? null
  }

  async delete(id: string) {
    await this.db.delete(pages).where(eq(pages.id, id))
  }
}
