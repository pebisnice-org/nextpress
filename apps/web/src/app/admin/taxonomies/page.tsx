"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@nextpress/ui/button"
import { Input } from "@nextpress/ui/input"
import { Label } from "@nextpress/ui/label"
import { Trash2, Plus } from "lucide-react"

type Taxonomy = { id: string; name: string; slug: string; type: string; description: string | null }

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function TaxTab({ type }: { type: "category" | "tag" }) {
  const [items, setItems] = useState<Taxonomy[]>([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/admin/taxonomies?type=${type}`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
  }, [type])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, type, description: description || undefined }),
      })
      if (!res.ok) {
        setError((await res.json()).error ?? "Failed")
        return
      }
      const item = await res.json()
      setItems((prev) => [item, ...prev])
      setName("")
      setSlug("")
      setDescription("")
      setSlugEdited(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete this ${type}?`)) return
    await fetch(`/api/admin/taxonomies/${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No {type}s yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Slug
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {item.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-xl border border-border bg-card p-4 space-y-4 h-fit"
      >
        <h3 className="text-sm font-semibold">
          Add New {type === "category" ? "Category" : "Tag"}
        </h3>
        <div>
          <Label htmlFor={`${type}-name`}>Name</Label>
          <Input
            id={`${type}-name`}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugEdited) setSlug(toSlug(e.target.value))
            }}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${type}-slug`}>Slug</Label>
          <Input
            id={`${type}-slug`}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugEdited(true)
            }}
            required
            pattern="[a-z0-9-]+"
            className="mt-1 font-mono text-sm"
          />
        </div>
        <div>
          <Label htmlFor={`${type}-desc`}>Description</Label>
          <textarea
            id={`${type}-desc`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          <Plus className="mr-2 size-4" />{" "}
          {saving ? "Adding..." : `Add ${type === "category" ? "Category" : "Tag"}`}
        </Button>
      </form>
    </div>
  )
}

export default function TaxonomiesPage() {
  const [tab, setTab] = useState<"category" | "tag">("category")

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Taxonomies</h1>
      <div className="flex gap-2">
        {(["category", "tag"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {t === "category" ? "Categories" : "Tags"}
          </button>
        ))}
      </div>
      <TaxTab type={tab} />
    </DashboardLayout>
  )
}
