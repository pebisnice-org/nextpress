"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  FileText,
  File,
  Image,
  Tag,
  Menu,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/posts", icon: FileText, label: "Posts" },
  { href: "/admin/pages", icon: File, label: "Pages" },
  { href: "/admin/media", icon: Image, label: "Media" },
  { href: "/admin/taxonomies", icon: Tag, label: "Taxonomies" },
  { href: "/admin/menus", icon: Menu, label: "Menus" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`relative hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 md:flex md:flex-col ${collapsed ? "w-16" : "w-56"}`}
    >
      <div
        className={`flex h-16 items-center border-b border-sidebar-border ${collapsed ? "justify-center px-3" : "gap-2 px-4"}`}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="size-4" />
        </div>
        {!collapsed && <span className="text-sm font-bold tracking-tight">NextPress</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-muted"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  )
}
