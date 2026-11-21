import type { Metadata } from "next"
import { env } from "@/lib/env"

export const metadata: Metadata = {
  title: {
    template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}`,
    default: env.NEXT_PUBLIC_SITE_NAME,
  },
  description: "AI-first open source CMS",
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
