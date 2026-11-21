import { z } from "zod"

export const createPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(500),
  content: z.string(),
  status: z.enum(["draft", "published"]).default("draft"),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
})

export const updatePageSchema = createPageSchema.partial()

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
