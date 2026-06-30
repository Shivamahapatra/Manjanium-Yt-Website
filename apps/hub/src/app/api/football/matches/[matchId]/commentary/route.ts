import { NextResponse } from 'next/server';

const SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary';

function determineEventType(text: string, playType?: any): string {
  const t = text.toLowerCase();
  if (playType && playType.text) {
    const pt = playType.text.toLowerCase();
    if (pt.includes('goal')) return 'goal';
    if (pt.includes('yellow card')) return 'card';
    if (pt.includes('red card')) return 'card';
    if (pt.includes('substitution')) return 'substitution';
    if (pt.includes('foul')) return 'foul';
    if (pt.includes('attempt')) return 'chance';
    if (pt.includes('save')) return 'chance';
  }

  // Fallback to text parsing
  if (t.includes('goal!')) return 'goal';
  if (t.includes('yellow card')) return 'card';
  if (t.includes('red card')) return 'card';
  if (t.includes('substitution')) return 'substitution';
  if (t.includes('foul')) return 'foul';
  if (t.includes('attempt') || t.includes('miss') || t.includes('shot')) return 'chance';
  
  return 'commentary';
}

function parseCommentary(play: any, teams: any[]): any {
  let teamId = play.team?.id;
  let teamName = "Unknown";
  
  if (teamId && teams) {
    const teamObj = teams.find(t => t.team?.id === teamId);
    if (teamObj) teamName = teamObj.team?.homeAway || 'unknownTeam';
  }

  let cardType = null;
  if (play.type?.text?.toLowerCase().includes('yellow')) cardType = 'yellow';
  if (play.type?.text?.toLowerCase().includes('red')) cardType = 'red';

  const evt: any = {
    id: play.id || `event_${Math.random().toString(36).substr(2, 9)}`,
    minute: play.clock?.displayValue ? parseInt(play.clock.displayValue.split(':')[0], 10) : 0,
    second: play.clock?.displayValue ? parseInt(play.clock.displayValue.split(':')[1], 10) : 0,
    type: determineEventType(play.text, play.type),
    team: teamName, // 'home' or 'away'
    description: play.text,
  };

  // Extract players involved if provided in play.participants
  if (play.participants && play.participants.length > 0) {
    evt.player = {
      id: play.participants[0].athlete?.id || 'unknown',
      name: play.participants[0].athlete?.displayName || 'Unknown Player',
      number: 0 // ESPN doesn't strictly give jersey number in commentary participants without cross-referencing
    };
    
    if (play.participants.length > 1) {
      evt.assistPlayer = {
        id: play.participants[1].athlete?.id || 'unknown',
        name: play.participants[1].athlete?.displayName || 'Unknown Player',
        number: 0
      };
    }
  }

  if (cardType) evt.cardType = cardType;

  return evt;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    
    // Check if '?live=true' was requested to enforce live polling behaviors if needed
    // const { searchParams } = new URL(request.url);
    // const isLiveRequested = searchParams.get('live') === 'true';

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
    const isLive = competition.status.type.state === 'in';
    const plays = data.plays || [];
    const teams = competition.competitors || [];

    // Reverse plays to show chronological if needed, or keep ESPN's default descending (newest first).
    // The prompt asks for an array of events. We will map them descending (latest first).
    const events = plays
      .filter((p: any) => p.text) // filter out blank items
      .map((p: any) => parseCommentary(p, teams));

    return NextResponse.json({
      events,
      lastUpdated: new Date().toISOString(),
      isLive
    });

  } catch (error: any) {
    console.error("Match Commentary API Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch match commentary', details: error.message },
      { status: 503 }
    );
  }
}
