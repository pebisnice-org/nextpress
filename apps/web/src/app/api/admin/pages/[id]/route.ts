import { PageRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { updatePageSchema } from "@nextpress/core/validators"

type Params = { params: Promise<{ id: string }> }

async function requireSession(request: Request) {
  return auth.api.getSession({ headers: request.headers })
}

export async function GET(request: Request, { params }: Params) {
  if (!(await requireSession(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const page = await new PageRepository(db).findById(id)
  if (!page) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(page)
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await requireSession(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const input = updatePageSchema.parse(await request.json())
  const page = await new PageRepository(db).update(id, input)
  if (!page) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(page)
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireSession(request)))
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await new PageRepository(db).delete(id)
  return new Response(null, { status: 204 })
}
