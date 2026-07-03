import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
)

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('user_customization')
      .select('f1_dashboard_preset, football_dashboard_preset')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (acceptable)
      console.error('Supabase error:', error)
      return NextResponse.json(
        { f1_dashboard_preset: 'live-focused', football_dashboard_preset: 'live-matches' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      data || { f1_dashboard_preset: 'live-focused', football_dashboard_preset: 'live-matches' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Preferences API error:', error)
    // Return defaults instead of crashing
    return NextResponse.json(
      { f1_dashboard_preset: 'live-focused', football_dashboard_preset: 'live-matches' },
      { status: 200 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { f1_dashboard_preset, football_dashboard_preset } = body

    const { error } = await supabase
      .from('user_customization')
      .upsert(
        {
          user_id: userId,
          f1_dashboard_preset: f1_dashboard_preset || 'live-focused',
          football_dashboard_preset: football_dashboard_preset || 'live-matches',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Preferences POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
