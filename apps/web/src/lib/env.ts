import { z } from "zod"

const schema = z
  .object({
    DATABASE_URL: z.string().url(),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SITE_NAME: z.string().default("NextPress"),
    ADMIN_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    NEXTPRESS_API_KEY: z.string().min(32),
    REDIS_URL: z.string().url().optional(),
    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().default("auto"),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().url().optional(),
    MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(4),
  })
  .refine(
    (e) =>
      e.STORAGE_DRIVER === "local" ||
      (e.S3_ENDPOINT &&
        e.S3_BUCKET &&
        e.S3_ACCESS_KEY_ID &&
        e.S3_SECRET_ACCESS_KEY &&
        e.S3_PUBLIC_URL),
    {
      message:
        "STORAGE_DRIVER=s3 requires S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_PUBLIC_URL",
    }
  )

function parseEnv() {
  const result = schema.safeParse(
    Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ""))
  )
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${result.error.message}`)
  }
  return result.data
}

export const env = parseEnv()
