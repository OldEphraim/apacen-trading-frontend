export interface StatsResponse {
  active_markets: number
  events_24h: number
  open_positions: number
  total_pnl: number
  strategies_count: number

  ingest_quotes_per_min: number
  ingest_trades_per_min: number
  features_per_minute: number

  db_size: string
  approx_quotes_total: number
  approx_trades_total: number
  approx_features_total: number

  generated_at: string // ISO timestamp from the backend
  writer_queue_depths?: Record<string, number>
}
  
  export interface StrategySummary {
    name: string
    realized_pnl: number
    unrealized_pnl: number
    fills_24h: number
    last_trade_at?: string | null
    total_pnl: number
  }
  
  export interface MarketEvent {
    token_id: string
    event_type: string | null
    old_value?: number | null
    new_value?: number | null
    detected_at: string
    question?: string | null
    metadata?: {
      percent_change?: number
      [key: string]: unknown
    }
  }
  
  export interface StreamLagSnapshot {
    quotes_lag_sec: number
    trades_lag_sec: number
    features_lag_sec: number
    generated_at: string
  }
  