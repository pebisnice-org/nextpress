"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/admin/theme-toggle"

export function LoginForm({ needsSetup }: { needsSetup: boolean }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch(needsSetup ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    })
    if (res.ok) {
      router.push("/admin/dashboard")
      router.refresh()
    } else {
      setError(needsSetup ? "Could not create the account" : "Invalid email or password")
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/5" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <ThemeToggle className="fixed right-4 top-4 z-20" />

      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-md">
          <div className="grid md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <BookOpen className="size-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {needsSetup ? "Welcome to NextPress" : "Welcome back"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {needsSetup
                      ? "Create the first administrator account"
                      : "Sign in to NextPress Admin"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {needsSetup && (
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Name
                    </label>
                    <input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={needsSetup ? "new-password" : "current-password"}
                      minLength={8}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 flex h-full items-center px-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {loading ? "Please wait..." : needsSetup ? "Create account" : "Sign in"}
                </button>
              </div>
            </form>

            <div className="relative hidden overflow-hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70" />
              <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8 text-primary-foreground">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <BookOpen className="size-8" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">NextPress</h2>
                  <p className="mt-2 text-sm text-white/80">
                    Open-source CMS built on Next.js.
                    <br />
                    Fast, secure, AI-ready.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 text-sm">
                  {[
                    "SEO-first with generateMetadata",
                    "MCP server for AI agents",
                    "Theme system like WordPress",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-white/60" />
                      <span className="text-white/90">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
