import { NextResponse } from 'next/server';

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

    // Fetch teams and matches concurrently from worldcup26 API
    const [teamsRes, gamesRes] = await Promise.all([
      fetch('https://worldcup26.ir/get/teams', { next: { revalidate: 3600 } }), // Teams don't change often
      fetch('https://worldcup26.ir/get/games', { cache: 'no-store' }) // Games update live
    ]);

    if (!teamsRes.ok || !gamesRes.ok) {
      throw new Error(`API error: Teams ${teamsRes.status}, Games ${gamesRes.status}`);
    }

    const teamsJson = await teamsRes.json();
    const gamesJson = await gamesRes.json();
    
    const teamsList = teamsJson.teams || [];
    const gamesList = gamesJson.games || [];

    // Map team IDs to team data for fast lookup
    const teamMap: Record<string, any> = {};
    teamsList.forEach((team: any) => {
      teamMap[team.id] = team;
    });

    // We only want knockout rounds
    const knockoutGroups = ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'];
    
    const matches = gamesList
      .filter((game: any) => knockoutGroups.includes(game.group.toUpperCase()))
      .map((game: any) => {
        // Map round names for the frontend
        let roundName = game.group;
        if (game.group.toUpperCase() === 'R32') roundName = 'Round of 32';
        else if (game.group.toUpperCase() === 'R16') roundName = 'Round of 16';
        else if (game.group.toUpperCase() === 'QF') roundName = 'Quarter-Finals';
        else if (game.group.toUpperCase() === 'SF') roundName = 'Semi-Finals';
        else if (game.group.toUpperCase() === '3RD') roundName = 'Third Place Play-off';
        else if (game.group.toUpperCase() === 'FINAL') roundName = 'Final';

        const team1 = teamMap[game.home_team_id];
        const team2 = teamMap[game.away_team_id];
        
        // Ensure scores are numbers, parse strings if necessary
        const s1 = parseInt(game.home_score, 10);
        const s2 = parseInt(game.away_score, 10);
        
        return {
          id: game._id?.$oid || game.id,
          match_id: `m${game.id}`,
          round: roundName,
          team1: team1 ? team1.name_en : 'TBD',
          team2: team2 ? team2.name_en : 'TBD',
          logo1: team1 ? team1.flag : '',
          logo2: team2 ? team2.flag : '',
          score1: isNaN(s1) ? null : s1,
          score2: isNaN(s2) ? null : s2,
          pen1: game.home_penalty ? parseInt(game.home_penalty, 10) : undefined,
          pen2: game.away_penalty ? parseInt(game.away_penalty, 10) : undefined,
          isPlaceholder: !team1 || !team2
        };
      })
      .sort((a: any, b: any) => {
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
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
