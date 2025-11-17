import { NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL!
const API_KEY = process.env.API_KEY!

if (!API_BASE_URL || !API_KEY) {
  throw new Error("Missing API_BASE_URL or API_KEY")
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Base upstream URL
    const upstream = new URL(`${API_BASE_URL}/api/market-events`)

    // Forward all incoming query params
    searchParams.forEach((value, key) => {
      upstream.searchParams.set(key, value)
    })

    // Defaults if not provided
    if (!upstream.searchParams.has("hours")) {
      upstream.searchParams.set("hours", "0")
    }
    if (!upstream.searchParams.has("limit")) {
      upstream.searchParams.set("limit", "20")
    }

    const resp = await fetch(upstream.toString(), {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    })

    const text = await resp.text()

    if (!resp.ok) {
      return NextResponse.json(
        { error: `API error: ${resp.statusText}`, body: text },
        { status: resp.status },
      )
    }

    const data = JSON.parse(text)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch market events", details: String(err) },
      { status: 500 },
    )
  }
}
