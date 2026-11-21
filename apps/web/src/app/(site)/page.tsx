import { PostRepository } from "@nextpress/api"
import { PostCard } from "@nextpress/theme-default"
import { db } from "@/lib/db"

export const revalidate = 3600

export default async function HomePage() {
  const repo = new PostRepository(db)
  const posts = await repo.findMany({ status: "published", limit: 10, offset: 0 })

  return (
    <div className="space-y-12">
      <section className="py-12 text-center space-y-4 border-b">
        <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          AI-first content platform. Discover articles, guides, and more.
        </p>
        <a
          href="/blog"
          className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse all posts
        </a>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
