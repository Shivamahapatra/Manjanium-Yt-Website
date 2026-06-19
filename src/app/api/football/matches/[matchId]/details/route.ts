import { NextResponse } from 'next/server';

const SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary';

function formatStatus(statusType: any) {
  const state = statusType.state; // 'pre', 'in', 'post'
  if (state === 'post') return 'finished';
  if (state === 'in') return 'live';
  return 'upcoming';
}

function processRoster(rosters: any[], teamId: string) {
  const teamRoster = rosters.find((r: any) => r.team.id === teamId);
  if (!teamRoster || !teamRoster.roster) return { lineup: [], substitutes: [] };

  const lineup: any[] = [];
  const substitutes: any[] = [];

  teamRoster.roster.forEach((p: any) => {
    const athlete = p.athlete;
    const playerObj = {
      id: athlete.id,
      name: athlete.displayName,
      number: p.jersey ? parseInt(p.jersey, 10) : 0,
      position: athlete.position?.abbreviation || 'N/A',
      photo: athlete.headshot?.href || '',
      status: p.starter ? 'on_field' : 'bench',
      isSubstituted: p.substituted === true,
      minuteSubstitutedOut: p.substitutedOutTime || null,
      minuteSubstitutedIn: p.substitutedInTime || null,
      yellowCards: p.stats?.find((s: any) => s.name === 'yellowCards')?.value || 0,
      redCards: p.stats?.find((s: any) => s.name === 'redCards')?.value || 0
    };

    if (p.starter) {
      lineup.push(playerObj);
    } else {
      substitutes.push(playerObj);
    }
  });

  return { lineup, substitutes };
}

function extractTeam(headerTeam: any, rosters: any[], isHome: boolean) {
  const { lineup, substitutes } = processRoster(rosters, headerTeam.team.id);
  return {
    id: headerTeam.team.id,
    name: headerTeam.team.displayName,
    logo: headerTeam.team.logos?.[0]?.href || '',
    score: headerTeam.score || 0,
    formation: headerTeam.formation || 'Unknown',
    lineup,
    substitutes
  };
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
    
    if (!data.header || !data.header.competitions || !data.header.competitions[0]) {
      return NextResponse.json({ error: 'Invalid match data' }, { status: 404 });
    }

    const competition = data.header.competitions[0];
    const gameInfo = data.gameInfo || {};
    const rosters = data.rosters || [];

    const homeCompetitor = competition.competitors.find((c: any) => c.homeAway === 'home');
    const awayCompetitor = competition.competitors.find((c: any) => c.homeAway === 'away');

    const matchDetails = {
      match: {
        id: matchId,
        status: formatStatus(competition.status.type),
        kickoffTime: competition.date,
        endTime: null, // ESPN doesn't strictly provide an end time timestamp outside of the clock
        elapsedTime: competition.status.displayClock || 0,
        currentPeriod: competition.status.period,
        homeTeam: homeCompetitor ? extractTeam(homeCompetitor, rosters, true) : null,
        awayTeam: awayCompetitor ? extractTeam(awayCompetitor, rosters, false) : null,
        venue: {
          name: gameInfo.venue?.fullName || 'Unknown Stadium',
          city: gameInfo.venue?.address?.city || 'Unknown City',
          country: gameInfo.venue?.address?.country || 'Unknown Country'
        }
      }
    };

    return NextResponse.json(matchDetails);

  } catch (error: any) {
    console.error("Match Details API Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch match details', details: error.message },
      { status: 503 }
    );
  }
}
