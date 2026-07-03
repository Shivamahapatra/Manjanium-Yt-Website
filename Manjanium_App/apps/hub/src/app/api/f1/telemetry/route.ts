import { NextRequest, NextResponse } from 'next/server'

const TELEMETRY_URL = process.env.TELEMETRY_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || '2024'
    const round = searchParams.get('round') || '1'
    const session = searchParams.get('session') || 'Q'
    const driver1 = searchParams.get('driver1') || 'VER'
    const driver2 = searchParams.get('driver2') || 'HAM'
    const lap = searchParams.get('lap') || 'fastest'

    const pythonUrl = `${TELEMETRY_URL}/api/compare-laps?year=${year}&round=${round}&session=${session}&driver1=${driver1}&driver2=${driver2}&lap=${lap}`

    const response = await fetch(pythonUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(30000), // 30s timeout for cold starts
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Telemetry service error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300', // Cache telemetry for 5 min
      },
    })
  } catch (error) {
    console.error('Telemetry proxy error:', error)
    return NextResponse.json(
      {
        error: 'Telemetry service unavailable',
        fallback: true,
        message: 'Run: pnpm dev:telemetry to start the FastF1 service',
      },
      { status: 503 }
    )
  }
}
