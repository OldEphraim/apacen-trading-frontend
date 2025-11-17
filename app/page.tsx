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
          hasStats={hasValidStats}
        />

        {hasValidStats && (
          <StatsGrid stats={stats as StatsResponse} lag={lag} />
        )}

        <EventsPanel currentTime={currentTime} />

        {/* Strategies snapshot */}
        <div className="grid gap-4 lg:grid-cols-2 mb-8">
          {strategiesError && topStrategies.length === 0 && (
            <div className="lg:col-span-2 text-xs text-destructive border border-border rounded-lg p-4">
              Failed to load strategy summaries from backend.
            </div>
          )}

          {strategiesError && topStrategies.length > 0 && (
            <div className="lg:col-span-2 text-[0.7rem] text-amber-800 bg-amber-100/80 border border-amber-300 rounded-md px-3 py-2 mb-1">
              Latest strategy refresh failed; showing the last successful
              snapshot.
            </div>
          )}

          {topStrategies.length > 0 ? (
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
                    Experimental paper-trading strategy backed by live
                    Polymarket data. Large gains or losses here are simulated,
                    not live capital.
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
                        ? new Date(s.last_trade_at).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            !strategiesError && (
              <div className="lg:col-span-2 text-sm text-muted-foreground border border-border rounded-lg p-4">
                Strategy microservice is warming up or idle. Once paper trades
                start flowing, strategies and P&amp;L will appear here.
              </div>
            )
          )}
        </div>

        {/* Data streams overview */}
        <div className="rounded-lg bg-muted p-6 border border-border">
          <h3 className="mb-4 font-mono font-semibold text-foreground">
            What the data streams mean
          </h3>
          <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
            <div>
              <div className="text-xs text-primary font-mono mb-1">
                Quotes
              </div>
              Top-of-book snapshots: best bid, best ask, and mid-price for each
              market, updated whenever quotes move. This is the “heartbeat” of
              the order book and is what most of the short-horizon features are
              built from.
            </div>
            <div>
              <div className="text-xs text-primary font-mono mb-1">
                Trades
              </div>
              Individual fills: every executed trade with size, price, and
              direction. This is where volume, flow, and realized PnL ultimately
              come from, and what strategies care about when orders actually hit.
            </div>
            <div>
              <div className="text-xs text-primary font-mono mb-1">
                Features
              </div>
              Rolling signals computed from quotes and trades: short-horizon
              returns, volatility estimates, z-scores, and other “is something
              interesting happening here?” flags used by the paper-trading
              engine.
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