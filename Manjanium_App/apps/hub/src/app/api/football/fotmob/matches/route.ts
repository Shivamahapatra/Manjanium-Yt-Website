import { NextRequest, NextResponse } from 'next/server'

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || ''
    
    const response = await fetch(
      `${TELEMETRY_URL}/api/football/matches${date ? `?date_str=${date}` : ''}`,
      { cache: 'no-store', signal: AbortSignal.timeout(20000) }
    )
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'FotMob unavailable', leagues: [] }, { status: 200 })
  }
}
