import { NextResponse } from 'next/server';
import { fallbackData } from '@/components/football/fallbackData';

// Fallback memory cache to prevent rate-limiting ourselves too heavily if called frequently
let cachedMatches: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function GET() {
  try {
    const now = Date.now();
    
    // Check if we have a valid cache
    if (cachedMatches && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json(cachedMatches);
    }

    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260719', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('ESPN API error: ' + res.status);
    }
    const data = await res.json();
    
    const matches = (data.events || []).map((e: any, index: number) => {
        const home = e.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
        const away = e.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
        
        let round = 'Round of 32';
        if (index >= 16 && index <= 23) round = 'Round of 16';
        if (index >= 24 && index <= 27) round = 'Quarter-Finals';
        if (index >= 28 && index <= 29) round = 'Semi-Finals';
        if (index === 30) round = 'Third-Place';
        if (index === 31) round = 'Final';

        // ESPN index 0 is Match 73
        let idNum = index + 73;
        // Third place is match 103, Final is 104
        if (index === 31) idNum = 104;

        let pen1, pen2;
        if (e.status.type.shortDetail === 'FT-Pens') {
           // Parse penalties if available
        }

        const score1 = home.score ? parseInt(home.score) : null;
        const score2 = away.score ? parseInt(away.score) : null;

        return {
            id: String(idNum),
            match_id: 'm' + idNum,
            round,
            team1: home.team.displayName,
            team2: away.team.displayName,
            logo1: home.team.logo,
            logo2: away.team.logo,
            score1: isNaN(score1 as any) ? null : score1,
            score2: isNaN(score2 as any) ? null : score2,
            pen1,
            pen2,
            isPlaceholder: home.team.displayName.includes('Winner') || home.team.displayName.includes('Loser') || home.team.displayName.includes('RD') || home.team.displayName.includes('QF') || home.team.displayName.includes('SF') || home.team.displayName.includes('L1') || home.team.displayName.includes('L2') || home.team.displayName.includes('W1') || home.team.displayName.includes('W2')
        };
    }).sort((a: any, b: any) => {
        const idA = a.match_id.replace('m', '');
        const idB = b.match_id.replace('m', '');
        
        // Define the exact visual order from top-to-bottom for the bracket to connect properly
        const matchOrder: Record<string, number> = {
          // R32
          '74': 1, '77': 2, '73': 3, '75': 4,
          '83': 5, '84': 6, '81': 7, '82': 8,
          '76': 9, '78': 10, '79': 11, '80': 12,
          '86': 13, '88': 14, '85': 15, '87': 16,
          // R16
          '89': 1, '90': 2, '93': 3, '94': 4,
          '91': 5, '92': 6, '95': 7, '96': 8,
          // QF
          '97': 1, '98': 2, '99': 3, '100': 4,
          // SF
          '101': 1, '102': 2,
          // Final
          '104': 1
        };

        const orderA = matchOrder[idA] || parseInt(idA, 10);
        const orderB = matchOrder[idB] || parseInt(idB, 10);
        return orderA - orderB;
      });

    // Update cache
    cachedMatches = matches;
    lastFetchTime = now;

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching knockout data:", error);
    // If external API fails, we could potentially return cached data if available, even if stale
    if (cachedMatches) {
      return NextResponse.json(cachedMatches);
    }
    // Return fallbackData on 200 instead of failing with 500 to avoid console red errors
    return NextResponse.json(fallbackData);
  }
}
