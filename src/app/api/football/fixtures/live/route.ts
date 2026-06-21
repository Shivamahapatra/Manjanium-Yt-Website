import { NextResponse } from 'next/server';

let cachedLiveResponse: any = null;
let lastLiveFetched = 0;
const LIVE_CACHE_TTL = 15000; // 15 seconds cache

export async function GET() {
  try {
    const now = Date.now();
    if (cachedLiveResponse && (now - lastLiveFetched < LIVE_CACHE_TTL)) {
      return NextResponse.json(cachedLiveResponse);
    }

    const [liveRes, standingsRes] = await Promise.all([
      fetch(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard',
        { cache: 'no-store' }
      ),
      fetch(
        'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings',
        { next: { revalidate: 60 } }
      )
    ]);

    const liveData = await liveRes.json();
    const standingsData = await standingsRes.json();

    // Map ESPN format to match your existing frontend shape
    const matches = (liveData.events || []).map((event: any) => {
      const comp = event.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
      const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
      const status = event.status;

      return {
        fixture: {
          id: event.id,
          date: event.date,
          status: {
            short: status.type.shortDetail,
            elapsed: status.displayClock?.replace("'", '') || null,
          },
          venue: { name: comp?.venue?.fullName || 'TBD' }
        },
        league: {
          name: 'FIFA World Cup 2026',
          logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/4f10737c.png',
          season: '2026'
        },
        teams: {
          home: {
            name: home?.team?.displayName,
            logo: home?.team?.logo
          },
          away: {
            name: away?.team?.displayName,
            logo: away?.team?.logo
          }
        },
        goals: {
          home: parseInt(home?.score) || 0,
          away: parseInt(away?.score) || 0
        },
        isLive: status.type.state === 'in',
        isUpcoming: status.type.state === 'pre'
      };
    });

    // Map ESPN standings format
    const groups = (standingsData.standings || []).map((group: any) => ({
      groupName: group.name,
      teams: (group.entries || []).map((entry: any) => ({
        team: {
          name: entry.team.displayName,
          logo: entry.team.logos?.[0]?.href
        },
        played: entry.stats?.find((s: any) => s.name === 'gamesPlayed')?.value || 0,
        win: entry.stats?.find((s: any) => s.name === 'wins')?.value || 0,
        draw: entry.stats?.find((s: any) => s.name === 'ties')?.value || 0,
        lose: entry.stats?.find((s: any) => s.name === 'losses')?.value || 0,
        goalsDiff: entry.stats?.find((s: any) => s.name === 'pointDifferential')?.value || 0,
        points: entry.stats?.find((s: any) => s.name === 'points')?.value || 0
      }))
    }));

    const finalResponse = {
      response: matches,
      standings: groups,
      debug: {
        matchCount: matches.length,
        liveCount: matches.filter((m: any) => m.isLive).length,
        upcomingCount: matches.filter((m: any) => m.isUpcoming).length,
        groupCount: groups.length
      }
    };

    cachedLiveResponse = finalResponse;
    lastLiveFetched = now;

    return NextResponse.json(finalResponse);

  } catch (error) {
    return NextResponse.json(
      { response: [], standings: [], error: String(error) },
      { status: 500 }
    );
  }
}
