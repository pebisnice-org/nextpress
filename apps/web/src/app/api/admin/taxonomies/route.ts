import { TaxonomyRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { createTaxonomySchema } from "@nextpress/core/validators"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const url = new URL(request.url)
  const type = url.searchParams.get("type") as "category" | "tag" | "custom" | undefined
  return Response.json(await new TaxonomyRepository(db).findMany(type ?? undefined))
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const input = createTaxonomySchema.parse(await request.json())
  return Response.json(await new TaxonomyRepository(db).create(input), { status: 201 })
}
