"use client"

import Link from "next/link"

interface HeroSectionProps {
  eventsProcessed: number
  statsError?: unknown
}

export function HeroSection({
  eventsProcessed,
  statsError,
}: HeroSectionProps) {
  const hasError = Boolean(statsError)

  return (
    <div className="text-center space-y-3">
      <h1 className="text-4xl md:text-5xl font-bold">
        <span className="text-primary font-mono tabular-nums">
          {eventsProcessed.toLocaleString()}
        </span>{" "}
        market events in the last 24h
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        A Go + Postgres backend ingesting Polymarket microstructure data,
        computing rolling features, and running paper-trading strategies.
        This dashboard is a thin window into that data plane.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
        <Link
          href="/strategies"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          View strategy performance
        </Link>
        <a
          href="https://oldephraim.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition"
        >
          Read the Polymarket write-up
        </a>
      </div>

      {hasError && (
        <p className="mt-3 text-xs text-destructive">
          Failed to load stats from backend. Check that your Go API is
          running and that{" "}
          <code className="font-mono">API_BASE_URL</code> and{" "}
          <code className="font-mono">API_KEY</code> are set correctly.
        </p>
      )}
    </div>
  )
}
