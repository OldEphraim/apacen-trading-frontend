"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import { StatsGrid } from "@/components/stats-grid"
import { HeroSection } from "@/components/hero-section"
import { EventsPanel } from "@/components/events-panel"
import {
  StatsResponse,
  StrategySummary,
  StreamLagSnapshot,
} from "@/lib/types"

// Shared fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    console.error("API error for", url, res.status, data)
    throw new Error(
      (data && (data.error as string)) ||
        `Request failed with status ${res.status}`,
    )
  }

  return data
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  const {
    data: stats,
    error: statsError,
  } = useSWR<StatsResponse>("/api/stats", fetcher, {
    // stats: slow-ish to compute, okay to be a bit stale
    refreshInterval: 600_000,
  })

  const { data: lag } = useSWR<StreamLagSnapshot>(
    "/api/stream-lag",
    fetcher,
    {
      refreshInterval: 30_000,
    },
  )

  const {
    data: strategies,
    error: strategiesError,
  } = useSWR<StrategySummary[]>("/api/strategies", fetcher, {
    refreshInterval: 15_000,
  })

  // Clock: only starts ticking on the client
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const eventsProcessed = stats?.events_24h ?? 0

  const topStrategies = (strategies || [])
    .slice()
    .sort((a, b) => b.total_pnl - a.total_pnl)
  .slice(0, 2)

  const hasValidStats =
    stats && typeof stats.active_markets === "number"

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-16 space-y-10">
        <HeroSection
          eventsProcessed={eventsProcessed}
          statsError={statsError}
        />

        {hasValidStats && (
          <StatsGrid stats={stats as StatsResponse} lag={lag} />
        )}

        <EventsPanel currentTime={currentTime} />

        {/* Strategies snapshot */}
        <div className="grid gap-4 lg:grid-cols-2 mb-8">
          {strategiesError && (
            <div className="lg:col-span-2 text-xs text-destructive border border-border rounded-lg p-4">
              Failed to load strategy summaries from backend.
            </div>
          )}

          {!strategiesError && topStrategies.length > 0 ? (
            topStrategies.map((s) => {
              const total = s.total_pnl
              const pnlClass =
                total > 0
                  ? "text-green-500"
                  : total < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
              return (
                <div
                  key={s.name}
                  className="rounded-lg bg-muted p-6 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-mono font-semibold text-foreground">
                      {s.name}
                    </h3>
                    <span className="text-xs text-green-500">
                      {s.fills_24h > 0 ? "ACTIVE" : "IDLE"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Paper-trading strategy backed by live Polymarket
                    data.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span>
                      Fills (24h): {s.fills_24h.toLocaleString()}
                    </span>
                    <span className={pnlClass}>
                      P&L: {total >= 0 ? "+" : ""}
                      {total.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      Last trade:{" "}
                      {s.last_trade_at
                        ? new Date(
                            s.last_trade_at
                          ).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            !strategiesError && (
              <div className="lg:col-span-2 text-sm text-muted-foreground border border-border rounded-lg p-4">
                Strategy microservice is warming up or idle. Once
                paper trades start flowing, strategies and P&amp;L
                will appear here.
              </div>
            )
          )}
        </div>

        {/* System architecture blurb */}
        <div className="rounded-lg bg-muted p-6 border border-border">
          <h3 className="mb-4 font-mono font-semibold text-foreground">
            System Architecture
          </h3>
          <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
            <div>
              <div className="text-xs text-primary font-mono mb-1">
                GATHER &amp; FEATURE
              </div>
              Websocket gatherer ingests quotes and trades; a feature
              engine keeps rolling windows in memory and emits signals
              when price, volatility, or liquidity change.
            </div>
            <div>
              <div className="text-xs text-primary font-mono mb-1">
                PERSIST &amp; ARCHIVE
              </div>
              Batches flow through a persister using Postgres COPY into
              hourly-partitioned tables. An archiver streams old
              partitions to S3, and a janitor drops them to keep
              disk/WAL healthy.
            </div>
            <div>
              <div className="text-xs text-primary font-mono mb-1">
                STRATEGIES &amp; API
              </div>
              A strategies microservice runs paper trades; an API
              service exposes stats, fills, P&amp;L, and positions to
              this frontend and other clients.
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  )
}