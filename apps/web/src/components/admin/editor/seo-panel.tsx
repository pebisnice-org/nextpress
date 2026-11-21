"use client"

import { Input } from "@nextpress/ui/input"
import { Label } from "@nextpress/ui/label"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"

interface SeoPanelProps {
  title: string
  slug: string
  metaTitle: string
  metaDescription: string
  focusKeyphrase: string
  onMetaTitleChange: (v: string) => void
  onMetaDescriptionChange: (v: string) => void
  onFocusKeyphraseChange: (v: string) => void
}

function counterColor(len: number, min: number, max: number) {
  if (len === 0) return "text-muted-foreground"
  if (len >= min && len <= max) return "text-green-600 dark:text-green-400"
  if (len > max) return "text-red-500"
  return "text-yellow-500"
}

function counterBar(len: number, max: number) {
  const pct = Math.min((len / max) * 100, 100)
  const color = len > max ? "bg-red-500" : len >= max * 0.75 ? "bg-green-500" : "bg-yellow-400"
  return { pct, color }
}

function highlight(text: string, keyphrase: string) {
  if (!keyphrase.trim() || !text) return text
  const escaped = keyphrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return parts.map((part) => {
    if (part.toLowerCase() !== keyphrase.toLowerCase()) return part
    return (
      <mark key={part} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
        {part}
      </mark>
    )
  })
}

export function SeoPanel({
  title,
  slug,
  metaTitle,
  metaDescription,
  focusKeyphrase,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onFocusKeyphraseChange,
}: SeoPanelProps) {
  const [origin, setOrigin] = useState("")
  useEffect(() => setOrigin(window.location.origin), [])
  const displayTitle = metaTitle || title || "Post title"
  const displayDesc =
    metaDescription || "No description set — add one to improve click-through rate."
  const displayUrl = `${origin}/blog/${slug || "post-slug"}`

  const titleLen = displayTitle.length
  const descLen = metaDescription.length
  const titleBar = counterBar(titleLen, 60)
  const descBar = counterBar(descLen, 160)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Google Preview</h3>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 space-y-0.5">
          <p className="truncate text-xs text-muted-foreground">{displayUrl}</p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 leading-snug line-clamp-1">
            {highlight(displayTitle, focusKeyphrase)}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {highlight(displayDesc, focusKeyphrase)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold">SEO</h3>

        <div>
          <Label htmlFor="focusKeyphrase" className="text-xs">
            Focus Keyphrase
          </Label>
          <Input
            id="focusKeyphrase"
            value={focusKeyphrase}
            onChange={(e) => onFocusKeyphraseChange(e.target.value)}
            className="mt-1 text-sm"
            placeholder="main keyword..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Keyphrase highlighted in preview above
          </p>
        </div>

        <div>
          <Label htmlFor="metaTitle" className="text-xs">
            SEO Title
          </Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            maxLength={70}
            className="mt-1 text-sm"
            placeholder={title || "Post title"}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${titleBar.color}`}
                style={{ width: `${titleBar.pct}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums ${counterColor(titleLen, 50, 60)}`}>
              {titleLen}/60
            </span>
          </div>
          {titleLen > 0 && titleLen < 50 && (
            <p className="mt-1 text-xs text-yellow-500">Too short — aim for 50–60 characters</p>
          )}
          {titleLen > 60 && (
            <p className="mt-1 text-xs text-red-500">
              Too long — may be truncated in search results
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="metaDescription" className="text-xs">
            Meta Description
          </Label>
          <textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            rows={3}
            maxLength={170}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Description for search engines..."
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${descBar.color}`}
                style={{ width: `${descBar.pct}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums ${counterColor(descLen, 120, 160)}`}>
              {descLen}/160
            </span>
          </div>
          {descLen > 0 && descLen < 120 && (
            <p className="mt-1 text-xs text-yellow-500">Too short — aim for 120–160 characters</p>
          )}
          {descLen > 160 && (
            <p className="mt-1 text-xs text-red-500">Too long — may be truncated</p>
          )}
        </div>
      </div>
    </div>
  )
}
