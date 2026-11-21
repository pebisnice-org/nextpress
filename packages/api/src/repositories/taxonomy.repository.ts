import type { Database } from "@nextpress/core/db"
import { taxonomies } from "@nextpress/core/schema"
import type { CreateTaxonomyInput, UpdateTaxonomyInput } from "@nextpress/core/validators"
import { eq } from "drizzle-orm"

export class TaxonomyRepository {
  constructor(private readonly db: Database) {}

  async findMany(type?: "category" | "tag" | "custom") {
    if (type) {
      return this.db.select().from(taxonomies).where(eq(taxonomies.type, type))
    }
    return this.db.select().from(taxonomies)
  }

  async findBySlug(slug: string) {
    const result = await this.db.select().from(taxonomies).where(eq(taxonomies.slug, slug)).limit(1)
    return result[0] ?? null
  }

  async findById(id: string) {
    const result = await this.db.select().from(taxonomies).where(eq(taxonomies.id, id)).limit(1)
    return result[0] ?? null
  }

  async create(input: CreateTaxonomyInput) {
    const result = await this.db.insert(taxonomies).values(input).returning()
    // biome-ignore lint/style/noNonNullAssertion: INSERT RETURNING always yields a row
    return result[0]!
  }

  async update(id: string, input: UpdateTaxonomyInput) {
    const result = await this.db
      .update(taxonomies)
      .set(input)
      .where(eq(taxonomies.id, id))
      .returning()
    return result[0] ?? null
  }

  async delete(id: string) {
    await this.db.delete(taxonomies).where(eq(taxonomies.id, id))
  }
}
