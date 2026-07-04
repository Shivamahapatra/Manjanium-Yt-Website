import { NextRequest, NextResponse } from 'next/server'

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')
    
    const url = new URL(`${TELEMETRY_URL}/api/football/league/${params.id}`)
    if (season) {
      url.searchParams.append('season', season)
    }

    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'League standings unavailable', standings: [] }, { status: 200 })
  }
}
