import { Team, Player, Group } from '../types/football';

export type ExtendedPlayer = Player & { teamName: string; teamFlag: string };

/**
 * Sorts teams by points descending, then by goal difference descending.
 */
export function sortTeamsByPoints(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.goalDifference - a.goalDifference;
  });
}

/**
 * Filters players by position (e.g. 'GK', 'DEF') or returns all if 'all'.
 */
export function filterPlayersByPosition(players: Player[], position: string): Player[] {
  if (position.toLowerCase() === 'all') {
    return players;
  }
  return players.filter(p => p.position.toLowerCase() === position.toLowerCase());
}

/**
 * Extracts all players across all groups and returns the top N goal scorers.
 */
export function getTopScorers(allGroups: Group[], limit: number = 10): ExtendedPlayer[] {
  const allPlayers: ExtendedPlayer[] = [];
  
  allGroups.forEach(group => {
    group.teams.forEach(team => {
      // Safely check if players array exists
      (team.players || []).forEach(player => {
        allPlayers.push({
          ...player,
          teamName: team.name,
          teamFlag: team.flag
        });
      });
    });
  });

  return allPlayers
    .sort((a, b) => {
      // Secondary sort: least games played if goals are tied
      if (a.goals !== b.goals) return b.goals - a.goals;
      return a.gamesPlayed - b.gamesPlayed;
    })
    .slice(0, limit);
}

/**
 * Extracts all players across all groups and returns the top N assist providers.
 */
export function getTopAssists(allGroups: Group[], limit: number = 10): ExtendedPlayer[] {
  const allPlayers: ExtendedPlayer[] = [];
  
  allGroups.forEach(group => {
    group.teams.forEach(team => {
      (team.players || []).forEach(player => {
        allPlayers.push({
          ...player,
          teamName: team.name,
          teamFlag: team.flag
        });
      });
    });
  });

  return allPlayers
    .sort((a, b) => {
      // Secondary sort: least games played if assists are tied
      if (a.assists !== b.assists) return b.assists - a.assists;
      return a.gamesPlayed - b.gamesPlayed;
    })
    .slice(0, limit);
}

/**
 * Derives the qualification status based on the team's numerical rank in the group.
 */
export function getQualificationStatus(teamRank: number): 'qualified' | 'contending' | 'eliminated' {
  if (teamRank <= 2) return 'qualified';
  if (teamRank === 3) return 'contending';
  return 'eliminated';
}

/**
 * Maps qualification status to a light Tailwind background color.
 */
export function getGroupColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'qualified':
      return 'bg-green-100';
    case 'contending':
      return 'bg-yellow-100';
    case 'eliminated':
      return 'bg-red-50';
    default:
      return 'bg-transparent';
  }
}

/**
 * Formats an ISO 8601 timestamp string into a human-readable relative time (e.g., '2 hours ago').
 */
export function formatTimeElapsed(isoTimestamp: string): string {
  if (!isoTimestamp) return 'just now';
  
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  if (diffInMins > 0) {
    return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
  }
  
  return 'just now';
}

/**
 * Checks if the cached data has expired (24h lifespan implicitly tied to cachedUntil timestamp).
 */
export function isDataStale(cachedUntil: string): boolean {
  if (!cachedUntil) return true;
  
  const cacheDate = new Date(cachedUntil);
  const now = new Date();
  
  // If the current time is past the 'cachedUntil' timestamp, data is stale.
  return now.getTime() > cacheDate.getTime();
}

/**
 * Calculates the goals per game ratio, rounded to 2 decimal places.
 */
export function calculateGoalsPerGame(goals: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0;
  return Number((goals / gamesPlayed).toFixed(2));
}

/**
 * Simple descending sort for an array of isolated Player objects.
 */
export function sortPlayersByGoals(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.goals - a.goals);
}
