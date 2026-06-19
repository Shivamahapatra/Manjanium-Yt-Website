import { COUNTRY_FLAGS, TEAM_COLORS } from './f1-types';

export function formatGap(gap: number | string | null | undefined): string {
  if (gap === null || gap === undefined) return '-';
  if (typeof gap === 'string') return gap;
  if (gap === 0) return 'LEADER';
  return `+${gap.toFixed(3)}`;
}

export function formatLapTime(time: string | null | undefined): string {
  if (!time) return '-';
  return time;
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] || '🏁';
}

export function getTeamColor(teamName: string, fallback?: string): string {
  if (fallback) return `#${fallback}`;
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#3b82f6';
}

export function formatCountdown(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return 'LIVE NOW';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function classifyNewsTags(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase();
  const tags: string[] = [];
  if (/upgrade|floor|wing|sidepod|diffuser|rear wing|front wing|bargeboard/i.test(text)) tags.push('Upgrade');
  if (/regulat|fia|rule|ban|clarif/i.test(text)) tags.push('Regulation');
  if (/engine|power unit|pu|hybrid|mgu|turbo|ice/i.test(text)) tags.push('Engine');
  if (/aero|downforce|drag|floor|beam wing/i.test(text)) tags.push('Aero');
  if (/strateg|tyre|tire|undercut|overcut|pit stop|safety car/i.test(text)) tags.push('Strategy');
  if (/protest|appeal|penalty|steward|investigation/i.test(text)) tags.push('Protest');
  return tags.length > 0 ? tags : ['General'];
}

// Team name keyword matching for news filtering
export function matchesTeamFilter(text: string, teams: string[]): boolean {
  if (teams.length === 0 || teams.includes('All')) return true;
  const lowerText = text.toLowerCase();
  return teams.some(team => {
    const keywords = {
      'Red Bull': ['red bull', 'verstappen', 'perez', 'newey', 'horner', 'rb'],
      'Aston Martin': ['aston martin', 'alonso', 'stroll', 'krack'],
      'McLaren': ['mclaren', 'norris', 'piastri', 'stella', 'zak brown'],
      'Ferrari': ['ferrari', 'leclerc', 'sainz', 'hamilton', 'vasseur'],
      'Mercedes': ['mercedes', 'russell', 'antonelli', 'wolff', 'brackley'],
    }[team] || [team.toLowerCase()];
    return keywords.some(kw => lowerText.includes(kw));
  });
}
