import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Assuming standard import

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tournament_brackets')
      .select('*')
      .eq('tournament_id', 'fifa_wc_2026');

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Sort logic to match the frontend expectations, or just return as is
    // The frontend filters by round name.
    
    // Convert to the shape KnockoutBrackets.tsx expects
    const matches = data.map((row: any) => ({
      id: row.id,
      match_id: row.match_id,
      round: row.round,
      team1: row.team1,
      team2: row.team2,
      logo1: row.logo1,
      logo2: row.logo2,
      score1: row.score1,
      score2: row.score2,
      pen1: row.ps_score ? row.ps_score[0] : undefined,
      pen2: row.ps_score ? row.ps_score[1] : undefined,
      isPlaceholder: row.team1?.includes('Winner') || row.team1?.includes('Runner-up') || row.team1?.includes('Loser')
    })).sort((a: any, b: any) => {
      const numA = parseInt(a.match_id.replace('m', ''), 10);
      const numB = parseInt(b.match_id.replace('m', ''), 10);
      return numA - numB;
    });

    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
