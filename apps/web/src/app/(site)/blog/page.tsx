import type { Metadata } from "next"
import { PostRepository } from "@nextpress/api"
import { PostCard } from "@nextpress/theme-default"
import { db } from "@/lib/db"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog",
  description: "All blog posts",
}

export default async function BlogPage() {
  const repo = new PostRepository(db)
  const posts = await repo.findMany({ status: "published", limit: 20, offset: 0 })

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground mt-2">{posts.length} articles published</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
