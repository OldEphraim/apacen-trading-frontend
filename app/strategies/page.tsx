"use client"

import useSWR from "swr"
import { StrategySummary } from "@/lib/types"
import { StrategiesTable } from "@/components/strategies-table"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function StrategiesPage() {
  const { data, error, isLoading } = useSWR<StrategySummary[]>(
    "/api/strategies",
    fetcher,
    { refreshInterval: 15000 },
  )

  const hasData = Array.isArray(data) && data.length > 0
  const isStale = Boolean(error) && hasData

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-12 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold mb-1">Strategies</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Each strategy currently <strong>paper-trades</strong> on Polymarket
            markets using the data stored in Postgres. This table shows realized
            and unrealized P&amp;L, fills in the last 24 hours, and the most
            recent trade for each strategy.
          </p>
          <div className="text-xs text-amber-900 bg-amber-100/80 border border-amber-300 rounded-md px-3 py-2 max-w-2xl">
            <p className="font-medium mb-1">Under construction</p>
            <p>
              This page is still evolving. Eventually, each strategy will have
              its own detail page with parameters, trade history, and per-market
              breakdowns. For now, everything here is{" "}
              <strong>simulation only</strong>: the system is tracking how these
              strategies would have done if they were trading live.
            </p>
            <p className="mt-1">
              If you see a strategy losing millions, that&apos;s intentional —
              the sizing is large by design, and those losses are{" "}
              <strong>not real capital</strong>, just a stress test of how bad a
              bad strategy can get.
            </p>
          </div>
        </div>

        {isLoading && !hasData && (
          <div className="text-sm text-muted-foreground">
            Loading strategies…
          </div>
        )}

        {/* Hard error only if we have no data at all */}
        {error && !hasData && (
          <div className="text-sm text-red-400 border border-red-500/40 rounded-md px-3 py-2 bg-red-500/10">
            Failed to load strategies.
          </div>
        )}

        {isStale && (
          <div className="text-xs text-amber-800 bg-amber-100/80 border border-amber-300 rounded-md px-3 py-2 max-w-md">
            Latest strategies refresh failed; showing the last successful
            snapshot.
          </div>
        )}

        {hasData && <StrategiesTable strategies={data!} />}
      </section>
    </main>
  )
}
