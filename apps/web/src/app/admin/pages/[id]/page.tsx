"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@nextpress/ui/button"
import { Input } from "@nextpress/ui/input"
import { Label } from "@nextpress/ui/label"
import { TiptapEditor } from "@/components/admin/editor/tiptap-editor"
import { Trash2 } from "lucide-react"

export default function EditPagePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("draft")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setTitle(p.title ?? "")
        setSlug(p.slug ?? "")
        setContent(p.content ?? "")
        setStatus(p.status ?? "draft")
        setMetaTitle(p.metaTitle ?? "")
        setMetaDescription(p.metaDescription ?? "")
        setLoading(false)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          status,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
        }),
      })
      if (!res.ok) {
        setError((await res.json()).error ?? "Failed")
        return
      }
      router.push("/admin/pages")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this page?")) return
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" })
    router.push("/admin/pages")
  }

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Page</h1>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 size-4" /> Delete
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div>
            <Label>Content</Label>
            <div className="mt-1">
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Update Page"}
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <h3 className="text-sm font-semibold">SEO</h3>
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                maxLength={160}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
