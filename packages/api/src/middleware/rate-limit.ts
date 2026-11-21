import { createHash } from "node:crypto"
import type { Context, Next } from "hono"
import Redis from "ioredis"

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 })
  : null

const memory = new Map<string, number>()

async function hit(key: string, windowMs: number) {
  if (redis) {
    const result = await redis.multi().incr(key).pexpire(key, windowMs, "NX").exec()
    return Number(result?.[0]?.[1] ?? 0)
  }
  if (memory.size > 10_000) memory.clear()
  const count = (memory.get(key) ?? 0) + 1
  memory.set(key, count)
  return count
}

export function rateLimit(limit: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const client = c.req.header("X-Api-Key") ?? c.req.header("x-forwarded-for") ?? "unknown"
    const id = createHash("sha256").update(client).digest("hex").slice(0, 32)
    const window = Math.floor(Date.now() / windowMs)

    if ((await hit(`rl:${id}:${window}`, windowMs)) > limit) {
      return c.json({ error: "Too many requests" }, 429)
    }
    await next()
  }
}
