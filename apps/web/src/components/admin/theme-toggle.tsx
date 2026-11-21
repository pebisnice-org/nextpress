"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const active = mounted ? theme : undefined

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-border p-1 ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-md p-1.5 transition-colors hover:bg-muted ${active === "light" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`rounded-md p-1.5 transition-colors hover:bg-muted ${active === "system" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        aria-label="System mode"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-md p-1.5 transition-colors hover:bg-muted ${active === "dark" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  )
}
