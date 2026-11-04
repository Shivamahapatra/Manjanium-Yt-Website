import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || searchParams.get('date_str') || ''
    
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    
    const response = await fetch(
      `${TELEMETRY_URL}/api/matches?${params.toString()}`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(15000)
      }
    )
    
    if (!response.ok) {
      // Fallback to combined-matches if /api/matches fails
      const fallbackResp = await fetch(
        `${TELEMETRY_URL}/api/football/combined-matches?date_str=${encodeURIComponent(date)}`,
        { cache: 'no-store', signal: AbortSignal.timeout(15000) }
      )
      if (fallbackResp.ok) {
        const fallbackData = await fallbackResp.json()
        return NextResponse.json(fallbackData, { status: 200 })
      }
    }

    const data = await response.json()
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Error proxying football matches:', error)
    return NextResponse.json({ error: 'Service unavailable', leagues: [] }, { status: 200 })
  }
}
