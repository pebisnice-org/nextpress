import { redis } from "@nextpress/api"
import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { account, session, user, verification } from "@nextpress/core/schema"
import { db } from "./db"
import { env } from "./env"

export async function hasUsers() {
  const rows = await db.select({ id: user.id }).from(user).limit(1)
  return rows.length > 0
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.ADMIN_URL ?? env.NEXT_PUBLIC_SITE_URL,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          if (await hasUsers()) {
            throw new APIError("FORBIDDEN", { message: "Sign-up is closed" })
          }
        },
      },
    },
  },
  advanced: {
    defaultCookieAttributes: { httpOnly: true, sameSite: "strict" },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
    ...(redis ? { customStorage: redisRateLimitStorage(redis) } : { storage: "memory" as const }),
  },
})

function redisRateLimitStorage(client: NonNullable<typeof redis>) {
  return {
    consume: async (key: string, rule: { window: number; max: number }) => {
      const redisKey = `auth-rl:${key}`
      const result = await client
        .multi()
        .incr(redisKey)
        .expire(redisKey, rule.window, "NX")
        .ttl(redisKey)
        .exec()
      const count = Number(result?.[0]?.[1] ?? 0)
      const ttl = Number(result?.[2]?.[1] ?? rule.window)
      return count <= rule.max
        ? { allowed: true, retryAfter: null }
        : { allowed: false, retryAfter: Math.max(ttl, 1) }
    },
  }
}
