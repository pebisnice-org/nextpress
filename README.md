# NextPress

[![CI](https://github.com/pebisnice/nextpress/actions/workflows/ci.yml/badge.svg)](https://github.com/pebisnice/nextpress/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

An open-source WordPress alternative built on Next.js 15, TypeScript, and PostgreSQL. Familiar WordPress-style editing, a typed REST API, and a built-in MCP server so AI agents can manage your content.

Runs free on [Vercel](https://vercel.com) + [Supabase](https://supabase.com).

## Features

### Admin panel

One app, one deployment: the admin panel lives at `/admin` on the same domain, like `/wp-admin`.

- **First-run setup**: the first visit to `/admin` creates the administrator account, then sign-up closes
- **Dashboard** with content stats
- **Post editor** modeled on WordPress:
  - Tiptap rich-text editor
  - Permalink bar with inline slug editing
  - Publish box: status, visibility (public / private / password), publish date, preview, save draft, move to trash
  - Categories and tags panels, with new tags created inline
  - SEO panel with Google snippet preview and keyphrase highlighting
  - Screen Options to show or hide panels (format, categories, tags, excerpt, SEO), remembered per browser
- **Pages**, **media library**, **menus**, **categories & tags**, **site settings**
- Light / dark / system theme

### Public site

- Blog index and post pages from the theme system
- Dynamic OpenGraph images at `/og`
- `sitemap.xml`, `robots.txt`, and `llms.txt` (AI crawlers such as GPTBot, ClaudeBot, and PerplexityBot are allowed)

### API & AI

- REST API with an OpenAPI 3.0 spec and Swagger UI
- MCP server (Streamable HTTP) so AI agents can create and update content
- API key authentication and rate limiting

### Security

- Session cookies are `HttpOnly`, `SameSite=Strict`, and `Secure` over HTTPS
- Post and page HTML is sanitized on write, whether it comes from the editor, the REST API, or MCP
- Login and sign-up are rate limited
- Content Security Policy, HSTS, and `X-Frame-Options` on every response; admin responses are `no-store` and `noindex`
- Optional isolated admin domain via `ADMIN_URL` (see below)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router, React 19 |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Better Auth |
| API | Hono v4 + `@hono/zod-openapi` |
| AI agents | MCP SDK (`@modelcontextprotocol/sdk`) |
| Editor | Tiptap v2 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Tooling | Turborepo, pnpm 11, Biome |

## Monorepo structure

```
apps/
  web/           site + admin panel at /admin   (port 3000)
  docs/          documentation                  (port 3002)
packages/
  core/          Drizzle schema, migrations, types, validators
  api/           Hono routes, OpenAPI, MCP server, repositories
  ui/            shared shadcn/ui components
  config/        shared tsconfig and Biome config
  theme-engine/  ThemeConfig interface
themes/
  default/       reference theme
```

## Quick start

**Requirements:** Node.js 24+, pnpm 11+, a PostgreSQL database (for example a free Supabase project)

```bash
git clone https://github.com/pebisnice/nextpress.git
cd nextpress
pnpm install

cp .env.example apps/web/.env.local
# Fill in the values (see Environment variables below)

pnpm db:migrate
pnpm dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin (the first visit creates your administrator account)

## Environment variables

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL of the site, no trailing slash |
| `NEXT_PUBLIC_SITE_NAME` | no | Site name used in metadata, default `NextPress` |
| `BETTER_AUTH_SECRET` | yes | Session signing secret, at least 32 characters |
| `NEXTPRESS_API_KEY` | yes | REST API and MCP key, at least 32 characters |
| `ADMIN_URL` | no | Serve the admin panel only on its own domain |
| `REDIS_URL` | no | Shared rate limiting across instances |
| `STORAGE_DRIVER` | no | `local` (default, development) or `s3` |
| `S3_ENDPOINT` | with `s3` | S3 endpoint without bucket |
| `S3_REGION` | no | `auto` (default) for R2, bucket region for AWS |
| `S3_BUCKET` | with `s3` | Bucket name |
| `S3_ACCESS_KEY_ID` | with `s3` | Access key |
| `S3_SECRET_ACCESS_KEY` | with `s3` | Secret key |
| `S3_PUBLIC_URL` | with `s3` | Public base URL that serves the bucket |
| `MAX_UPLOAD_SIZE_MB` | no | Upload limit, default `4` |

Generate secrets with `openssl rand -base64 32`.

### Isolated admin domain

By default the admin panel is served at `/admin` on the public domain, like WordPress. For stricter setups, set `ADMIN_URL=https://admin.yourdomain.com` and point that domain at the same deployment:

| URL | Result |
|---|---|
| `yourdomain.com/` | Public site |
| `yourdomain.com/admin` | 404 |
| `admin.yourdomain.com/` | Admin panel |

Session cookies are then bound to the admin domain, so the public site and the admin panel no longer share an origin.

### Stateless by design

No app keeps state on its own server, so every instance is disposable and you can scale horizontally:

- Content and sessions live in PostgreSQL.
- Media lives in any S3-compatible storage (Cloudflare R2, AWS S3, MinIO, Supabase Storage, Backblaze B2).
- Rate limits live in Redis when `REDIS_URL` is set.
- `GET /api/health` checks the database and Redis, for load balancers and uptime monitors.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run the site, admin panel, and docs in development mode |
| `pnpm build` | Build everything |
| `pnpm typecheck` | Type-check every package |
| `pnpm exec biome lint .` | Lint |
| `pnpm format` | Format with Biome |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply migrations |

## Deploy to Vercel

1. Import this repository as a Vercel project and set the root directory to `apps/web`.
2. Add the environment variables from the table above, with `STORAGE_DRIVER=s3`.
3. Run the migrations once against your production database: `DATABASE_URL=... pnpm db:migrate`
4. Deploy, then open `/admin` to create your administrator account.

Vercel detects Next.js, Turborepo, and pnpm automatically.

## API & MCP

| Endpoint | Description |
|---|---|
| `/api/docs` | Swagger UI |
| `/api/openapi.json` | OpenAPI 3.0 spec |
| `/api/mcp` | MCP server |
| `/api/health` | Health check (no API key needed) |

Send `X-Api-Key: <NEXTPRESS_API_KEY>` with every API and MCP request.

### Connect an MCP client

```json
{
  "mcpServers": {
    "nextpress": {
      "url": "https://your-site.com/api/mcp",
      "headers": { "X-Api-Key": "your-key" }
    }
  }
}
```

## Building a theme

Themes implement the `ThemeConfig` interface from `@nextpress/theme-engine`:

```ts
import { defineTheme } from "@nextpress/theme-engine"

export const theme = defineTheme({
  name: "my-theme",
  version: "1.0.0",
  supports: ["blog"],
  slots: { Layout, Header, Footer, PostCard, PostDetail, CategoryPage, TagPage, HomePage },
})
```

See the [theme development guide](apps/docs/content/docs/theme-development/index.mdx), or call the MCP tool `get_theme_spec` for the full interface schema.

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make sure `pnpm exec biome lint .`, `pnpm exec biome format .`, and `pnpm typecheck` pass
4. Commit using [Conventional Commits](https://www.conventionalcommits.org): `feat: add X`
5. Open a pull request

## License

MIT
