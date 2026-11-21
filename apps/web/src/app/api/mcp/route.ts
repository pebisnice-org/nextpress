import { handleMcpRequest } from "@nextpress/api"
import { db } from "@/lib/db"

export const runtime = "nodejs"

function handler(request: Request) {
  return handleMcpRequest(db, request)
}

export { handler as GET, handler as POST, handler as DELETE }
