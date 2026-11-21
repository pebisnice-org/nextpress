"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@nextpress/ui/button"
import { Input } from "@nextpress/ui/input"
import { Label } from "@nextpress/ui/label"

type Tab = "general" | "seo" | "api"

type Settings = Record<string, string>

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general")
  const [settings, setSettings] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
  }, [])

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "seo", label: "SEO" },
    { key: "api", label: "API" },
  ]

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        {tab === "general" && (
          <>
            <div>
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={settings.site_title ?? ""}
                onChange={(e) => set("site_title", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="site_tagline">Tagline</Label>
              <Input
                id="site_tagline"
                value={settings.site_tagline ?? ""}
                onChange={(e) => set("site_tagline", e.target.value)}
                className="mt-1"
                placeholder="Just another NextPress site"
              />
            </div>
            <div>
              <Label htmlFor="site_url">Site URL</Label>
              <Input
                id="site_url"
                value={settings.site_url ?? ""}
                onChange={(e) => set("site_url", e.target.value)}
                type="url"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="admin_email">Admin Email</Label>
              <Input
                id="admin_email"
                value={settings.admin_email ?? ""}
                onChange={(e) => set("admin_email", e.target.value)}
                type="email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="posts_per_page">Posts Per Page</Label>
              <Input
                id="posts_per_page"
                value={settings.posts_per_page ?? "10"}
                onChange={(e) => set("posts_per_page", e.target.value)}
                type="number"
                min="1"
                max="100"
                className="mt-1 max-w-[120px]"
              />
            </div>
          </>
        )}

        {tab === "seo" && (
          <>
            <div>
              <Label htmlFor="default_meta_description">Default Meta Description</Label>
              <textarea
                id="default_meta_description"
                value={settings.default_meta_description ?? ""}
                onChange={(e) => set("default_meta_description", e.target.value)}
                rows={3}
                maxLength={160}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <Label htmlFor="ga_id">Google Analytics ID</Label>
              <Input
                id="ga_id"
                value={settings.ga_id ?? ""}
                onChange={(e) => set("ga_id", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="robots_txt">Custom robots.txt</Label>
              <textarea
                id="robots_txt"
                value={settings.robots_txt ?? ""}
                onChange={(e) => set("robots_txt", e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={"User-agent: *\nAllow: /"}
              />
            </div>
          </>
        )}

        {tab === "api" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">API Endpoint</h3>
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {settings.site_url || window.location.origin}/api
              </div>
              <p className="text-xs text-muted-foreground">
                Base URL for the Hono API and Swagger UI at /api/docs
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">MCP Server</h3>
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {settings.site_url || window.location.origin}/api/mcp
              </div>
              <p className="text-xs text-muted-foreground">
                MCP endpoint for AI agents (Claude, ChatGPT, etc.)
              </p>
            </div>
          </div>
        )}

        {tab !== "api" && (
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            {saved && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        )}
      </form>
    </DashboardLayout>
  )
}
