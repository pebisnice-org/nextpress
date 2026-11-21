import type { ComponentType } from "react"
import type { Post, Page, Taxonomy } from "@nextpress/core/types"

export interface LayoutProps {
  children: React.ReactNode
  siteName: string
  navigation?: Array<{ label: string; href: string }>
}

export interface HeaderProps {
  siteName: string
  navigation?: Array<{ label: string; href: string }>
}

export interface FooterProps {
  siteName: string
  links?: Array<{ label: string; href: string }>
}

export interface PostCardProps {
  post: Post
}

export interface PostDetailProps {
  post: Post
  relatedPosts?: Post[]
}

export interface CategoryPageProps {
  taxonomy: Taxonomy
  posts: Post[]
}

export interface TagPageProps {
  taxonomy: Taxonomy
  posts: Post[]
}

export interface HomePageProps {
  posts: Post[]
  pages: Page[]
  featuredPost?: Post
}

export interface ThemeConfig {
  name: string
  version: string
  supports: Array<"blog" | "landing" | "store">
  slots: {
    Layout: ComponentType<LayoutProps>
    Header: ComponentType<HeaderProps>
    Footer: ComponentType<FooterProps>
    PostCard: ComponentType<PostCardProps>
    PostDetail: ComponentType<PostDetailProps>
    CategoryPage: ComponentType<CategoryPageProps>
    TagPage: ComponentType<TagPageProps>
    HomePage: ComponentType<HomePageProps>
  }
}

export function defineTheme(config: ThemeConfig): ThemeConfig {
  return config
}
