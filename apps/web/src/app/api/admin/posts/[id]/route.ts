import { PostRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { updatePostSchema } from "@nextpress/core/validators"

type Params = { params: Promise<{ id: string }> }

async function getSession(request: Request) {
  return auth.api.getSession({ headers: request.headers })
}

export async function GET(request: Request, { params }: Params) {
  const session = await getSession(request)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const post = await new PostRepository(db).findById(id)
  if (!post) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(post)
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession(request)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const input = updatePostSchema.parse(body)
  const post = await new PostRepository(db).update(id, input)
  if (!post) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(post)
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getSession(request)
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await new PostRepository(db).delete(id)
  return new Response(null, { status: 204 })
}
