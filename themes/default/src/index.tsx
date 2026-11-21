import { defineTheme } from "@nextpress/theme-engine"
import { Layout } from "./components/layout"
import { PostCard } from "./components/post-card"
import { PostDetail } from "./components/post-detail"

export const theme = defineTheme({
  name: "default",
  version: "0.1.0",
  supports: ["blog"],
  slots: {
    Layout,
    Header: ({ siteName }) => (
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="font-bold">
            {siteName}
          </a>
        </div>
      </header>
    ),
    Footer: ({ siteName }) => (
      <footer className="border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteName}
        </div>
      </footer>
    ),
    PostCard,
    PostDetail,
    CategoryPage: ({ taxonomy, posts }) => (
      <div>
        <h1 className="text-2xl font-bold mb-6">{taxonomy.name}</h1>
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    ),
    TagPage: ({ taxonomy, posts }) => (
      <div>
        <h1 className="text-2xl font-bold mb-6">#{taxonomy.name}</h1>
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    ),
    HomePage: ({ posts }) => (
      <div>
        <h1 className="text-3xl font-bold mb-8">Latest</h1>
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    ),
  },
})

export default theme
export { Layout } from "./components/layout"
export { PostCard } from "./components/post-card"
export { PostDetail } from "./components/post-detail"
