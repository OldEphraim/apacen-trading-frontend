"use client";

import { useEffect } from "react";

export default function FAQPage() {
  const openAndScrollTo = (targetId: string) => {
    if (typeof window === "undefined") return;

    const el = document.getElementById(targetId);
    if (!el) return;

    // If the target itself is a <details>, open it
    if (el.tagName === "DETAILS") {
      (el as HTMLDetailsElement).open = true;
    }

    // Open all ancestor <details> elements
    let parent = el.parentElement;
    while (parent) {
      if (parent.tagName === "DETAILS") {
        (parent as HTMLDetailsElement).open = true;
      }
      parent = parent.parentElement;
    }

    const rect = el.getBoundingClientRect();
    const offset = 80; // breathing room from the top
    const y = rect.top + window.scrollY - offset;

    window.scrollTo({
      top: y < 0 ? 0 : y,
      behavior: "smooth",
    });
  };

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    window.history.pushState(null, "", `#${targetId}`);
    openAndScrollTo(targetId);
  };

  const handleCopyLink = (event: React.MouseEvent<HTMLButtonElement>, targetId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window === "undefined") return;

    const url = `${window.location.origin}${window.location.pathname}#${targetId}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        // ignore clipboard errors
      });
    }

    window.history.replaceState(null, "", `#${targetId}`);
    openAndScrollTo(targetId);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => openAndScrollTo(hash), 0);
      }
    };

    applyHash();

    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 prose prose-invert prose-slate prose-p:my-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Apacen Trading – FAQ
      </h1>

      {/* On this page */}
      <nav
        aria-label="On this page"
        className="mb-10 border border-slate-700/40 rounded-lg p-4 bg-slate-900/10 text-sm"
      >
        <p className="mb-2 font-semibold">On this page</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <a
              href="#dashboard-overview"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "dashboard-overview")}
            >
              What am I looking at on this dashboard?
            </a>
          </li>
          <li>
            <a
              href="#main-tables"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "main-tables")}
            >
              The three main tables
            </a>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <a
                  href="#market-quotes"
                  className="hover:underline"
                  onClick={(e) => handleAnchorClick(e, "market-quotes")}
                >
                  What is <code>market_quotes</code>?
                </a>
              </li>
              <li>
                <a
                  href="#market-trades"
                  className="hover:underline"
                  onClick={(e) => handleAnchorClick(e, "market-trades")}
                >
                  What is <code>market_trades</code>?
                </a>
              </li>
              <li>
                <a
                  href="#market-features"
                  className="hover:underline"
                  onClick={(e) => handleAnchorClick(e, "market-features")}
                >
                  What is <code>market_features</code>?
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a
              href="#lag-and-performance"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "lag-and-performance")}
            >
              Lag and performance
            </a>
          </li>
          <li>
            <a
              href="#prices-vs-polymarket"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "prices-vs-polymarket")}
            >
              Prices and discrepancies vs Polymarket’s UI
            </a>
          </li>
          <li>
            <a
              href="#market-events"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "market-events")}
            >
              Market events: new markets, price jumps, state extremes
            </a>
          </li>
          <li>
            <a
              href="#data-retention"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "data-retention")}
            >
              Data retention, archiving, and disk space
            </a>
          </li>
          <li>
            <a
              href="#future-goals"
              className="hover:underline"
              onClick={(e) => handleAnchorClick(e, "future-goals")}
            >
              Where this is going
            </a>
          </li>
        </ul>
      </nav>

      {/* What am I looking at? */}
      <section id="dashboard-overview">
        <details open className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>What am I looking at on this dashboard?</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "dashboard-overview")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-4">
            <p>
              This frontend sits on top of a custom data pipeline for Polymarket. Under the hood, three
              high-volume streams are being ingested:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <code>market_quotes</code> – “top of the book” snapshots.
              </li>
              <li>
                <code>market_trades</code> – individual fills (every trade that prints).
              </li>
              <li>
                <code>market_features</code> – derived statistical signals built from quotes and trades.
              </li>
            </ul>
            <p>
              Those three streams are stored in Postgres in hourly partitions, periodically archived to S3,
              and then used to drive:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>The stats at the top of the page.</li>
              <li>The “Live Market Events” pane (new markets, big jumps, extremes).</li>
              <li>The lag meter, which shows how far behind the ingest is from real time.</li>
            </ul>
            <p>
              The long-term goal is to use this data to power and backtest trading strategies on Polymarket.
            </p>
          </div>
        </details>
      </section>

      <hr className="my-8 border-slate-700/60" />

      {/* The three main tables */}
      <section id="main-tables">
        <details className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>The three main tables</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "main-tables")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-6">
            {/* market_quotes */}
            <details
              id="market-quotes"
              className="border border-slate-700/40 rounded-lg p-4 bg-slate-900/10 group/subtable"
            >
              <summary className="font-semibold cursor-pointer text-lg flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/subtable:before:content-['▾']">
                <span>
                  What is <code>market_quotes</code>?
                </span>
                <button
                  type="button"
                  aria-label="Copy link to this section"
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={(e) => handleCopyLink(e, "market-quotes")}
                >
                  🔗
                </button>
              </summary>
              <div className="mt-3 space-y-4">
                <p>
                  <strong>Short version:</strong> Snapshots of the best bid/ask for each market at a given
                  instant.
                  <br />
                  <strong>Think of it as:</strong> “What’s the current top quote in the order book?”
                </p>
                <p>Each row corresponds to the <code>Quote</code> struct:</p>
                <pre>
                  <code>{`type Quote struct {
  TokenID   string
  TS        time.Time
  BestBid   float64
  BestAsk   float64
  BidSize1  float64
  AskSize1  float64
  SpreadBps float64
  Mid       float64
}`}</code>
                </pre>
                <p>Field-by-field:</p>
                <div className="mt-2 space-y-2">
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TokenID</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Polymarket’s internal ID for a specific “yes/no” outcome (a CLOB token), not the
                      human-readable market title.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TS</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Timestamp when this quote snapshot was observed.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>BestBid</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Highest price someone is currently willing to pay for 1 unit of the token.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>BestAsk</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Lowest price someone is currently willing to sell for.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>BidSize1</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Size available at the best bid (top level of the bid side).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>AskSize1</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Size available at the best ask.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>SpreadBps</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Bid–ask spread expressed in <strong>basis points</strong> (1 basis point = 0.01%).
                      It’s basically:
                      <br />
                      <div className="mt-1 inline-block rounded-md bg-slate-900/10 px-2 py-1 text-xs md:text-sm font-mono">
                        <code>
                          spread = ((BestAsk - BestBid) / Mid) × 10,000
                        </code>
                      </div>
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Mid</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Midpoint between best bid and best ask:
                      <br />
                      <div className="mt-1 inline-block rounded-md bg-slate-900/10 px-2 py-1 text-xs md:text-sm font-mono">
                        <code>Mid = (BestBid + BestAsk) / 2</code>
                      </div>
                    </div>
                  </details>
                </div>

                <h4 className="text-lg font-semibold mt-4">
                  When is a <code>market_quotes</code> row emitted?
                </h4>
                <p>
                  Whenever the top of book changes in a meaningful way – e.g.:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Best bid moves.</li>
                  <li>Best ask moves.</li>
                  <li>Top level size changes enough to matter.</li>
                </ul>
                <p>
                  Busy markets can generate <strong>thousands of quote snapshots per minute</strong>.
                  Quiet markets may sit unchanged for a while.
                </p>
              </div>
            </details>

            {/* market_trades */}
            <details
              id="market-trades"
              className="border border-slate-700/40 rounded-lg p-4 bg-slate-900/10 group/subtable"
            >
              <summary className="font-semibold cursor-pointer text-lg flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/subtable:before:content-['▾']">
                <span>
                  What is <code>market_trades</code>?
                </span>
                <button
                  type="button"
                  aria-label="Copy link to this section"
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={(e) => handleCopyLink(e, "market-trades")}
                >
                  🔗
                </button>
              </summary>
              <div className="mt-3 space-y-4">
                <p>
                  <strong>Short version:</strong> Every individual execution that happens on Polymarket.
                  <br />
                  <strong>Think of it as:</strong> “The tape” – every trade print with price, size, and
                  which side initiated it.
                </p>
                <p>Each row corresponds to the <code>Trade</code> struct:</p>
                <pre>
                  <code>{`type Trade struct {
  TokenID   string
  TS        time.Time
  Price     float64
  Size      float64
  Aggressor string // "buy" or "sell"
  TradeID   string // optional if available
}`}</code>
                </pre>
                <p>Field-by-field:</p>
                <div className="mt-2 space-y-2">
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TokenID</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Same idea as in quotes: the internal ID for the outcome being traded.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TS</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      When this trade was executed.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Price</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Transaction price for this fill (e.g. 0.43 = 43¢).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Size</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Quantity traded in this fill (in Polymarket’s units for that token).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Aggressor</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Indicates which side <strong>crossed the spread</strong>:
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <code>&quot;buy&quot;</code>: a buyer lifted the ask (buy market order / taker).
                        </li>
                        <li>
                          <code>&quot;sell&quot;</code>: a seller hit the bid (sell market order / taker).
                        </li>
                      </ul>
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TradeID</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Exchange-side identifier when available, useful for deduplication or
                      cross-referencing.
                    </div>
                  </details>
                </div>

                <h4 className="text-lg font-semibold mt-4">
                  When is a <code>market_trades</code> row emitted?
                </h4>
                <p>
                  Whenever <strong>any trade prints</strong> on Polymarket for a tracked token.
                  Trades are much rarer than quotes, but each trade is extremely informative: it’s where
                  actual money changes hands.
                </p>
              </div>
            </details>

            {/* market_features */}
            <details
              id="market-features"
              className="border border-slate-700/40 rounded-lg p-4 bg-slate-900/10 group/subtable"
            >
              <summary className="font-semibold cursor-pointer text-lg flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/subtable:before:content-['▾']">
                <span>
                  What is <code>market_features</code>?
                </span>
                <button
                  type="button"
                  aria-label="Copy link to this section"
                  className="text-xs text-slate-400 hover:text-slate-200"
                  onClick={(e) => handleCopyLink(e, "market-features")}
                >
                  🔗
                </button>
              </summary>
              <div className="mt-3 space-y-4">
                <p>
                  <strong>Short version:</strong> Rolling statistical signals built from the raw quotes and
                  trades.
                  <br />
                  <strong>Think of it as:</strong> “Features you’d feed into a trading model.”
                </p>
                <p>Each row corresponds to the <code>FeatureUpdate</code> struct:</p>
                <pre>
                  <code>{`type FeatureUpdate struct {
  TokenID        string
  TS             time.Time
  Ret1m          float64
  Ret5m          float64
  Vol1m          float64
  AvgVol5m       float64
  Sigma5m        float64
  ZScore5m       float64
  ImbalanceTop   float64
  SpreadBps      float64
  BrokeHigh15m   bool
  BrokeLow15m    bool
  TimeToResolveH float64
  SignedFlow1m   float64 // +buy -sell
  MidNow         float64
  Mid1mAgo       float64
}`}</code>
                </pre>
                <p>Field-by-field:</p>
                <div className="mt-2 space-y-2">
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TokenID</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Outcome identifier, as before.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TS</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Time of this feature snapshot. Think of it as “the state of this market at this
                      moment.”
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Ret1m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      <strong>1-minute return</strong> based on mid price: approximately
                      <br />
                      <div className="mt-1 inline-block rounded-md bg-slate-900/10 px-2 py-1 text-xs md:text-sm font-mono">
                        <code>
                          (MidNow - Mid 1 minute ago) / (Mid 1 minute ago)
                        </code>
                      </div>
                      <br />
                      A value of <code>0.05</code> ≈ +5% move in the last minute.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Ret5m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Same idea as <code>Ret1m</code>, but over the last 5 minutes.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Vol1m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      <strong>Traded volume over the last 1 minute</strong> for this token (sum of sizes).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>AvgVol5m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Average 1-minute volume over the last 5 minutes. Good for spotting whether the
                      current minute is unusually active.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Sigma5m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Estimated <strong>volatility</strong> of mid price over the last 5 minutes (a rolling
                      standard deviation). Higher <code>Sigma5m</code> = price jittering around more
                      violently.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>ZScore5m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      A <strong>z-score</strong> of the current price relative to the recent 5-minute window:
                      <br />
                      <div className="mt-1 inline-block rounded-md bg-slate-900/10 px-2 py-1 text-xs md:text-sm font-mono">
                        <code>
                          Z = (current mid - recent mean mid) / Sigma5m
                        </code>
                      </div>
                      <br />
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          |Z| ≈ 1–2: normal noise.
                        </li>
                        <li>
                          |Z| ≈ 3–4: quite unusual.
                        </li>
                        <li>
                          |Z| ≈ 10: “state extreme” – price is miles from its recent average.
                        </li>
                      </ul>
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>ImbalanceTop</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Measure of <strong>order-book imbalance at the top level</strong>.
                      <br />
                      Intuitively:
                      <ul className="list-disc list-inside space-y-1">
                        <li>Positive values ≈ more aggressive bid size than ask size.</li>
                        <li>Negative values ≈ more aggressive ask size than bid size.</li>
                        <li>Near zero ≈ balanced.</li>
                      </ul>
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>SpreadBps</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Same as in <code>market_quotes</code>: bid–ask spread in basis points. Wider spreads
                      ≈ less liquidity / higher friction.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>BrokeHigh15m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      <code>true</code> if the current mid price is breaking the <strong>15-minute high</strong> (new short-term high).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>BrokeLow15m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      <code>true</code> if the current mid price is breaking the <strong>15-minute low</strong> (new short-term low).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>TimeToResolveH</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Approximate <strong>hours until market resolution</strong> (based on known expiry time
                      when available).
                      <br />
                      <ul className="list-disc list-inside space-y-1">
                        <li>Small value → event is soon.</li>
                        <li>Large value → long-dated / far in the future.</li>
                      </ul>
                      Great for strategies that behave differently near expiry.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>SignedFlow1m</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      <strong>Net signed order flow over 1 minute</strong>:
                      <ul className="list-disc list-inside space-y-1">
                        <li>Positive = more aggressive buys than sells.</li>
                        <li>Negative = more aggressive sells than buys.</li>
                      </ul>
                      This tries to capture which side is “in control” of recent trading.
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>MidNow</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Current mid price (same as in <code>market_quotes</code>).
                    </div>
                  </details>
                  <details className="group/field border border-slate-700/40 rounded-md px-3 py-2 bg-slate-900/5">
                    <summary className="font-semibold cursor-pointer before:mr-1 before:inline-block before:content-['▸'] group-open/field:before:content-['▾']">
                      <strong>
                        <code>Mid1mAgo</code>
                      </strong>
                    </summary>
                    <div className="mt-2 text-sm">
                      Mid price one minute ago, used internally to compute the returns, but also handy to see
                      on its own.
                    </div>
                  </details>
                </div>

                <h4 className="text-lg font-semibold mt-4">
                  When is a <code>market_features</code> row emitted?
                </h4>
                <p>
                  The <strong>feature engine</strong> keeps a rolling window of recent quotes and trades in
                  memory. It emits a new <code>FeatureUpdate</code> when:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enough new data has arrived to update the rolling window, and/or</li>
                  <li>Something “interesting” happens (big move, high z-score, notable volume spike, etc.).</li>
                </ul>
                <p>
                  Because features can be recalculated as new data arrives, they’re:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>First</strong> streamed into temporary tables via <code>COPY</code>.
                  </li>
                  <li>
                    <strong>Then</strong> merged into <code>market_features</code> via a set-based upsert, so{" "}
                    <strong>only the latest feature per token/timestamp “sticks.”</strong>
                  </li>
                </ul>
                <p>
                  The result is a dense, but not ridiculous, stream of signal snapshots.
                </p>
              </div>
            </details>
          </div>
        </details>
      </section>

      <hr className="my-8 border-slate-700/60" />

      {/* Lag & performance */}
      <section id="lag-and-performance">
        <details className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>Lag and performance</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "lag-and-performance")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-6">
            <h3 className="text-xl font-semibold">
              What is the “Stream lag” indicator on the front page?
            </h3>
            <p>
              The lag badges show, for each stream:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Quotes lag</strong> – how many seconds ago the newest <code>market_quotes</code> row
                was ingested.
              </li>
              <li>
                <strong>Trades lag</strong> – same for <code>market_trades</code>.
              </li>
              <li>
                <strong>Features lag</strong> – same for <code>market_features</code>.
              </li>
            </ul>
            <p>
              In other words:
              <br />
              <em>
                “If the latest quote in the database is from 3 seconds ago, the quotes lag is ~3s.”
              </em>
            </p>
            <p>
              The frontend hits a lightweight <code>/stream-lag</code> endpoint that asks Postgres:
            </p>
            <pre>
              <code>{`SELECT EXTRACT(EPOCH FROM (now() - max(ts))) AS lag_sec
FROM market_quotes  -- or market_trades / market_features
WHERE ts > now() - interval '1 day';`}</code>
            </pre>
            <p>and uses that to color the badges.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Green (<code>ok</code>)</strong> – normal: typically <strong>1–4 seconds</strong>.
              </li>
              <li>
                <strong>Amber (<code>warn</code>)</strong> – tens of seconds: usually a brief backlog or a
                small hiccup.
              </li>
              <li>
                <strong>Red (<code>bad</code>)</strong> – hundreds of seconds: something is putting the
                ingest under stress.
              </li>
            </ul>

            <h3 className="text-xl font-semibold">
              Why have we seen lags as high as ~470 seconds?
            </h3>
            <p>A few reasons can cause temporary spikes without actually “breaking” the system:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Heavy analytics queries (like stats / exploratory SQL)</strong>
                <br />
                Big <code>WITH</code> queries scanning partitioned tables can:
                <ul className="list-disc list-inside space-y-1">
                  <li>Compete with the ingest pipeline for I/O.</li>
                  <li>Hold locks and slow down writes.</li>
                </ul>
                This doesn’t stop the gatherer from reading the websocket; it just means it takes longer
                for data to <strong>land</strong> in Postgres.
              </li>
              <li>
                <strong>Write-ahead log (WAL) and checkpoint pressure</strong>
                <br />
                Under high write volume, Postgres sometimes needs to:
                <ul className="list-disc list-inside space-y-1">
                  <li>Flush WAL aggressively.</li>
                  <li>Run longer checkpoints.</li>
                </ul>
                Both can briefly slow writes, which shows up as lag.
              </li>
              <li>
                <strong>Archiver / janitor / healthmonitor interactions</strong>
                <br />
                <ul className="list-disc list-inside space-y-1">
                  <li>The archiver streams old partitions to S3.</li>
                  <li>The janitor drops old partitions to free disk.</li>
                  <li>The healthmonitor dynamically adjusts them.</li>
                </ul>
                If they all wake up at once during a high-activity period, writes can momentarily fall
                behind.
              </li>
              <li>
                <strong>External factors</strong>
                <br />
                Network hiccups, upstream slowdowns at Polymarket, or temporary resource contention on
                the EC2 instance can all contribute.
              </li>
            </ol>
            <div className="border-l-4 border-sky-400/80 bg-slate-900/10 px-4 py-3 rounded-md">
              <p>
                The important point: the pipeline is built to <strong>catch up</strong>. Short-lived spikes
                into the tens or even hundreds of seconds are acceptable as long as:
              </p>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>They don’t persist.</li>
              <li>Data eventually “catches up” and lag returns to single-digit seconds.</li>
            </ul>

            <h3 className="text-xl font-semibold">
              Is lag of ~120 seconds OK? What about ~470 seconds?
            </h3>
            <p>
              <strong>Normal operating range:</strong> ~1–4 seconds.
              <br />
              <strong>Mild stress:</strong> 30–120 seconds – worth watching, but usually self-correcting.
              <br />
              <strong>Serious stress:</strong> 200+ seconds sustained – useful as a “debug me” signal.
            </p>
            <p>
              A one-off spike to ~470 seconds during a big query or a maintenance task is not catastrophic;
              a <em>persistent</em> 400–500 seconds would be a sign that the ingest rate and database
              configuration need tuning.
            </p>
          </div>
        </details>
      </section>

      <hr className="my-8 border-slate-700/60" />

      {/* Prices vs Polymarket */}
      <section id="prices-vs-polymarket">
        <details className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>Prices and discrepancies vs Polymarket’s UI</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "prices-vs-polymarket")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-6">
          <h3 className="text-xl font-semibold">
              Which leg (“YES” vs “NO”) are these prices?
            </h3>
            <p>
              For binary markets, the system treats the stored price as the
              probability of the event happening — i.e. the <strong>“YES” leg</strong>. In other words, the
              value you see here should correspond to “YES”, and the implied “NO” price would be{" "}
              <code>1 − YES</code> up to fees and microstructure noise.
                Internally, the backend is designed around <em>YES-normalized</em> prices for binaries, so
                strategies and features all speak a common language: “probability this resolves true.”
              </p>
            <h3 className="text-xl font-semibold">
              Why do the prices on this dashboard look “swingier” than on Polymarket?
            </h3>
            <p>There are a few reasons.</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>We record every micro-move at the top of book</strong>
                <br />
                <code>market_quotes</code> captures each change in best bid/ask and mid. If the top of book
                jitters from 0.51 → 0.52 → 0.50 → 0.53, we record all those tiny moves.
                <br />
                Polymarket’s UI, by contrast, may emphasize:
                <ul className="list-disc list-inside space-y-1">
                  <li>Last trade.</li>
                  <li>Coarser refresh.</li>
                  <li>Some smoothing for charts.</li>
                </ul>
              </li>
              <li>
                <strong>Mid price vs. displayed price</strong>
                <br />
                The dashboard often uses <strong>mid price</strong> (<code>Mid</code>), or features derived
                from mid, whereas Polymarket may show:
                <ul className="list-disc list-inside space-y-1">
                  <li>Last executed price.</li>
                  <li>A VWAP-style value.</li>
                  <li>Or something closer to “yes” probability rounded for humans.</li>
                </ul>
                Mid price moves whenever <strong>either</strong> side of the order book moves, so it looks
                more “twitchy.”
              </li>
              <li>
                <strong>Raw derived features (ret, z-scores, σ) are intentionally sensitive</strong>
                <br />
                <code>Ret1m</code>, <code>Ret5m</code>, <code>Sigma5m</code>, <code>ZScore5m</code>, etc.,
                are designed for <strong>strategy design</strong>, not for a calm human-facing chart.
                <br />
                A strategy might care deeply about a 1–2% move that a human UI would barely highlight.
              </li>
              <li>
                <strong>Different time aggregation</strong>
                <br />
                Polymarket charts often aggregate over candles (e.g. 1m, 5m) and may interpolate missing
                data.
                <br />
                This dashboard shows <strong>point-in-time snapshots</strong> and derived stats without
                smoothing, so you see every wiggle.
              </li>
            </ol>
            <div className="border-l-4 border-emerald-400/80 bg-slate-900/10 px-4 py-3 rounded-md">
              <p>
                Bottom line: if the dashboard looks “swingier,” that’s intentional — it’s closer to the raw
                microstructure of the market than the public UI.
              </p>
            </div>
          </div>
        </details>
      </section>

      <hr className="my-8 border-slate-700/60" />

      {/* Market events */}
      <section id="market-events">
        <details className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>Market events: new markets, price jumps, state extremes</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "market-events")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-6">
            <h3 className="text-xl font-semibold">
              What are “New markets” in the events panel?
            </h3>
            <p>
              These are <code>new_market</code> events recorded in <code>market_events</code>:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>The gatherer notices a new Polymarket market / outcome.</li>
              <li>
                It emits a <code>MarketEvent</code> of type <code>new_market</code> with metadata such as:
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Market slug.</li>
                  <li>Question text.</li>
                  <li>Liquidity.</li>
                  <li>Volume.</li>
                  <li>Market age (hours since creation).</li>
                </ul>
              </li>
            </ul>
            <p>
              The frontend’s “New markets” tab shows the <strong>most recent markets</strong> detected by the
              system, ranked by detection time, not by popularity.
            </p>

            <h3 className="text-xl font-semibold">
              What are “Price jumps” / “state extremes”?
            </h3>
            <p>
              Internally, most of the “big price move” events use the <strong><code>state_extreme</code></strong>{" "}
              event type, which is based on:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Very high <code>ZScore5m</code> (price far from its recent mean).</li>
              <li>Often a large |<code>Ret1m</code>| as well.</li>
            </ul>
            <p>
              The frontend’s “Price jumps” tab focuses on “state extreme” events with{" "}
              <strong>large absolute returns</strong> (e.g. ≥ 5%) within the recent window. These are:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sharper moves.</li>
              <li>Often associated with news or sudden liquidity shifts.</li>
            </ul>
            <p>
              Because these are filtered by <strong>both</strong> event type and minimum return, it’s
              possible for the “Price jumps” tab to briefly have fewer entries than the raw volume of{" "}
              <code>state_extreme</code> events would suggest.
            </p>
          </div>
        </details>
      </section>

      <hr className="my-8 border-slate-700/60" />

      {/* Data retention */}
      <section id="data-retention">
        <details className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>Data retention, archiving, and disk space</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "data-retention")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-6">
            <h3 className="text-xl font-semibold">
              How do you avoid filling the disk?
            </h3>
            <p>The tables are:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Partitioned hourly</strong> into tables like{" "}
                <code>market_quotes_pYYYYMMDDHH</code>, etc.
              </li>
              <li>
                <strong>Archived</strong> by an archiver daemon that:
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Scans old partitions.</li>
                  <li>Writes them to S3 as compressed JSON.</li>
                  <li>Marks them as archived.</li>
                </ul>
              </li>
              <li>
                <strong>Cleaned up</strong> by a janitor daemon that:
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Drops archived partitions after a configurable retention window.</li>
                </ul>
              </li>
            </ul>
            <p>Current defaults (subject to tuning):</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Quotes kept in Postgres for ~2.4 hours.</li>
              <li>Trades for ~3.6 hours.</li>
              <li>Features for ~6 hours.</li>
            </ul>
            <p>
              Beyond that, the history lives in S3 and can be re-hydrated for research and backtests.
            </p>
          </div>
        </details>
      </section>

      <hr className="my-8 border-slate-700/60" />

      {/* Future goals */}
      <section id="future-goals">
        <details className="mt-4 group/section">
          <summary className="text-2xl font-semibold cursor-pointer flex items-center gap-2 before:mr-1 before:inline-block before:content-['▸'] group-open/section:before:content-['▾']">
            <span>Where this is going</span>
            <button
              type="button"
              aria-label="Copy link to this section"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={(e) => handleCopyLink(e, "future-goals")}
            >
              🔗
            </button>
          </summary>
          <div className="mt-4 space-y-6">
            <h3 className="text-xl font-semibold">
              What are the future goals of this project?
            </h3>
            <p>
              This data plane (gatherer + feature engine + persister + archiver + janitor + healthmonitor +
              API) is the <strong>foundation</strong>. The roadmap from here looks roughly like:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Richer strategy prototyping (“paper trading”)</strong>
                <br />
                Build out a dedicated strategies microservice that:
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Reads <code>market_features</code>, <code>market_trades</code>, and{" "}
                    <code>market_quotes</code>.
                  </li>
                  <li>Simulates entries/exits with realistic costs and constraints.</li>
                  <li>Logs PnL, drawdowns, and risk metrics back into Postgres.</li>
                </ul>
              </li>
              <li>
                <strong>Deeper analytics &amp; tools</strong>
                <br />
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Per-market dashboards with:
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Feature time series (ret, z, sigma, imbalance).</li>
                      <li>Liquidity and spread histories.</li>
                    </ul>
                  </li>
                  <li>
                    “Calculators” and visualizers for common trading concepts:
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Kelly sizing.</li>
                      <li>Probability conversion &amp; edge.</li>
                      <li>Volatility / Sharpe-style metrics specialized for prediction markets.</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Long-horizon research &amp; backtesting</strong>
                <br />
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Use the S3 archive to:
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Reconstruct order-book and feature histories over months.</li>
                      <li>Backtest complex strategies safely and repeatedly.</li>
                    </ul>
                  </li>
                  <li>
                    Compare strategies across:
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Elections / sports / crypto / “weird” markets.</li>
                      <li>Different time-to-resolution regimes.</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Live trading (once US access is permitted)</strong>
                <br />
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Gradually move a subset of strategies from paper trading to{" "}
                    <strong>live trading</strong> on Polymarket.
                  </li>
                  <li>Add risk controls, position limits, and live monitoring.</li>
                </ul>
              </li>
              <li>
                <strong>Potential monetization paths (still speculative)</strong>
                <br />
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Proprietary strategies:</strong> trade on own capital.
                  </li>
                  <li>
                    <strong>Data service:</strong> provide archived microstructure data to third parties.
                  </li>
                  <li>
                    <strong>Strategy subscriptions:</strong> allow others to allocate to specific strategies
                    and take a performance fee.
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              Everything on this frontend today is meant to be:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                A <strong>window into the health and behavior</strong> of the ingest pipeline.
              </li>
              <li>
                A <strong>playground</strong> for understanding how Polymarket behaves at the microstructure
                level.
              </li>
              <li>
                A <strong>foundation</strong> for future work in automated or semi-automated trading.
              </li>
            </ul>
          </div>
        </details>
      </section>
    </main>
  );
}
