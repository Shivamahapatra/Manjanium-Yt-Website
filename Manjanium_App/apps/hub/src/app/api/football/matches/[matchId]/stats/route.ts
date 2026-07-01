import { NextResponse } from 'next/server';

const SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary';

const STATS_MAP: Record<string, string> = {
  possessionPct: 'possession',
  shotsOnTarget: 'shotsOnTarget',
  totalShots: 'shots',
  totalPasses: 'passes',
  passPct: 'passCompletion',
  totalTackles: 'tackles',
  interceptions: 'interceptions',
  foulsCommitted: 'fouls',
  wonCorners: 'corners',
  offsides: 'offsides',
  saves: 'saves',
  yellowCards: 'yellowCards',
  redCards: 'redCards',
};

function parseStatValue(key: string, value: string): number {
  if (!value) return 0;
  
  // Clean up strings like "85.5%" or "450"
  const cleaned = value.replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function extractTeamStats(teamData: any) {
  const statsObj: Record<string, number> = {
    possession: 0,
    shotsOnTarget: 0,
    shots: 0,
    passes: 0,
    passCompletion: 0,
    tackles: 0,
    interceptions: 0,
    fouls: 0,
    corners: 0,
    offsides: 0,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
  };

  if (teamData && teamData.statistics) {
    teamData.statistics.forEach((stat: any) => {
      const mappedKey = STATS_MAP[stat.name];
      if (mappedKey) {
        statsObj[mappedKey] = parseStatValue(mappedKey, stat.displayValue);
      }
    });
  }

  return statsObj;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const res = await fetch(`${SUMMARY_URL}?event=${matchId}`);
    
    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      throw new Error(`ESPN API responded with ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.boxscore || !data.boxscore.teams || !data.header || !data.header.competitions) {
      return NextResponse.json({ error: 'Stats not available for this match' }, { status: 404 });
    }

    const boxscoreTeams = data.boxscore.teams;
    const competitors = data.header.competitions[0].competitors;

    // Match boxscore teams to 'home' or 'away' via the header competitors
    const homeTeamId = competitors.find((c: any) => c.homeAway === 'home')?.team?.id;
    const awayTeamId = competitors.find((c: any) => c.homeAway === 'away')?.team?.id;

    const homeBoxscore = boxscoreTeams.find((t: any) => t.team?.id === homeTeamId);
    const awayBoxscore = boxscoreTeams.find((t: any) => t.team?.id === awayTeamId);

    return NextResponse.json({
      matchStats: {
        homeTeam: extractTeamStats(homeBoxscore),
        awayTeam: extractTeamStats(awayBoxscore)
      }
    });

  } catch (error: any) {
    console.error("Match Stats API Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch match stats', details: error.message },
      { status: 503 }
    );
  }
}
