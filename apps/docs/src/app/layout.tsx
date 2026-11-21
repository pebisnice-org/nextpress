import type { Metadata } from "next"
import { RootProvider } from "fumadocs-ui/provider"
import "fumadocs-ui/style.css"

export const metadata: Metadata = {
  title: { template: "%s | NextPress Docs", default: "NextPress Docs" },
  description: "Documentation for NextPress — AI-first open source CMS",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
