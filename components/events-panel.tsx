"use client"

import { useState } from "react"
import useSWR from "swr"
import { MarketEvent } from "@/lib/types"

type Direction = "up" | "down" | "flat" | null
type EventTab = "new_market" | "price_jump"

interface MarketEventMetadata {
  ret_1m?: number
  zscore_5m?: number
  mean_revert_hint?: string
  [key: string]: unknown
}

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

  return data as MarketEvent[]
}

function computeEventChange(event: MarketEvent): {
  pctChange: number | null
  direction: Direction
} {
  // For new_market we don't show a price change
  if (event.event_type === "new_market") {
    return { pctChange: null, direction: null }
  }

  if (
    typeof event.old_value === "number" &&
    typeof event.new_value === "number" &&
    event.old_value > 0
  ) {
    const raw = event.new_value - event.old_value
    const pct = (raw / event.old_value) * 100

    if (Math.abs(pct) < 0.01) {
      return { pctChange: null, direction: "flat" }
    }

    let direction: Direction = "flat"
    if (raw > 0) direction = "up"
    else if (raw < 0) direction = "down"

    return { pctChange: pct, direction }
  }

  const metadata = event.metadata as MarketEventMetadata | null | undefined
  const ret1m = metadata?.ret_1m
  if (typeof ret1m === "number") {
    const pct = ret1m * 100

    if (Math.abs(pct) < 0.01) {
      return { pctChange: null, direction: "flat" }
    }

    let direction: Direction = "flat"
    if (pct > 0) direction = "up"
    else if (pct < 0) direction = "down"
    return { pctChange: pct, direction }
  }

  return { pctChange: null, direction: null }
}

interface EventsPanelProps {
  currentTime: Date | null
}

export function EventsPanel({ currentTime }: EventsPanelProps) {
  const [activeTab, setActiveTab] = useState<EventTab>("new_market")

  // 20 newest new markets, regardless of time
  const {
    data: newMarketEventsRaw,
    error: newMarketError,
  } = useSWR<MarketEvent[]>(
    "/api/market-events?type=new_market&limit=20&hours=0",
    fetcher,
    { refreshInterval: 10_000 },
  )

  // 20 newest “big” state_extreme moves (our price jumps)
  const {
    data: priceJumpEventsRaw,
    error: priceJumpError,
  } = useSWR<MarketEvent[]>(
    "/api/market-events?type=state_extreme&min_ret=0.05&limit=20&hours=0",
    fetcher,
    { refreshInterval: 10_000 },
  )

  const newMarketEvents = newMarketEventsRaw ?? []
  const priceJumpEvents = priceJumpEventsRaw ?? []

  const activeEvents =
    activeTab === "new_market" ? newMarketEvents : priceJumpEvents

  const error =
    activeTab === "new_market" ? newMarketError : priceJumpError

  if (error) {
    return (
      <p className="text-xs text-destructive">
        Failed to load market events from backend.
      </p>
    )
  }

  if (!activeEvents || activeEvents.length === 0) {
    return null
  }

  return (
    <div className="mb-8 rounded-lg bg-slate-100 backdrop-blur border border-green-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono font-semibold flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Live Market Events
          </h3>
          <div className="flex gap-2 text-xs">
            {(["new_market", "price_jump"] as EventTab[]).map((tab) => {
              const label =
                tab === "new_market"
                  ? `New markets (${newMarketEvents.length})`
                  : `Price jumps (${priceJumpEvents.length})`

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-1 rounded-full border font-mono ${
                    activeTab === tab
                      ? "bg-green-500/10 border-green-500 text-foreground"
                      : "border-border text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Updates every 10s
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activeEvents.map((event, idx) => {
          const { pctChange, direction } = computeEventChange(event)
          const metadata =
            event.metadata as MarketEventMetadata | null | undefined

          const detected = event.detected_at
            ? new Date(event.detected_at)
            : null

          const timeAgo =
            currentTime && detected
              ? `${Math.floor(
                  (currentTime.getTime() - detected.getTime()) / 60000,
                )}m ago`
              : ""

          const displayType =
            event.event_type === "state_extreme"
              ? "price jump"
              : event.event_type?.replace(/_/g, " ")

          return (
            <div
              key={`${event.token_id}-${event.detected_at}-${idx}`}
              className="flex items-center justify-between gap-4 p-3 rounded bg-white/5 hover:bg-white/10 transition-all duration-200"
              style={{
                animation: `slideIn 0.3s ease-out ${idx * 0.05}s backwards`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {event.question || event.token_id}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {displayType} • {timeAgo}
                  {pctChange === null &&
                    typeof metadata?.zscore_5m === "number" && (
                      <>
                        {" "}
                        • σ≈
                        <span className="font-mono">
                          {metadata.zscore_5m.toFixed(1)}
                        </span>
                      </>
                    )}
                  {metadata?.mean_revert_hint && (
                    <>
                      {" "}
                      •{" "}
                      <span className="italic">
                        {metadata.mean_revert_hint}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Price line */}
                <div className="text-right">
                  {event.event_type === "new_market" ? (
                    <div className="font-mono text-xs text-muted-foreground">
                      —
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-muted-foreground">
                      {typeof event.old_value === "number"
                        ? event.old_value.toFixed(3)
                        : "—"}{" "}
                      →{" "}
                      {typeof event.new_value === "number"
                        ? event.new_value.toFixed(3)
                        : "—"}
                    </div>
                  )}
                </div>

                {/* Percent change */}
                <div className="font-mono text-sm font-bold">
                  {pctChange === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span
                      className={
                        direction === "up"
                          ? "text-green-500"
                          : direction === "down"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }
                    >
                      {direction === "up" && "↑ "}
                      {direction === "down" && "↓ "}
                      {direction === "flat" && "→ "}
                      {Math.abs(pctChange).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
    </div>
  )
}
