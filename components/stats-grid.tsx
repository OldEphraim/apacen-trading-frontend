import { StatsResponse, StreamLagSnapshot } from "@/lib/types"

type LagLevel = "ok" | "warn" | "bad"

interface LagDisplay {
  label: string
  level: LagLevel
}

/**
 * Format lag (in seconds) into a human-friendly label + level.
 *  - < 50ms  => "ok"
 *  - < 500ms => "warn"
 *  - else    => "bad"
 */
function formatLagSeconds(sec: number | undefined | null): LagDisplay {
  if (sec == null || sec <= 0) {
    return { label: "—", level: "ok" }
  }

  const ms = sec * 1000

  if (ms < 1) {
    return { label: "<1ms", level: "ok" }
  }

  if (ms < 1_000) {
    const val = ms < 10 ? ms.toFixed(1) : Math.round(ms).toString()
    const level: LagLevel = ms < 50 ? "ok" : ms < 500 ? "warn" : "bad"
    return { label: `${val}ms`, level }
  }

  const s = sec
  const val = s < 10 ? s.toFixed(2) : s.toFixed(1)
  const level: LagLevel = s < 1 ? "ok" : s < 5 ? "warn" : "bad"
  return { label: `${val}s`, level }
}

function badgeClass(level: LagLevel): string {
  switch (level) {
    case "ok":
      return "bg-emerald-500/20 text-emerald-700 border-emerald-500/40"
    case "warn":
      return "bg-amber-500/20 text-amber-700 border-amber-500/40"
    case "bad":
    default:
      return "bg-red-500/20 text-red-700 border-red-500/40"
  }
}

interface StatsGridProps {
  stats: StatsResponse
  lag?: StreamLagSnapshot
}

export function StatsGrid({ stats, lag }: StatsGridProps) {
  const quoteLag = formatLagSeconds(lag?.quotes_lag_sec)
  const tradeLag = formatLagSeconds(lag?.trades_lag_sec)
  const featureLag = formatLagSeconds(lag?.features_lag_sec)

  const snapshotTime = stats.generated_at
    ? new Date(stats.generated_at)
    : null

  const snapshotLabel = snapshotTime
    ? snapshotTime.toLocaleTimeString("en-US", { timeZone: "UTC" })
    : null

  const lagSnapshotLabel = lag?.generated_at
    ? new Date(lag.generated_at).toLocaleTimeString("en-US", {
        timeZone: "UTC",
      })
    : null

  return (
    <div className="space-y-3 mb-8">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Markets active */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              Markets Active
            </div>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="font-mono text-3xl font-bold text-foreground tabular-nums">
            {stats.active_markets.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Markets currently tracked by the gatherer.
          </p>
        </div>

        {/* Features per minute */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6">
          <div className="text-sm text-muted-foreground mb-2">
            Features per minute
          </div>
          <div className="font-mono text-3xl font-bold text-foreground tabular-nums">
            {Math.round(stats.features_per_minute).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Rolling signals emitted by the feature engine.
          </p>
        </div>

        {/* Strategies */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6">
          <div className="text-sm text-muted-foreground mb-2">
            Strategies running
          </div>
          <div className="font-mono text-3xl font-bold text-foreground tabular-nums">
            {stats.strategies_count.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Strategies active in the last 24 hours.
          </p>
        </div>

        {/* Events 24h */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6">
          <div className="text-sm text-muted-foreground mb-2">
            Events (last 24h)
          </div>
          <div className="font-mono text-3xl font-bold text-foreground tabular-nums">
            {stats.events_24h.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Market events recorded in the last 24 hours.
          </p>
        </div>

        {/* Ingest quotes */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6 md:col-span-2">
          <div className="text-sm text-muted-foreground mb-2">
            Ingest (quotes / minute)
          </div>
          <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
            {Math.round(stats.ingest_quotes_per_min).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Approximate quote throughput based on partition span.
          </p>
        </div>

        {/* Ingest trades */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6">
          <div className="text-sm text-muted-foreground mb-2">
            Ingest (trades / minute)
          </div>
          <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
            {Math.round(stats.ingest_trades_per_min).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Approximate trade throughput based on partition span.
          </p>
        </div>

        {/* Stream lag */}
        <div className="rounded-lg bg-slate-100 backdrop-blur border border-primary/20 p-6">
          <div className="text-sm text-muted-foreground mb-2">
            Stream lag
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span
              className={`px-2 py-0.5 rounded-full border ${badgeClass(
                quoteLag.level,
              )}`}
            >
              Quotes: {quoteLag.label}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border ${badgeClass(
                tradeLag.level,
              )}`}
            >
              Trades: {tradeLag.label}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border ${badgeClass(
                featureLag.level,
              )}`}
            >
              Features: {featureLag.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Age of the most recent record in each stream. Spikes usually
            indicate news events or backpressure in the pipeline.
          </p>
        </div>
      </div>

      {/* Snapshot timestamps */}
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground font-mono">
        {snapshotLabel && (
          <span>Stats snapshot at {snapshotLabel} UTC</span>
        )}
        {lagSnapshotLabel && (
          <span>Stream lag as of {lagSnapshotLabel} UTC</span>
        )}
      </div>
    </div>
  )
}
