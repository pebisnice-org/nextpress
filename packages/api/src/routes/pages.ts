import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi"
import type { Database } from "@nextpress/core/db"
import { createPageSchema, updatePageSchema } from "@nextpress/core/validators"
import { PageRepository } from "../repositories/page.repository"
import { apiKeyAuth } from "../middleware/auth"
import { rateLimit } from "../middleware/rate-limit"

const pageResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  status: z.enum(["draft", "published"]),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export function pagesRouter(db: Database) {
  const app = new OpenAPIHono()
  const repo = new PageRepository(db)
  const auth = apiKeyAuth()
  const limit = rateLimit(100, 60_000)

  app.use("/api/pages/*", auth, limit)
  app.use("/api/pages", auth, limit)

  app.openapi(
    createRoute({
      method: "get",
      path: "/api/pages",
      tags: ["Pages"],
      responses: {
        200: {
          content: { "application/json": { schema: z.array(pageResponseSchema) } },
          description: "List pages",
        },
      },
    }),
    async (c) => {
      const result = await repo.findMany()
      return c.json(result)
    }
  )

  app.openapi(
    createRoute({
      method: "post",
      path: "/api/pages",
      tags: ["Pages"],
      request: { body: { content: { "application/json": { schema: createPageSchema } } } },
      responses: {
        201: {
          content: { "application/json": { schema: pageResponseSchema } },
          description: "Created page",
        },
      },
    }),
    async (c) => {
      const body = c.req.valid("json")
      const page = await repo.create(body)
      return c.json(page, 201)
    }
  )

  app.openapi(
    createRoute({
      method: "put",
      path: "/api/pages/:id",
      tags: ["Pages"],
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: updatePageSchema } } },
      },
      responses: {
        200: {
          content: { "application/json": { schema: pageResponseSchema } },
          description: "Updated page",
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
      const page = await repo.update(id, body)
      if (!page) return c.json({ error: "Not found" }, 404)
      return c.json(page as unknown as z.infer<typeof pageResponseSchema>, 200)
    }
  )

  app.openapi(
    createRoute({
      method: "delete",
      path: "/api/pages/:id",
      tags: ["Pages"],
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
