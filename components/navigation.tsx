"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home" },
    { href: "/strategies", label: "Strategies" },
    { href: "/faq", label: "FAQ" },
    {
      href: "https://oldephraim.substack.com",
      label: "Blog",
      external: true,
    },
    {
      href: "https://alanmgarber.com",
      label: "About Me",
      external: true,
    },
    {
      href: "mailto:a8garber@yahoo.com?subject=Apacen%20Trading%20inquiry",
      label: "Contact Me",
      external: true,
    },
  ]

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            {/* tiny triangle logo, v0-style */}
            <div className="h-4 w-4 border-l-8 border-r-8 border-b-14 border-l-transparent border-r-transparent border-b-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-base font-medium text-foreground">
                Apacen Trading
              </span>
              <span className="hidden sm:block font-mono text-[0.6rem] text-muted-foreground tracking-[0.18em] uppercase">
                Polymarket Data Plane
              </span>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.75rem] sm:text-sm font-mono transition-colors hover:text-foreground text-muted-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[0.75rem] sm:text-sm font-mono transition-colors hover:text-foreground ${
                    pathname === link.href
                      ? "text-foreground underline decoration-2 underline-offset-4"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
