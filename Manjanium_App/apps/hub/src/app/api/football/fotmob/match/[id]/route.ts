import { NextRequest, NextResponse } from 'next/server'

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${TELEMETRY_URL}/api/football/match/${params.id}`,
      { cache: 'no-store', signal: AbortSignal.timeout(20000) }
    )
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Match details unavailable' }, { status: 200 })
  }
}
