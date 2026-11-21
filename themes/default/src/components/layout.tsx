import type { LayoutProps } from "@nextpress/theme-engine"

export function Layout({ children, siteName, navigation = [] }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            {siteName}
          </a>
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm font-medium px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">{children}</main>
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {siteName}
          </span>
          <span>
            Powered by{" "}
            <a
              href="https://github.com/pebisnice/nextpress"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              NextPress
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
