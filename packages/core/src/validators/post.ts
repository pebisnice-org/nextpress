import { z } from "zod"

export const createPostSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(500),
  excerpt: z.string().max(1000).optional(),
  content: z.string(),
  coverImage: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  taxonomyIds: z.array(z.string().uuid()).optional(),
})

export const updatePostSchema = createPostSchema.partial()

export const listPostsSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type ListPostsInput = z.infer<typeof listPostsSchema>
