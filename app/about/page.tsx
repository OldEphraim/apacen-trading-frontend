export default function AboutPage() {
    return (
      <main className="min-h-screen">
        <section className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold mb-4">About Apacen Trading</h1>
          <div className="prose prose-invert max-w-none text-sm">
            <p>
              Apacen Trading (from the Quenya word <em>apacen</em>, “foresight”) is
              a personal project I built to understand what it takes to run a
              write-heavy trading backend on top of prediction markets.
            </p>
  
            <p>
              The system ingests Polymarket microstructure data via websocket
              (quotes and trades), computes rolling features in a feature engine,
              batches events in memory, and flushes them into Postgres using{" "}
              <code>COPY</code> into hourly-partitioned tables. Old partitions are
              archived to S3 and dropped by a janitor process to keep disk and WAL
              usage under control.
            </p>
  
            <p>
              On top of this data plane, a strategies microservice runs
              paper-trading strategies and records trades, positions, and P&amp;L.
              An API service exposes stats, fills, and per-strategy performance to
              this frontend. A healthmonitor daemon watches disk utilization, WAL
              volume, and archiver backlog, and adjusts behavior dynamically so
              the system doesn&apos;t quietly fall over after a few hours of
              traffic.
            </p>
  
            <p>
              This frontend is intentionally thin: it exists mainly as a live
              window into the running system. The heavy lifting happens in Go and
              Postgres. For a deeper dive into WAL, checkpoints, partitions,
              archiving, and profiling, see the write-ups on Substack:
            </p>
  
            <ul>
              <li>
                <a
                  href="https://oldephraim.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Polymarket / Apacen Trading blog series
                </a>
              </li>
            </ul>
  
            <p>
              If you&apos;re reading this as a recruiter: this project is
              primarily evidence that I can design, build, and observe a
              production-style, write-heavy backend under real load. The frontend
              and this dashboard are here to make that work easier to see.
            </p>
          </div>
        </section>
      </main>
    )
  }
  