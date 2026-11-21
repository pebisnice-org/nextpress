import type { Database } from "@nextpress/core/db"
import { settings } from "@nextpress/core/schema"
import { eq } from "drizzle-orm"

export class SettingsRepository {
  constructor(private readonly db: Database) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.db.select().from(settings)
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }

  async get(key: string): Promise<string | null> {
    const result = await this.db.select().from(settings).where(eq(settings.key, key)).limit(1)
    return result[0]?.value ?? null
  }

  async set(key: string, value: string): Promise<void> {
    await this.db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
  }

  async setMany(pairs: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(pairs)) {
      await this.set(key, value)
    }
  }
}
