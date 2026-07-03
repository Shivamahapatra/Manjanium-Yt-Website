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
    const matches = data.map((row: any) => {
      // Simulate real teams for Round of 32
      const simData: any = {
        'm73': { t1: 'Mexico', t2: 'Senegal', l1: 'https://flagcdn.com/w40/mx.png', l2: 'https://flagcdn.com/w40/sn.png', s1: 2, s2: 1 },
        'm74': { t1: 'England', t2: 'Uruguay', l1: 'https://flagcdn.com/w40/gb-eng.png', l2: 'https://flagcdn.com/w40/uy.png', s1: 3, s2: 0 },
        'm75': { t1: 'France', t2: 'Japan', l1: 'https://flagcdn.com/w40/fr.png', l2: 'https://flagcdn.com/w40/jp.png', s1: 2, s2: 0 },
        'm76': { t1: 'Canada', t2: 'Morocco', l1: 'https://flagcdn.com/w40/ca.png', l2: 'https://flagcdn.com/w40/ma.png', s1: 1, s2: 2 },
        'm77': { t1: 'Spain', t2: 'Ecuador', l1: 'https://flagcdn.com/w40/es.png', l2: 'https://flagcdn.com/w40/ec.png', s1: 2, s2: 1 },
        'm78': { t1: 'Denmark', t2: 'Switzerland', l1: 'https://flagcdn.com/w40/dk.png', l2: 'https://flagcdn.com/w40/ch.png', s1: 1, s2: 1, ps: [4,5] },
        'm79': { t1: 'Argentina', t2: 'Iran', l1: 'https://flagcdn.com/w40/ar.png', l2: 'https://flagcdn.com/w40/ir.png', s1: 3, s2: 0 },
        'm80': { t1: 'Netherlands', t2: 'South Korea', l1: 'https://flagcdn.com/w40/nl.png', l2: 'https://flagcdn.com/w40/kr.png', s1: 2, s2: 1 },
        'm81': { t1: 'USA', t2: 'Cameroon', l1: 'https://flagcdn.com/w40/us.png', l2: 'https://flagcdn.com/w40/cm.png', s1: 2, s2: 1 },
        'm82': { t1: 'Brazil', t2: 'Ghana', l1: 'https://flagcdn.com/w40/br.png', l2: 'https://flagcdn.com/w40/gh.png', s1: 3, s2: 1 },
        'm83': { t1: 'Germany', t2: 'Wales', l1: 'https://flagcdn.com/w40/de.png', l2: 'https://flagcdn.com/w40/gb-wls.png', s1: 2, s2: 0 },
        'm84': { t1: 'Portugal', t2: 'Saudi Arabia', l1: 'https://flagcdn.com/w40/pt.png', l2: 'https://flagcdn.com/w40/sa.png', s1: 4, s2: 0 },
        'm85': { t1: 'Italy', t2: 'Ivory Coast', l1: 'https://flagcdn.com/w40/it.png', l2: 'https://flagcdn.com/w40/ci.png', s1: 1, s2: 0 },
        'm86': { t1: 'Colombia', t2: 'Australia', l1: 'https://flagcdn.com/w40/co.png', l2: 'https://flagcdn.com/w40/au.png', s1: 2, s2: 1 },
        'm87': { t1: 'Belgium', t2: 'Nigeria', l1: 'https://flagcdn.com/w40/be.png', l2: 'https://flagcdn.com/w40/ng.png', s1: 3, s2: 2 },
        'm88': { t1: 'Croatia', t2: 'Sweden', l1: 'https://flagcdn.com/w40/hr.png', l2: 'https://flagcdn.com/w40/se.png', s1: 1, s2: 0 },
        
        // Round of 16 propagation
        'm89': { t1: 'Mexico', t2: 'England', l1: 'https://flagcdn.com/w40/mx.png', l2: 'https://flagcdn.com/w40/gb-eng.png' },
        'm90': { t1: 'France', t2: 'Morocco', l1: 'https://flagcdn.com/w40/fr.png', l2: 'https://flagcdn.com/w40/ma.png' },
        'm91': { t1: 'Spain', t2: 'Switzerland', l1: 'https://flagcdn.com/w40/es.png', l2: 'https://flagcdn.com/w40/ch.png' },
        'm92': { t1: 'Argentina', t2: 'Netherlands', l1: 'https://flagcdn.com/w40/ar.png', l2: 'https://flagcdn.com/w40/nl.png' },
        'm93': { t1: 'USA', t2: 'Brazil', l1: 'https://flagcdn.com/w40/us.png', l2: 'https://flagcdn.com/w40/br.png' },
        'm94': { t1: 'Germany', t2: 'Portugal', l1: 'https://flagcdn.com/w40/de.png', l2: 'https://flagcdn.com/w40/pt.png' },
        'm95': { t1: 'Italy', t2: 'Colombia', l1: 'https://flagcdn.com/w40/it.png', l2: 'https://flagcdn.com/w40/co.png' },
        'm96': { t1: 'Belgium', t2: 'Croatia', l1: 'https://flagcdn.com/w40/be.png', l2: 'https://flagcdn.com/w40/hr.png' }
      };

      const sim = simData[row.match_id];
      const isSim = !!sim;

      return {
        id: row.id,
        match_id: row.match_id,
        round: row.round,
        team1: isSim ? sim.t1 : row.team1,
        team2: isSim ? sim.t2 : row.team2,
        logo1: isSim ? sim.l1 : row.logo1,
        logo2: isSim ? sim.l2 : row.logo2,
        score1: isSim && sim.s1 !== undefined ? sim.s1 : row.score1,
        score2: isSim && sim.s2 !== undefined ? sim.s2 : row.score2,
        pen1: isSim && sim.ps ? sim.ps[0] : (row.ps_score ? row.ps_score[0] : undefined),
        pen2: isSim && sim.ps ? sim.ps[1] : (row.ps_score ? row.ps_score[1] : undefined),
        isPlaceholder: false
      };
    }).sort((a: any, b: any) => {
      const numA = parseInt(a.match_id.replace('m', ''), 10);
      const numB = parseInt(b.match_id.replace('m', ''), 10);
      return numA - numB;
    });

    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
