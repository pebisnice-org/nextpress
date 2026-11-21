import { createHash, timingSafeEqual } from "node:crypto"
import type { Context, Next } from "hono"

const digest = (value: string) => createHash("sha256").update(value).digest()

export function isValidApiKey(key: string | null | undefined) {
  const expected = process.env.NEXTPRESS_API_KEY
  if (!key || !expected) return false
  return timingSafeEqual(digest(key), digest(expected))
}

export function apiKeyAuth() {
  return async (c: Context, next: Next) => {
    if (!isValidApiKey(c.req.header("X-Api-Key"))) {
      return c.json({ error: "Invalid or missing X-Api-Key header" }, 401)
    }
    await next()
  }
}
