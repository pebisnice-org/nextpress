import { PostRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { createPostSchema, listPostsSchema } from "@nextpress/core/validators"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const url = new URL(request.url)
  const input = listPostsSchema.parse({
    status: url.searchParams.get("status") ?? undefined,
    limit: url.searchParams.get("limit") ?? 50,
    offset: url.searchParams.get("offset") ?? 0,
  })
  const repo = new PostRepository(db)
  return Response.json(await repo.findMany(input))
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const input = createPostSchema.parse(body)
  const repo = new PostRepository(db)
  return Response.json(await repo.create(input), { status: 201 })
}
