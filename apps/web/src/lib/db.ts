import { getDb } from "@nextpress/core/db"
import { env } from "./env"

export const db = getDb(env.DATABASE_URL)
