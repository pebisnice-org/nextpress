import type { Metadata } from "next"
import Link from "next/link"
import { PageRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Badge } from "@nextpress/ui/badge"
import { Button } from "@nextpress/ui/button"
import { Pencil, Plus } from "lucide-react"

export const metadata: Metadata = { title: "Pages" }
export const dynamic = "force-dynamic"

export default async function PagesPage() {
  const pages = await new PageRepository(db).findMany()

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pages.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="mr-2 size-4" /> New Page
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {pages.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No pages yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Slug
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Updated
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{page.title}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    /{page.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>
                      {page.status}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/pages/${page.id}`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
