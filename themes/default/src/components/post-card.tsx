import type { PostCardProps } from "@nextpress/theme-engine"

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {post.coverImage && (
        <div className="overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h2 className="text-lg font-semibold leading-snug line-clamp-2">
          <a href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </a>
        </h2>
        {post.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}
        {post.publishedAt && (
          <time
            dateTime={post.publishedAt.toISOString()}
            className="text-xs text-muted-foreground mt-auto pt-2 border-t"
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>
    </article>
  )
}
