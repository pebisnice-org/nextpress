import { MediaRepository } from "@nextpress/api"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { env } from "@/lib/env"
import { putObject } from "@/lib/storage"

const allowedTypes =
  /^(image\/(png|jpe?g|gif|webp|avif)|video\/(mp4|webm)|audio\/mpeg|application\/pdf)$/

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json(await new MediaRepository(db).findMany())
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 })
  if (!allowedTypes.test(file.type)) {
    return Response.json({ error: "File type not allowed" }, { status: 415 })
  }
  if (file.size > env.MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return Response.json(
      { error: `File exceeds ${env.MAX_UPLOAD_SIZE_MB} MB limit` },
      { status: 413 }
    )
  }

  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "bin"
  const url = await putObject(`${crypto.randomUUID()}.${ext}`, await file.arrayBuffer(), file.type)

  const media = await new MediaRepository(db).create({
    filename: file.name,
    url,
    mimeType: file.type,
    size: file.size,
  })

  return Response.json(media, { status: 201 })
}
