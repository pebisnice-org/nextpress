import type { Database } from "@nextpress/core/db"
import { menus } from "@nextpress/core/schema"
import { eq } from "drizzle-orm"

export class MenuRepository {
  constructor(private readonly db: Database) {}

  async findMany() {
    return this.db.select().from(menus)
  }

  async findById(id: string) {
    const result = await this.db.select().from(menus).where(eq(menus.id, id)).limit(1)
    return result[0] ?? null
  }

  async create(input: { name: string; slug: string; items?: string }) {
    const result = await this.db
      .insert(menus)
      .values({ name: input.name, slug: input.slug, items: input.items ?? "[]" })
      .returning()
    // biome-ignore lint/style/noNonNullAssertion: INSERT RETURNING always yields a row
    return result[0]!
  }

  async update(id: string, input: { name?: string; slug?: string; items?: string }) {
    const result = await this.db
      .update(menus)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning()
    return result[0] ?? null
  }

  async delete(id: string) {
    await this.db.delete(menus).where(eq(menus.id, id))
  }
}
