import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../schema"

let _db: ReturnType<typeof drizzle> | null = null

export function getDb(databaseUrl: string) {
  if (!_db) {
    const client = postgres(databaseUrl, { prepare: false })
    _db = drizzle(client, { schema })
  }
  return _db
}

export type Database = ReturnType<typeof getDb>
