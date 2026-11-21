import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

const disallow = ["/admin", "/api/"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ["*", "GPTBot", "ClaudeBot", "PerplexityBot", "Googlebot"].map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow,
    })),
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
}
