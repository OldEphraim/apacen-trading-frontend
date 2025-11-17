import { NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL!
const API_KEY = process.env.API_KEY!

if (!API_BASE_URL || !API_KEY) {
  throw new Error("Missing API_BASE_URL or API_KEY")
}

export async function GET() {
  try {
    const url = `${API_BASE_URL}/api/stream-lag`

    const resp = await fetch(url, {
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
      { error: "Failed to fetch stream lag", details: String(err) },
      { status: 500 },
    )
  }
}
