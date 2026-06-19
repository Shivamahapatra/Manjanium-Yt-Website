import { NextResponse } from 'next/server';

const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const FALLBACK_DATES = '20221120-20221218'; // 2022 World Cup dates

function extractGoalScorers(details: any[], homeTeamName: string, awayTeamName: string, homeTeamId: string) {
  if (!details || !Array.isArray(details)) return [];
  
  const goals: any[] = [];
  
  details.forEach(d => {
    if (d.scoringPlay && !d.shootout && d.athletesInvolved && d.athletesInvolved.length > 0) {
      const isHome = d.team?.id === homeTeamId;
      const teamName = isHome ? homeTeamName : awayTeamName;
      
      const primaryPlayer = d.athletesInvolved[0];
      let assistPlayer = null;
      if (d.athletesInvolved.length > 1) {
        assistPlayer = d.athletesInvolved[1].displayName;
      }

      goals.push({
        player: primaryPlayer.displayName,
        team: teamName,
        minute: d.clock?.displayValue ? parseInt(d.clock.displayValue.replace("'", ''), 10) : 0,
        assistPlayer
      });
    }
  });

  return goals;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    // const groupId = searchParams.get('groupId'); // Could be used later to filter by 'Group A'

    // Fetch past matches (Hardcoded 2022 WC dates to guarantee real past data until 2026 starts)
    const res = await fetch(`${SCOREBOARD_URL}?dates=${FALLBACK_DATES}`, { next: { revalidate: 86400 } });
    
    if (!res.ok) {
      throw new Error(`ESPN API responded with ${res.status}`);
    }

    const data = await res.json();
    const events = data.events || [];

    const matches = events.map((event: any) => {
      const competition = event.competitions[0];
      const homeTeamObj = competition.competitors.find((c: any) => c.homeAway === 'home');
      const awayTeamObj = competition.competitors.find((c: any) => c.homeAway === 'away');
      
      // Attempt to extract group or round name
      let groupName = 'Knockout Stage';
      if (event.season?.type === 1 || competition.notes?.[0]?.headline?.toLowerCase().includes('group')) {
        groupName = competition.notes?.[0]?.headline || 'Group Stage';
      }

      return {
        id: event.id,
        homeTeam: {
          id: homeTeamObj?.team?.id,
          name: homeTeamObj?.team?.displayName,
          logo: homeTeamObj?.team?.logo,
          score: parseInt(homeTeamObj?.score || '0', 10)
        },
        awayTeam: {
          id: awayTeamObj?.team?.id,
          name: awayTeamObj?.team?.displayName,
          logo: awayTeamObj?.team?.logo,
          score: parseInt(awayTeamObj?.score || '0', 10)
        },
        status: competition.status.type.state === 'post' ? 'finished' : 'live',
        kickoffTime: event.date,
        group: groupName,
        venue: competition.venue?.fullName 
          ? `${competition.venue.fullName}${competition.venue.address?.city ? `, ${competition.venue.address.city}` : ''}` 
          : 'Unknown',
        goalScorers: extractGoalScorers(
          competition.details, 
          homeTeamObj?.team?.displayName, 
          awayTeamObj?.team?.displayName,
          homeTeamObj?.team?.id
        )
      };
    });

    // Optionally sort by date descending (most recent past match first)
    matches.sort((a: any, b: any) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime());

    return NextResponse.json({
      matches: matches.slice(0, limit),
      totalMatches: matches.length
    });

  } catch (error: any) {
    console.error("Past Matches API Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch past matches', details: error.message },
      { status: 503 }
    );
  }
}
