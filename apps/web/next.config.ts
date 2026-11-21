import type { NextConfig } from "next"

const dev = process.env.NODE_ENV !== "production"

function csp(extra: { script?: string; style?: string } = {}) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}${extra.script ? ` ${extra.script}` : ""}`,
    `style-src 'self' 'unsafe-inline'${extra.style ? ` ${extra.style}` : ""}`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ")
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp() },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/api/docs",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp({ script: "https://cdn.jsdelivr.net", style: "https://cdn.jsdelivr.net" }),
          },
        ],
      },
    ]
  },
  transpilePackages: [
    "@nextpress/ui",
    "@nextpress/core",
    "@nextpress/api",
    "@nextpress/theme-default",
    "@nextpress/theme-engine",
  ],
}

export default nextConfig
