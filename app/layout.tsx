import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Apacen Trading – Polymarket Data & Strategies",
  description:
    "Apacen Trading is a personal Polymarket data plane with high-volume ingest, Postgres partitions, and paper-trading strategies.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
