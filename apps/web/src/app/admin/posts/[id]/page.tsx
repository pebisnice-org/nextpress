"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@nextpress/ui/button"
import { Input } from "@nextpress/ui/input"
import { Label } from "@nextpress/ui/label"
import { TiptapEditor } from "@/components/admin/editor/tiptap-editor"
import { SeoPanel } from "@/components/admin/editor/seo-panel"
import { Tag, X, FileText, LayoutGrid, Film, Music2, Globe, Lock, EyeOff, Eye } from "lucide-react"

type Taxonomy = { id: string; name: string; slug: string; type: string }
type ScreenOpts = {
  format: boolean
  categories: boolean
  tags: boolean
  excerpt: boolean
  seo: boolean
}

const POST_FORMATS = [
  { value: "standard", label: "Standard", icon: FileText },
  { value: "gallery", label: "Gallery", icon: LayoutGrid },
  { value: "video", label: "Video", icon: Film },
  { value: "audio", label: "Audio", icon: Music2 },
]

const SCREEN_OPTS_KEY = "nextpress-screen-options-post"

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function EditPostPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [editingSlug, setEditingSlug] = useState(false)
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [status, setStatus] = useState("draft")
  const [format, setFormat] = useState("standard")
  const [visibility, setVisibility] = useState<"public" | "private" | "password">("public")
  const [password, setPassword] = useState("")
  const [publishDate, setPublishDate] = useState("")
  const [showStatus, setShowStatus] = useState(false)
  const [showVisibility, setShowVisibility] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const [showScreenOpts, setShowScreenOpts] = useState(false)
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [focusKeyphrase, setFocusKeyphrase] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Taxonomy[]>([])
  const [tags, setTags] = useState<Taxonomy[]>([])
  const [selectedTaxIds, setSelectedTaxIds] = useState<Set<string>>(new Set())
  const [tagInput, setTagInput] = useState("")
  const [screenOpts, setScreenOpts] = useState<ScreenOpts>({
    format: true,
    categories: true,
    tags: true,
    excerpt: true,
    seo: true,
  })

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((r) => r.json())
      .then((post) => {
        setTitle(post.title ?? "")
        setSlug(post.slug ?? "")
        setContent(post.content ?? "")
        setExcerpt(post.excerpt ?? "")
        setStatus(post.status ?? "draft")
        setMetaTitle(post.metaTitle ?? "")
        setMetaDescription(post.metaDescription ?? "")
        if (post.taxonomyIds?.length) setSelectedTaxIds(new Set(post.taxonomyIds))
        setLoading(false)
      })
    fetch("/api/admin/taxonomies?type=category")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
    fetch("/api/admin/taxonomies?type=tag")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {})
    try {
      const saved = localStorage.getItem(SCREEN_OPTS_KEY)
      if (saved) setScreenOpts(JSON.parse(saved))
    } catch {}
  }, [id])

  function toggleTax(taxId: string) {
    setSelectedTaxIds((prev) => {
      const next = new Set(prev)
      if (next.has(taxId)) next.delete(taxId)
      else next.add(taxId)
      return next
    })
  }

  function addTagByName(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      toggleTax(existing.id)
    } else {
      const tagSlug = toSlug(trimmed)
      fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, slug: tagSlug, type: "tag" }),
      })
        .then((r) => r.json())
        .then((tag: Taxonomy) => {
          setTags((prev) => [...prev, tag])
          setSelectedTaxIds((prev) => new Set([...prev, tag.id]))
        })
        .catch(() => {})
    }
    setTagInput("")
  }

  function updateScreenOpts(key: keyof ScreenOpts, val: boolean) {
    const next = { ...screenOpts, [key]: val }
    setScreenOpts(next)
    try {
      localStorage.setItem(SCREEN_OPTS_KEY, JSON.stringify(next))
    } catch {}
  }

  async function save(overrideStatus?: string) {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || undefined,
          content,
          status: overrideStatus ?? status,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          taxonomyIds: [...selectedTaxIds],
        }),
      })
      if (!res.ok) {
        setError((await res.json()).error ?? "Failed to save")
        return
      }
      router.push("/admin/posts")
    } finally {
      setSaving(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    save()
  }

  async function handleDelete() {
    if (!confirm("Move this post to trash?")) return
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
    router.push("/admin/posts")
  }

  const selectedTags = tags.filter((t) => selectedTaxIds.has(t.id))
  const visibilityLabel =
    visibility === "password"
      ? "Password protected"
      : visibility.charAt(0).toUpperCase() + visibility.slice(1)
  const VisibilityIcon =
    visibility === "password" ? Lock : visibility === "private" ? EyeOff : Globe
  const origin = typeof window !== "undefined" ? window.location.origin : ""

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowScreenOpts(!showScreenOpts)}
            className="text-xs"
          >
            Screen Options {showScreenOpts ? "▲" : "▼"}
          </Button>
          {showScreenOpts && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowScreenOpts(false)}
                onKeyDown={(e) => e.key === "Escape" && setShowScreenOpts(false)}
                role="presentation"
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-border bg-background p-4 shadow-lg">
                <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                  Show on screen
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {(Object.keys(screenOpts) as Array<keyof ScreenOpts>).map((key) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-1.5 text-sm capitalize"
                    >
                      <input
                        type="checkbox"
                        checked={screenOpts[key]}
                        onChange={(e) => updateScreenOpts(key, e.target.checked)}
                      />
                      {key}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-xl font-medium"
              placeholder="Post title"
            />
          </div>

          {slug && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Permalink:</span>
              {editingSlug ? (
                <>
                  <span className="text-muted-foreground">{origin}/blog/</span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    pattern="[a-z0-9-]+"
                    className="h-7 w-40 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditingSlug(false)}
                  >
                    OK
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditingSlug(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <a
                    href={`${origin}/blog/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {origin}/blog/{slug}
                  </a>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => setEditingSlug(true)}
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          )}

          <div>
            <div className="mt-1">
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </div>

          {screenOpts.excerpt && (
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Short summary shown in post lists..."
              />
            </div>
          )}

          {screenOpts.seo && (
            <SeoPanel
              title={title}
              slug={slug}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              focusKeyphrase={focusKeyphrase}
              onMetaTitleChange={setMetaTitle}
              onMetaDescriptionChange={setMetaDescription}
              onFocusKeyphraseChange={setFocusKeyphrase}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Publish</h3>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  disabled={saving}
                  onClick={() => save("draft")}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => window.open(`/${slug}/`, "_blank")}
                >
                  <Eye className="mr-1 size-3.5" /> Preview
                </Button>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-start justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  {showStatus ? (
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded border border-input bg-background px-2 py-1 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setShowStatus(false)}
                        >
                          OK
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => setShowStatus(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="capitalize">{status}</span>
                      <button
                        type="button"
                        onClick={() => setShowStatus(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Visibility:</span>
                {showVisibility ? (
                  <div className="flex flex-col gap-1.5">
                    {(
                      [
                        { value: "public", label: "Public", Icon: Globe },
                        { value: "password", label: "Password protected", Icon: Lock },
                        { value: "private", label: "Private", Icon: EyeOff },
                      ] as const
                    ).map(({ value, label, Icon }) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                          type="radio"
                          name="visibility"
                          value={value}
                          checked={visibility === value}
                          onChange={() => setVisibility(value)}
                        />
                        <Icon className="size-3" /> {label}
                      </label>
                    ))}
                    {visibility === "password" && (
                      <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="mt-1 h-7 text-xs"
                      />
                    )}
                    <div className="flex gap-1 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowVisibility(false)}
                      >
                        OK
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowVisibility(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <VisibilityIcon className="size-3.5 text-muted-foreground" />
                    <span>{visibilityLabel}</span>
                    <button
                      type="button"
                      onClick={() => setShowVisibility(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between text-sm">
                <span className="text-muted-foreground">Publish:</span>
                {showDate ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="datetime-local"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="rounded border border-input bg-background px-2 py-1 text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowDate(false)}
                      >
                        OK
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowDate(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <span>
                      {publishDate
                        ? new Date(publishDate).toLocaleDateString()
                        : status === "published"
                          ? "Published"
                          : "Immediately"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDate(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </span>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="border-t border-border pt-3 space-y-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Update"}
                </Button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full text-xs text-destructive hover:underline"
                >
                  Move to Trash
                </button>
              </div>
            </div>
          </div>

          {screenOpts.format && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">Format</h3>
              <div className="space-y-2">
                {POST_FORMATS.map(({ value, label, icon: Icon }) => (
                  <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={value}
                      checked={format === value}
                      onChange={() => setFormat(value)}
                      className="accent-primary"
                    />
                    <Icon className="size-3.5 text-muted-foreground" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {screenOpts.categories && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">Categories</h3>
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No categories yet.{" "}
                  <a href="/admin/taxonomies" className="text-primary hover:underline">
                    Add one
                  </a>
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTaxIds.has(cat.id)}
                        onChange={() => toggleTax(cat.id)}
                        className="accent-primary rounded"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              )}
              <a href="/admin/taxonomies" className="text-xs text-primary hover:underline">
                + Add New Category
              </a>
            </div>
          )}

          {screenOpts.tags && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">Tags</h3>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => toggleTax(tag.id)}
                        className="hover:text-destructive"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTagByName(tagInput)
                    }
                  }}
                  placeholder="Add tag..."
                  className="h-7 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addTagByName(tagInput)}
                  className="h-7 px-2"
                >
                  <Tag className="size-3" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags
                    .filter((t) => !selectedTaxIds.has(t.id))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTax(tag.id)}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </DashboardLayout>
  )
}
