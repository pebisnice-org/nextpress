import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PostRepository } from "@nextpress/api"
import { PostDetail } from "@nextpress/theme-default"
import { db } from "@/lib/db"

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const repo = new PostRepository(db)
  const post = await repo.findBySlug(slug)
  if (!post) return {}
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage
        ? [{ url: post.coverImage }]
        : [{ url: `/og?title=${encodeURIComponent(post.title)}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const repo = new PostRepository(db)
  const post = await repo.findBySlug(slug)
  if (!post || post.status !== "published") notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD with < escaped
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PostDetail post={post} />
    </>
  )
}
