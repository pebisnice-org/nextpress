import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const adminHost = process.env.ADMIN_URL ? new URL(process.env.ADMIN_URL).host : null

function isAdminPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/auth/")
  )
}

function hasSession(request: NextRequest) {
  return Boolean(
    request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value
  )
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const adminPath = isAdminPath(pathname)

  if (adminHost) {
    const onAdminHost = request.headers.get("host") === adminHost
    if (onAdminHost && !adminPath) {
      if (pathname === "/") return NextResponse.redirect(new URL("/admin", request.url))
      return NextResponse.redirect(
        new URL(`${pathname}${search}`, process.env.NEXT_PUBLIC_SITE_URL)
      )
    }
    if (!onAdminHost && adminPath) return new NextResponse(null, { status: 404 })
  }

  if (!adminPath || pathname.startsWith("/api/auth/") || pathname === "/admin/login") {
    return NextResponse.next()
  }

  if (!hasSession(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  const response = NextResponse.next()
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
