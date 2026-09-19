import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || ''
    const expand = searchParams.get('expand') || '3'
    
    const params = new URLSearchParams()
    if (date) params.set('date_str', date)
    params.set('expand_days', expand)
    
    const response = await fetch(
      `${TELEMETRY_URL}/api/football/combined-matches?${params.toString()}`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(20000)
      }
    )
    const data = await response.json()
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    })
  } catch {
    return NextResponse.json({ error: 'Service unavailable', leagues: [] }, { status: 200 })
  }
}

