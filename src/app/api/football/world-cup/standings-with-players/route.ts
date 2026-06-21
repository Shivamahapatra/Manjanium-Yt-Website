import { NextResponse } from 'next/server';

const STANDINGS_URL = 'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings';
const ROSTER_URL_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams';

// Helper to extract a stat value from ESPN's player statistics payload
const extractStat = (categories: any[], categoryName: string, statName: string): number => {
  if (!categories) return 0;
  const category = categories.find((c: any) => c.name === categoryName);
  if (!category || !category.stats) return 0;
  const stat = category.stats.find((s: any) => s.name === statName);
  return stat ? parseInt(stat.value, 10) || 0 : 0;
};

// Map ESPN position to standard POS
const mapPosition = (espnPos: string) => {
  const posMap: Record<string, string> = {
    'Goalkeeper': 'GK',
    'Defender': 'DEF',
    'Midfielder': 'MID',
    'Forward': 'FWD',
    'Attacker': 'FWD'
  };
  return posMap[espnPos] || espnPos || 'Unknown';
};

// Simple in-memory cache for rosters to optimize API load
const rostersCache: Record<string, any[]> = {};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const useCache = searchParams.get('cache') !== 'false';
    const fetchOptions: RequestInit = useCache 
      ? { next: { revalidate: 3600 } } 
      : { cache: 'no-store' };

    // Fetch standings
    const standingsRes = await fetch(STANDINGS_URL, fetchOptions);
    if (!standingsRes.ok) {
      throw new Error(`Failed to fetch standings: ${standingsRes.status}`);
    }
    const standingsData = await standingsRes.json();

    const groupsData = standingsData.children || [];
    
    // We will collect all team IDs to fetch their rosters
    const teamsToFetch: { id: string, groupId: string }[] = [];
    
    groupsData.forEach((group: any) => {
      const entries = group.standings?.entries || [];
      entries.forEach((entry: any) => {
        if (entry.team?.id && !rostersCache[entry.team.id]) {
          teamsToFetch.push({ id: entry.team.id, groupId: group.id });
        }
      });
    });

    if (teamsToFetch.length > 0) {
      // Batch fetch rosters (limit concurrency in a real large app, but 32 teams is fine for Promise.all here)
      const rosterPromises = teamsToFetch.map(team => 
        fetch(`${ROSTER_URL_BASE}/${team.id}/roster`, fetchOptions)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const rostersData = await Promise.all(rosterPromises);
      
      // Map rosters by team ID
      rostersData.forEach((rosterResp, index) => {
        const teamId = teamsToFetch[index].id;
        if (rosterResp && rosterResp.athletes) {
          rostersCache[teamId] = rosterResp.athletes.map((athlete: any) => {
            const statsCats = athlete.statistics?.splits?.categories || [];
            
            return {
              id: athlete.id,
              name: athlete.displayName || athlete.fullName,
              number: athlete.jersey || 0,
              position: mapPosition(athlete.position?.name),
              photo: athlete.headshot?.href || '',
              gamesPlayed: extractStat(statsCats, 'general', 'appearances'),
              goals: extractStat(statsCats, 'offensive', 'totalGoals'),
              assists: extractStat(statsCats, 'offensive', 'goalAssists'),
              yellowCards: extractStat(statsCats, 'general', 'yellowCards'),
              redCards: extractStat(statsCats, 'general', 'redCards'),
              minutesPlayed: extractStat(statsCats, 'general', 'minutesPlayed') || 0, // Sometimes missing
              passCompletion: extractStat(statsCats, 'passing', 'passCompletionPercentage') || 0,
              shotsOnTarget: extractStat(statsCats, 'offensive', 'shotsOnTarget'),
              tackles: extractStat(statsCats, 'defensive', 'totalTackles') || 0,
              dribbles: extractStat(statsCats, 'offensive', 'dribbles') || 0
            };
          });
        } else {
          rostersCache[teamId] = [];
        }
      });
    }

    // Map rosters by team ID for the final response
    const rostersMap: Record<string, any[]> = {};
    groupsData.forEach((group: any) => {
      const entries = group.standings?.entries || [];
      entries.forEach((entry: any) => {
        if (entry.team?.id) {
          rostersMap[entry.team.id] = rostersCache[entry.team.id] || [];
        }
      });
    });

    // Build final response
    const formattedGroups = groupsData.map((group: any) => {
      const entries = group.standings?.entries || [];
      
      const teams = entries.map((entry: any, index: number) => {
        const teamStats = entry.stats || [];
        const getTeamStat = (statName: string) => teamStats.find((s: any) => s.name === statName)?.value || 0;
        
        const played = getTeamStat('gamesPlayed');
        const rank = index + 1; // Assuming array order is rank order
        
        let qualification = 'contending';
        if (played >= 3) {
          qualification = rank <= 2 ? 'qualified' : 'eliminated';
        }

        return {
          id: entry.team.id,
          name: entry.team.displayName,
          flag: ``, // ESPN doesn't always provide emoji flags, might need manual map if strictly required
          logo: entry.team.logos?.[0]?.href || '',
          played: played,
          wins: getTeamStat('wins'),
          draws: getTeamStat('ties'),
          losses: getTeamStat('losses'),
          goalsFor: getTeamStat('pointsFor'),
          goalsAgainst: getTeamStat('pointsAgainst'),
          goalDifference: getTeamStat('pointDifferential'),
          points: getTeamStat('points'),
          qualification,
          players: rostersMap[entry.team.id] || []
        };
      });

      return {
        groupName: group.abbreviation || group.name,
        teams: teams
      };
    });

    return NextResponse.json({
      groups: formattedGroups,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching World Cup data:', error);
    return NextResponse.json(
      { groups: [], error: 'Failed to fetch World Cup standings and player data' },
      { status: 500 }
    );
  }
}
