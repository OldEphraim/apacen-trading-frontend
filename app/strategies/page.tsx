"use client"

import useSWR from "swr"
import { StrategySummary } from "@/lib/types"
import { StrategiesTable } from "@/components/strategies-table"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function StrategiesPage() {
  const { data, error, isLoading } = useSWR<StrategySummary[]>(
    "/api/strategies",
    fetcher,
    { refreshInterval: 15000 }
  )

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Strategies</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Each strategy paper-trades on Polymarket markets using the data
            stored in Postgres. This table shows realized and unrealized P&amp;L,
            fills in the last 24 hours, and the most recent trade for each.
          </p>
        </div>

        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading strategies…
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 border border-red-500/40 rounded-md px-3 py-2 bg-red-500/10">
            Failed to load strategies.
          </div>
        )}

        {data && !isLoading && !error && (
          <StrategiesTable strategies={data} />
        )}
      </section>
    </main>
  )
}
