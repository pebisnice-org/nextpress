import { SettingsRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json(await new SettingsRepository(db).getAll())
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await request.json()) as Record<string, string>
  const repo = new SettingsRepository(db)
  await repo.setMany(Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)])))
  return Response.json(await repo.getAll())
}
