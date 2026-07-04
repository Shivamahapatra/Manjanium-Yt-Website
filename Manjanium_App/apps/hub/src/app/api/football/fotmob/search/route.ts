import { NextRequest, NextResponse } from 'next/server'

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')
    
    if (!term) {
      return NextResponse.json({ error: 'Search term required' }, { status: 400 })
    }

    const response = await fetch(
      `${TELEMETRY_URL}/api/football/search?term=${encodeURIComponent(term)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    )
    
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Search unavailable' }, { status: 200 })
  }
}
