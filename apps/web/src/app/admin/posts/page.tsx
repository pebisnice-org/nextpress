import type { Metadata } from "next"
import Link from "next/link"
import { PostRepository } from "@nextpress/api"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Badge } from "@nextpress/ui/badge"
import { Button } from "@nextpress/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"

export const metadata: Metadata = { title: "Posts" }
export const dynamic = "force-dynamic"

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const repo = new PostRepository(db)
  const posts = await repo.findMany({
    status: (status as "draft" | "published" | undefined) ?? undefined,
    limit: 50,
    offset: 0,
  })

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 size-4" /> New Post
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        {["", "published", "draft"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/posts?status=${s}` : "/admin/posts"}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? "") === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No posts yet.</p>
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
                  Created
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    /{post.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/posts/${post.id}`}>
                          <Pencil className="size-3.5" />
                        </Link>
                      </Button>
                      <form action={`/api/admin/posts/${post.id}`} method="DELETE">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          formMethod="DELETE"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </form>
                    </div>
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
