import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { Database } from "@nextpress/core/db"
import { PostRepository } from "../repositories/post.repository"
import { TaxonomyRepository } from "../repositories/taxonomy.repository"
import { settings } from "@nextpress/core/schema"

export function createMcpServer(db: Database) {
  const server = new McpServer({
    name: "nextpress",
    version: "0.1.0",
  })

  const postRepo = new PostRepository(db)
  const taxonomyRepo = new TaxonomyRepository(db)

  server.tool(
    "create_post",
    "Create a new blog post",
    {
      title: z.string().min(1).max(500),
      content: z.string(),
      excerpt: z.string().optional(),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      taxonomyIds: z.array(z.string().uuid()).optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      status: z.enum(["draft", "published"]).default("draft"),
    },
    async (input) => {
      const post = await postRepo.create(input)
      return { content: [{ type: "text", text: JSON.stringify(post) }] }
    }
  )

  server.tool(
    "update_post",
    "Update an existing post by ID",
    {
      id: z.string().uuid(),
      title: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
    },
    async ({ id, ...input }) => {
      const post = await postRepo.update(id, input)
      return { content: [{ type: "text", text: JSON.stringify(post) }] }
    }
  )

  server.tool(
    "list_posts",
    "List blog posts",
    {
      status: z.enum(["draft", "published"]).optional(),
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    },
    async (input) => {
      const posts = await postRepo.findMany(input)
      return { content: [{ type: "text", text: JSON.stringify(posts) }] }
    }
  )

  server.tool("get_post", "Get a post by slug", { slug: z.string() }, async ({ slug }) => {
    const post = await postRepo.findBySlug(slug)
    return { content: [{ type: "text", text: JSON.stringify(post) }] }
  })

  server.tool(
    "create_taxonomy",
    "Create a category, tag, or custom taxonomy",
    {
      name: z.string().min(1).max(255),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      type: z.enum(["category", "tag", "custom"]).default("tag"),
      description: z.string().optional(),
    },
    async (input) => {
      const taxonomy = await taxonomyRepo.create(input)
      return { content: [{ type: "text", text: JSON.stringify(taxonomy) }] }
    }
  )

  server.tool("get_site_config", "Get site configuration and settings", {}, async () => {
    const rows = await db.select().from(settings)
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    return { content: [{ type: "text", text: JSON.stringify(config) }] }
  })

  server.tool(
    "get_theme_spec",
    "Get the ThemeConfig interface schema for creating custom themes",
    {},
    async () => {
      const spec = {
        name: "ThemeConfig",
        description: "Interface that every NextPress theme must implement",
        properties: {
          name: { type: "string", description: "Theme identifier" },
          version: { type: "string", description: "Semver version" },
          supports: {
            type: "array",
            items: { enum: ["blog", "landing", "store"] },
          },
          slots: {
            type: "object",
            description: "React components for each page section",
            properties: {
              Layout: "ComponentType<LayoutProps>",
              Header: "ComponentType<HeaderProps>",
              Footer: "ComponentType<FooterProps>",
              PostCard: "ComponentType<PostCardProps>",
              PostDetail: "ComponentType<PostDetailProps>",
              CategoryPage: "ComponentType<CategoryPageProps>",
              TagPage: "ComponentType<TagPageProps>",
              HomePage: "ComponentType<HomePageProps>",
            },
          },
        },
      }
      return { content: [{ type: "text", text: JSON.stringify(spec, null, 2) }] }
    }
  )

  return server
}
