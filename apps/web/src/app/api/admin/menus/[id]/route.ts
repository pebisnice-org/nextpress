import { MenuRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"

type Params = { params: Promise<{ id: string }> }

const updateMenuSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  items: z.string().optional(),
})

async function guard(request: Request) {
  return auth.api.getSession({ headers: request.headers })
}

export async function GET(request: Request, { params }: Params) {
  if (!(await guard(request))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const menu = await new MenuRepository(db).findById(id)
  if (!menu) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(menu)
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await guard(request))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const parsed = updateMenuSchema.parse(await request.json())
  const input = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined)) as {
    name?: string
    slug?: string
    items?: string
  }
  const menu = await new MenuRepository(db).update(id, input)
  if (!menu) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(menu)
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await guard(request))) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await new MenuRepository(db).delete(id)
  return new Response(null, { status: 204 })
}
