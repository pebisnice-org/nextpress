import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi"
import type { Database } from "@nextpress/core/db"
import { createTaxonomySchema, updateTaxonomySchema } from "@nextpress/core/validators"
import { TaxonomyRepository } from "../repositories/taxonomy.repository"
import { apiKeyAuth } from "../middleware/auth"
import { rateLimit } from "../middleware/rate-limit"

const taxonomyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(["category", "tag", "custom"]),
  description: z.string().nullable(),
  createdAt: z.string(),
})

export function taxonomiesRouter(db: Database) {
  const app = new OpenAPIHono()
  const repo = new TaxonomyRepository(db)
  const auth = apiKeyAuth()
  const limit = rateLimit(100, 60_000)

  app.use("/api/taxonomies/*", auth, limit)
  app.use("/api/taxonomies", auth, limit)

  app.openapi(
    createRoute({
      method: "get",
      path: "/api/taxonomies",
      tags: ["Taxonomies"],
      request: {
        query: z.object({ type: z.enum(["category", "tag", "custom"]).optional() }),
      },
      responses: {
        200: {
          content: { "application/json": { schema: z.array(taxonomyResponseSchema) } },
          description: "List taxonomies",
        },
      },
    }),
    async (c) => {
      const { type } = c.req.valid("query")
      const result = await repo.findMany(type)
      return c.json(result)
    }
  )

  app.openapi(
    createRoute({
      method: "post",
      path: "/api/taxonomies",
      tags: ["Taxonomies"],
      request: { body: { content: { "application/json": { schema: createTaxonomySchema } } } },
      responses: {
        201: {
          content: { "application/json": { schema: taxonomyResponseSchema } },
          description: "Created taxonomy",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json")
      const taxonomy = await repo.create(body)
      return c.json(taxonomy, 201)
    }
  )

  app.openapi(
    createRoute({
      method: "put",
      path: "/api/taxonomies/:id",
      tags: ["Taxonomies"],
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: updateTaxonomySchema } } },
      },
      responses: {
        200: {
          content: { "application/json": { schema: taxonomyResponseSchema } },
          description: "Updated taxonomy",
        },
        404: {
          content: { "application/json": { schema: z.object({ error: z.string() }) } },
          description: "Not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param")
      const body = c.req.valid("json")
      const taxonomy = await repo.update(id, body)
      if (!taxonomy) return c.json({ error: "Not found" }, 404)
      return c.json(taxonomy as unknown as z.infer<typeof taxonomyResponseSchema>, 200)
    }
  )

  app.openapi(
    createRoute({
      method: "delete",
      path: "/api/taxonomies/:id",
      tags: ["Taxonomies"],
      request: { params: z.object({ id: z.string() }) },
      responses: {
        204: { description: "Deleted" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param")
      await repo.delete(id)
      return new Response(null, { status: 204 })
    }
  )

  return app
}
