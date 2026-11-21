"use client"

import { useEffect, useRef, useState } from "react"
import { DashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@nextpress/ui/button"
import { Trash2, Copy, Upload, FileIcon } from "lucide-react"

type MediaItem = {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  alt: string | null
  createdAt: string
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function fetchMedia() {
    const res = await fetch("/api/admin/media")
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchMedia is stable
  useEffect(() => {
    fetchMedia()
  }, [])

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append("file", file)
      await fetch("/api/admin/media", { method: "POST", body: form })
    }
    await fetchMedia()
    setUploading(false)
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this file?")) return
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(new URL(url, window.location.origin).href)
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} files</p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 size-4" /> {uploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          upload(e.dataTransfer.files)
        }}
        className={`flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <p className="text-sm text-muted-foreground">Drop files here or click Upload</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-sm"
            >
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                {item.mimeType.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.alt ?? item.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileIcon className="size-10 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium">{item.filename}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {(item.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => copyUrl(item.url)}
                  className="flex size-7 items-center justify-center rounded-md bg-background/90 backdrop-blur shadow-sm hover:bg-muted"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="flex size-7 items-center justify-center rounded-md bg-background/90 backdrop-blur shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
