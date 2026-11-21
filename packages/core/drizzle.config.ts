import type { Config } from "drizzle-kit"

export default {
  schema: "./src/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: drizzle-kit requires DATABASE_URL at config time
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
