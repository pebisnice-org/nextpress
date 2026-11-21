"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@nextpress/ui/button"
import { Input } from "@nextpress/ui/input"
import { Label } from "@nextpress/ui/label"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

type MenuItem = { id: string; label: string; url: string }
type Menu = { id: string; name: string; slug: string; items: string }

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [items, setItems] = useState<MenuItem[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [creating, setCreating] = useState(false)
  const [newMenuName, setNewMenuName] = useState("")
  const [saving, setSaving] = useState(false)

  async function fetchMenus() {
    const res = await fetch("/api/admin/menus")
    const data = await res.json()
    setMenus(Array.isArray(data) ? data : [])
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchMenus is stable
  useEffect(() => {
    fetchMenus()
  }, [])

  function selectMenu(menu: Menu) {
    setSelected(menu.id)
    setName(menu.name)
    try {
      setItems(JSON.parse(menu.items) as MenuItem[])
    } catch {
      setItems([])
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMenuName, slug: toSlug(newMenuName) }),
    })
    const menu = await res.json()
    setMenus((prev) => [...prev, menu])
    setCreating(false)
    setNewMenuName("")
    selectMenu(menu)
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/menus/${selected}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, items: JSON.stringify(items) }),
    })
    setSaving(false)
    await fetchMenus()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu?")) return
    await fetch(`/api/admin/menus/${id}`, { method: "DELETE" })
    setMenus((prev) => prev.filter((m) => m.id !== id))
    if (selected === id) {
      setSelected(null)
      setItems([])
    }
  }

  function addItem() {
    if (!newLabel || !newUrl) return
    setItems((prev) => [...prev, { id: Date.now().toString(), label: newLabel, url: newUrl }])
    setNewLabel("")
    setNewUrl("")
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target] as MenuItem, next[idx] as MenuItem]
    setItems(next)
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menus</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 size-4" /> New Menu
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            placeholder="Menu name"
            required
            className="max-w-xs"
          />
          <Button type="submit">Create</Button>
          <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
            Cancel
          </Button>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-1">
          {menus.length === 0 && <p className="text-sm text-muted-foreground">No menus yet.</p>}
          {menus.map((menu) => (
            <div key={menu.id} className="relative flex items-center rounded-lg transition-colors">
              <button
                type="button"
                onClick={() => selectMenu(menu)}
                className={`flex-1 truncate rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${selected === menu.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {menu.name}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(menu.id)}
                className={`absolute right-1 p-1 ${selected === menu.id ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-destructive"}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        {selected ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="menu-name">Menu Name</Label>
              <Input
                id="menu-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 max-w-sm"
              />
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label"
                className="max-w-[160px]"
              />
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="/url or https://..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="size-4" />
              </Button>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Menu"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a menu to edit.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
