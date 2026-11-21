import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import type { Database } from "@nextpress/core/db"
import { sql } from "drizzle-orm"
import { redis } from "./middleware/rate-limit"
import { postsRouter } from "./routes/posts"
import { pagesRouter } from "./routes/pages"
import { taxonomiesRouter } from "./routes/taxonomies"

export function createApp(db: Database) {
  const app = new OpenAPIHono()

  app.get("/api/health", async (c) => {
    try {
      await db.execute(sql`select 1`)
      if (redis) await redis.ping()
      return c.json({ status: "ok" })
    } catch {
      return c.json({ status: "error" }, 503)
    }
  })

  app.route("/", postsRouter(db))
  app.route("/", pagesRouter(db))
  app.route("/", taxonomiesRouter(db))

  app.doc("/api/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: "0.1.0",
      title: "NextPress API",
      description: "RESTful API for NextPress CMS — AI-ready, MCP-compatible",
    },
  })

  app.get("/api/docs", swaggerUI({ url: "/api/openapi.json" }))

  return app
}
