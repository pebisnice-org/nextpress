import { ImageResponse } from "@vercel/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title") ?? "NextPress"

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#0f172a",
        color: "#f8fafc",
        fontSize: 48,
        fontWeight: 700,
        padding: "0 60px",
      }}
    >
      {title}
    </div>,
    { width: 1200, height: 630 }
  )
}
