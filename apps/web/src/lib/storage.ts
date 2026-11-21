import { mkdir, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { AwsClient } from "aws4fetch"
import { env } from "./env"

const localDir = join(process.cwd(), "public", "uploads")

const s3 =
  env.STORAGE_DRIVER === "s3"
    ? new AwsClient({
        accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
        region: env.S3_REGION,
        service: "s3",
      })
    : null

function objectEndpoint(key: string) {
  return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${encodeURIComponent(key)}`
}

export async function putObject(key: string, body: ArrayBuffer, contentType: string) {
  if (!s3) {
    await mkdir(localDir, { recursive: true })
    await writeFile(join(localDir, key), Buffer.from(body))
    return `/uploads/${key}`
  }
  const res = await s3.fetch(objectEndpoint(key), {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  })
  if (!res.ok) throw new Error(`Storage upload failed with status ${res.status}`)
  return `${env.S3_PUBLIC_URL}/${key}`
}

export async function deleteObject(url: string) {
  const key = url.split("/").pop()
  if (!key) return
  if (!s3) {
    await unlink(join(localDir, key)).catch(() => {})
    return
  }
  const res = await s3.fetch(objectEndpoint(key), { method: "DELETE" })
  if (!res.ok && res.status !== 404) {
    throw new Error(`Storage delete failed with status ${res.status}`)
  }
}
