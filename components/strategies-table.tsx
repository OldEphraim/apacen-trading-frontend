import { StrategySummary } from "@/lib/types"

export function StrategiesTable({
  strategies,
  limit,
}: {
  strategies: StrategySummary[]
  limit?: number
}) {
  const rows = limit ? strategies.slice(0, limit) : strategies

  if (!rows.length) {
    return (
      <div className="text-sm text-muted-foreground border border-border rounded-lg p-4 bg-muted/40">
        No strategies found yet. Once the paper-trading engine runs,
        they&apos;ll appear here.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-muted">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/80">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              Strategy
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Realized PnL
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Unrealized PnL
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Total PnL
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Fills (24h)
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Last trade
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const total = s.total_pnl
            const pnlClass =
              total > 0
                ? "text-green-500"
                : total < 0
                ? "text-red-500"
                : "text-foreground"

            return (
              <tr
                key={s.name}
                className="border-t border-border/60 hover:bg-background/40"
              >
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2 text-right">
                  {s.realized_pnl.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {s.unrealized_pnl.toFixed(2)}
                </td>
                <td className={`px-3 py-2 text-right font-medium ${pnlClass}`}>
                  {total >= 0 ? "+" : ""}
                  {total.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {s.fills_24h.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {s.last_trade_at
                    ? new Date(s.last_trade_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
