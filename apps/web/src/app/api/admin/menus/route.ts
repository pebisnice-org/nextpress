import { MenuRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createMenuSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  items: z.string().optional(),
})

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json(await new MenuRepository(db).findMany())
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { name, slug, items } = createMenuSchema.parse(await request.json())
  return Response.json(
    await new MenuRepository(db).create({
      name,
      slug,
      ...(items !== undefined && { items }),
    }),
    { status: 201 }
  )
}
