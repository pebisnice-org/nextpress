"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FileText, File, Image, Tag, Plus, PenSquare } from "lucide-react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"

type Stats = {
  totalPosts: number
  publishedPosts: number
  totalPages: number
  totalMedia: number
  totalTaxonomies: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/admin/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const kpiCards = [
    {
      label: "Total Posts",
      icon: FileText,
      value: stats?.totalPosts ?? "—",
      href: "/admin/posts",
      sub: `${stats?.publishedPosts ?? 0} published`,
    },
    {
      label: "Pages",
      icon: File,
      value: stats?.totalPages ?? "—",
      href: "/admin/pages",
      sub: "static pages",
    },
    {
      label: "Media Files",
      icon: Image,
      value: stats?.totalMedia ?? "—",
      href: "/admin/media",
      sub: "uploaded files",
    },
    {
      label: "Taxonomies",
      icon: Tag,
      value: stats?.totalTaxonomies ?? "—",
      href: "/admin/taxonomies",
      sub: "categories & tags",
    },
  ]

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome to NextPress Admin</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, icon: Icon, value, href, sub }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="size-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Quick Actions</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: "New Post", href: "/admin/posts/new", icon: PenSquare },
              { label: "New Page", href: "/admin/pages/new", icon: Plus },
              { label: "Upload Media", href: "/admin/media", icon: Image },
              { label: "Settings", href: "/admin/settings", icon: Tag },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:border-primary/30"
              >
                <Icon className="size-4 text-primary" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Getting Started</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              <Link href="/admin/settings" className="text-primary hover:underline">
                Configure site settings
              </Link>
            </li>
            <li>
              <Link href="/admin/taxonomies" className="text-primary hover:underline">
                Create categories and tags
              </Link>
            </li>
            <li>
              <Link href="/admin/posts/new" className="text-primary hover:underline">
                Write your first post
              </Link>
            </li>
            <li>
              <Link href="/admin/media" className="text-primary hover:underline">
                Upload media files
              </Link>
            </li>
            <li>
              <Link href="/admin/menus" className="text-primary hover:underline">
                Set up navigation menus
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  )
}
