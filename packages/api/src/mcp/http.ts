import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import type { Database } from "@nextpress/core/db"
import { isValidApiKey } from "../middleware/auth"
import { createMcpServer } from "./server"

export async function handleMcpRequest(db: Database, request: Request) {
  if (!isValidApiKey(request.headers.get("X-Api-Key"))) {
    return Response.json({ error: "Invalid or missing X-Api-Key header" }, { status: 401 })
  }
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  })
  await createMcpServer(db).connect(transport)
  return transport.handleRequest(request)
}
