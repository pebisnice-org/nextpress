import { handle } from "hono/vercel"
import { createApp } from "@nextpress/api"
import { db } from "@/lib/db"

export const runtime = "nodejs"

const app = createApp(db)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
