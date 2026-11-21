import type { Database } from "@nextpress/core/db"
import { posts, termRelationships } from "@nextpress/core/schema"
import type { CreatePostInput, UpdatePostInput, ListPostsInput } from "@nextpress/core/validators"
import { eq, and, sql } from "drizzle-orm"
import { sanitizeContent } from "../sanitize"

export class PostRepository {
  constructor(private readonly db: Database) {}

  async findMany(input: ListPostsInput) {
    const conditions = input.status ? [eq(posts.status, input.status)] : []
    return this.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .limit(input.limit)
      .offset(input.offset)
      .orderBy(sql`${posts.createdAt} desc`)
  }

  async findBySlug(slug: string) {
    const result = await this.db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
    return result[0] ?? null
  }

  async findById(id: string) {
    const result = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1)
    return result[0] ?? null
  }

  async create(input: CreatePostInput) {
    const { taxonomyIds, ...data } = sanitizeContent(input)
    const result = await this.db
      .insert(posts)
      .values({ ...data, publishedAt: input.status === "published" ? new Date() : null })
      .returning()
    // biome-ignore lint/style/noNonNullAssertion: INSERT RETURNING always yields a row
    const post = result[0]!
    if (taxonomyIds?.length) {
      await this.db
        .insert(termRelationships)
        .values(taxonomyIds.map((taxonomyId) => ({ postId: post.id, taxonomyId })))
    }
    return post
  }

  async update(id: string, input: UpdatePostInput) {
    const { taxonomyIds, ...data } = sanitizeContent(input)
    const result = await this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning()
    if (taxonomyIds !== undefined) {
      await this.db.delete(termRelationships).where(eq(termRelationships.postId, id))
      if (taxonomyIds.length) {
        await this.db
          .insert(termRelationships)
          .values(taxonomyIds.map((taxonomyId) => ({ postId: id, taxonomyId })))
      }
    }
    return result[0] ?? null
  }

  async delete(id: string) {
    await this.db.delete(posts).where(eq(posts.id, id))
  }
}
