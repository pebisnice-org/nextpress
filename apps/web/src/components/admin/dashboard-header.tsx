"use client"

import { Moon, Sun, Monitor, Bell, ChevronDown, LogOut, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Link from "next/link"

function ThemeDropdown() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-9" />

  const icon =
    theme === "dark" ? (
      <Moon className="size-5" />
    ) : theme === "light" ? (
      <Sun className="size-5" />
    ) : (
      <Monitor className="size-5" />
    )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {icon}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            role="presentation"
          />
          <div className="absolute right-0 z-20 mt-2 w-32 rounded-lg border border-border bg-background shadow-lg">
            {[
              { key: "light", icon: <Sun className="size-4" />, label: "Light" },
              { key: "system", icon: <Monitor className="size-4" />, label: "System" },
              { key: "dark", icon: <Moon className="size-4" />, label: "Dark" },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTheme(key)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg ${theme === key ? "text-primary font-medium" : "text-foreground"}`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function UserDropdown() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  useEffect(() => {
    setMounted(true)
    fetch("/api/auth/get-session")
      .then((r) => r.json())
      .then((s) => setUser(s?.user ?? null))
  }, [])
  if (!mounted) return <div className="bg-muted size-8 w-24 animate-pulse rounded-lg" />

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-0.5 transition-colors hover:bg-muted"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          {(user?.name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="hidden flex-col items-start px-1 md:flex">
          <span className="text-xs font-bold leading-none">{user?.name}</span>
          <span className="mt-1 text-[10px] leading-none text-muted-foreground">Administrator</span>
        </div>
        <ChevronDown className="hidden size-3.5 text-muted-foreground md:block" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            role="presentation"
          />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-background shadow-lg">
            <div className="border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="p-1">
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Settings className="size-4" /> Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-bold">NP</span>
          </div>
          <span className="text-sm font-bold tracking-tight">NextPress</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="sr-only">Notifications</span>
        </button>
        <ThemeDropdown />
        <UserDropdown />
      </div>
    </header>
  )
}
