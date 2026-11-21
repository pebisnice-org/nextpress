import { TaxonomyRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { updateTaxonomySchema } from "@nextpress/core/validators"

type Params = { params: Promise<{ id: string }> }

async function guard(request: Request) {
  return auth.api.getSession({ headers: request.headers })
}

export async function GET(request: Request, { params }: Params) {
  if (!(await guard(request))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const item = await new TaxonomyRepository(db).findById(id)
  if (!item) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(item)
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await guard(request))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const input = updateTaxonomySchema.parse(await request.json())
  const item = await new TaxonomyRepository(db).update(id, input)
  if (!item) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(item)
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await guard(request))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await new TaxonomyRepository(db).delete(id)
  return new Response(null, { status: 204 })
}
