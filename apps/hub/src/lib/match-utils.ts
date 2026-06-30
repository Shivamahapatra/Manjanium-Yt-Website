import { MatchEvent, Lineup } from '@/types/match';

// 1. formatMatchTime
export function formatMatchTime(kickoffTime: string): string {
  const date = new Date(kickoffTime);
  const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formattedDate} - ${formattedTime}`;
}

// 2. getEventIcon
export function getEventIcon(eventType: string): string {
  switch (eventType.toLowerCase()) {
    case 'goal': return '⚽';
    case 'card': return '🟨'; // Usually logic decides red/yellow based on details, but this is default
    case 'substitution': return '🔄';
    case 'chance': return '⚡';
    case 'injury': return '🤕';
    case 'foul': return '🛑';
    default: return '⏱️';
  }
}

// 3. sortEventsByMinute
export function sortEventsByMinute(events: MatchEvent[]): MatchEvent[] {
  return [...events].sort((a, b) => {
    if (a.minute === b.minute) {
      return (a.second || 0) - (b.second || 0);
    }
    return a.minute - b.minute;
  });
}

// 4. filterEventsByTeam
export function filterEventsByTeam(events: MatchEvent[], team: 'homeTeam' | 'awayTeam' | string): MatchEvent[] {
  return events.filter(e => e.team === team);
}

// 5. getFormationArray
export function getFormationArray(formation: string): number[] {
  if (!formation) return [];
  // e.g. "4-3-3" -> [4, 3, 3]
  return formation.split('-').map(Number).filter(n => !isNaN(n));
}

// 6. calculatePlayerPositionOnPitch
export function calculatePlayerPositionOnPitch(
  position: string, 
  formationArray: number[], 
  index: number
): { x: number, y: number } {
  // Simple heuristic based on arrays (ignoring complex roles)
  // Assuming index 0 is GK, 1-4 are DEF, etc.
  if (index === 0 || position === 'GK') {
    return { x: 50, y: 10 }; // GK center-bottom
  }

  let offset = 1; // Start after GK
  let yPos = 30; // Starting Y for defense
  const yIncrement = 60 / Math.max(1, formationArray.length);

  for (let row = 0; row < formationArray.length; row++) {
    const rowCount = formationArray[row];
    if (index >= offset && index < offset + rowCount) {
      const posInRow = index - offset;
      // Distribute evenly across X axis
      const widthPerPlayer = 80 / Math.max(1, rowCount);
      const startX = 50 - ((rowCount - 1) * widthPerPlayer) / 2;
      const xPos = startX + (posInRow * widthPerPlayer);
      return { x: xPos, y: yPos };
    }
    offset += rowCount;
    yPos += yIncrement;
  }

  // Fallback
  return { x: 50, y: 50 };
}

// 7. getSubstitutionHistory
export function getSubstitutionHistory(lineup: Lineup): string[] {
  const history: string[] = [];
  
  if (!lineup || !lineup.substitutes) return history;

  lineup.substitutes.forEach(sub => {
    if (sub.isSubstituted && sub.minuteSubstitutedIn) {
      // Find who they replaced from starting XI or other subs
      const replaced = lineup.startingXI.find(p => p.minuteSubstitutedOut === sub.minuteSubstitutedIn) 
        || lineup.substitutes.find(p => p.minuteSubstitutedOut === sub.minuteSubstitutedIn);
      
      const outName = replaced ? replaced.name : 'Unknown';
      history.push(`${sub.minuteSubstitutedIn}' - ${outName} → ${sub.name}`);
    }
  });

  return history.sort((a, b) => {
    const minA = parseInt(a.split("'")[0], 10) || 0;
    const minB = parseInt(b.split("'")[0], 10) || 0;
    return minA - minB;
  });
}

// 8. isLiveMatch
export function isLiveMatch(status: string): boolean {
  return status.toLowerCase() === 'live';
}

// 9. getGoalScorersList
export interface GoalScorer {
  player: string;
  team: string;
  minute: number;
  assistPlayer?: string;
}

export function getGoalScorersList(events: MatchEvent[]): GoalScorer[] {
  return sortEventsByMinute(events)
    .filter(e => e.type === 'goal')
    .map(e => ({
      player: e.player?.name || 'Unknown',
      team: e.team, // 'homeTeam' or 'awayTeam'
      minute: e.minute,
      assistPlayer: e.assistPlayer?.name
    }));
}

// 10. getMatchWinner
export function getMatchWinner(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
}
