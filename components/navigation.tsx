"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home" },
    { href: "/strategies", label: "Strategies" },
    {
      href: "https://oldephraim.substack.com",
      label: "Blog",
      external: true,
    },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* tiny triangle logo, v0-style */}
            <div className="h-4 w-4 border-l-8 border-r-8 border-b-14 border-l-transparent border-r-transparent border-b-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-base font-medium text-foreground">
                Apacen Trading
              </span>
              <span className="font-mono text-[0.6rem] text-muted-foreground tracking-[0.18em] uppercase">
                Polymarket Data Plane
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono transition-colors hover:text-foreground text-muted-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-mono transition-colors hover:text-foreground ${
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
