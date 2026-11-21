import type { PostDetailProps } from "@nextpress/theme-engine"

export function PostDetail({ post, relatedPosts = [] }: PostDetailProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-4">
        <a
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          ← All posts
        </a>
        <h1 className="text-3xl font-bold tracking-tight leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <time
            dateTime={post.publishedAt.toISOString()}
            className="text-sm text-muted-foreground block"
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full rounded-xl mb-8 object-cover max-h-96"
        />
      )}

      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitized by the repository on write
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {relatedPosts.length > 0 && (
        <aside className="mt-16 pt-8 border-t space-y-4">
          <h2 className="text-xl font-semibold">Related Posts</h2>
          <ul className="space-y-3">
            {relatedPosts.map((p) => (
              <li key={p.id}>
                <a
                  href={`/blog/${p.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}
