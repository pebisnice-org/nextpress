import { PageRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { createPageSchema } from "@nextpress/core/validators"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json(await new PageRepository(db).findMany())
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const input = createPageSchema.parse(await request.json())
  return Response.json(await new PageRepository(db).create(input), { status: 201 })
}
