import { NextResponse } from 'next/server';

let cachedKnockouts: any = null;
let lastFetched = 0;
const CACHE_TTL = 3600000; // 1 hour

export async function GET() {
  try {
    const now = Date.now();
    if (cachedKnockouts && (now - lastFetched < CACHE_TTL)) {
      return NextResponse.json(cachedKnockouts);
    }

    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260719', { cache: 'no-store' });
    const data = await res.json();
    
    const matches = (data.events || []).map((e: any, index: number) => {
        const home = e.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
        const away = e.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
        const date = new Date(e.date);
        
        let round = 'Round of 32';
        if (index >= 16 && index <= 23) round = 'Round of 16';
        if (index >= 24 && index <= 27) round = 'Quarter-Finals';
        if (index >= 28 && index <= 29) round = 'Semi-Finals';
        if (index === 30) round = 'Third-Place';
        if (index === 31) round = 'Final';

        let pen1, pen2;
        if (e.status.type.shortDetail === 'FT-Pens') {
            // Note: In real life you would parse penalty data deeply, but we'll leave it empty unless available
        }

        return {
            id: String(index + 1),
            match_id: e.id,
            round,
            team1: home.team.displayName,
            team2: away.team.displayName,
            logo1: home.team.logo,
            logo2: away.team.logo,
            score1: parseInt(home.score),
            score2: parseInt(away.score),
            pen1,
            pen2,
            isPlaceholder: home.team.displayName.includes('Winner') || home.team.displayName.includes('Loser')
        };
    });

    cachedKnockouts = matches;
    lastFetched = now;

    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
