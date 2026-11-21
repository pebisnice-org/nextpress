import { Layout } from "@nextpress/theme-default"
import "./site.css"
import { env } from "@/lib/env"

const navigation = [{ label: "Blog", href: "/blog" }]

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout siteName={env.NEXT_PUBLIC_SITE_NAME} navigation={navigation}>
      {children}
    </Layout>
  )
}
