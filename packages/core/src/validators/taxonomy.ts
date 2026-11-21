import { z } from "zod"

export const createTaxonomySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  type: z.enum(["category", "tag", "custom"]).default("tag"),
  description: z.string().max(1000).optional(),
})

export const updateTaxonomySchema = createTaxonomySchema.partial()

export type CreateTaxonomyInput = z.infer<typeof createTaxonomySchema>
export type UpdateTaxonomyInput = z.infer<typeof updateTaxonomySchema>
