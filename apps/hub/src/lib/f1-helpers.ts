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

export const F1_VENUES_2026 = [
  { round: 1,  name: "Australian GP",         circuit: "Albert Park",           country: "Australia",    lat: -37.8497, lng: 144.9680, sprint: false, timezone: "Australia/Melbourne"  },
  { round: 2,  name: "Chinese GP",             circuit: "Shanghai Int'l Circuit",country: "China",        lat: 31.3389,  lng: 121.2198, sprint: true,  timezone: "Asia/Shanghai"        },
  { round: 3,  name: "Japanese GP",            circuit: "Suzuka Circuit",        country: "Japan",        lat: 34.8431,  lng: 136.5407, sprint: false, timezone: "Asia/Tokyo"           },
  { round: 4,  name: "Miami GP",               circuit: "Miami Int'l Autodrome", country: "USA",          lat: 25.9581,  lng: -80.2389, sprint: true,  timezone: "America/New_York"     },
  { round: 5,  name: "Monaco GP",              circuit: "Circuit de Monaco",     country: "Monaco",       lat: 43.7347,  lng: 7.4205,   sprint: false, timezone: "Europe/Monaco"        },
  { round: 6,  name: "Barcelona-Catalunya GP", circuit: "Circuit de Catalunya",  country: "Spain",        lat: 41.5700,  lng: 2.2611,   sprint: false, timezone: "Europe/Madrid"        },
  { round: 7,  name: "Canadian GP",            circuit: "Circuit Gilles Villeneuve", country: "Canada",   lat: 45.5000,  lng: -73.5228, sprint: true,  timezone: "America/Toronto"      },
  { round: 8,  name: "Austrian GP",            circuit: "Red Bull Ring",         country: "Austria",      lat: 47.2197,  lng: 14.7647,  sprint: false, timezone: "Europe/Vienna"        },
  { round: 9,  name: "British GP",             circuit: "Silverstone Circuit",   country: "UK",           lat: 52.0786,  lng: -1.0169,  sprint: true,  timezone: "Europe/London"        },
  { round: 10, name: "Belgian GP",             circuit: "Spa-Francorchamps",     country: "Belgium",      lat: 50.4372,  lng: 5.9714,   sprint: false, timezone: "Europe/Brussels"      },
  { round: 11, name: "Hungarian GP",           circuit: "Hungaroring",           country: "Hungary",      lat: 47.5789,  lng: 19.2486,  sprint: false, timezone: "Europe/Budapest"      },
  { round: 12, name: "Dutch GP",               circuit: "Circuit Zandvoort",     country: "Netherlands",  lat: 52.3888,  lng: 4.5409,   sprint: true,  timezone: "Europe/Amsterdam"     },
  { round: 13, name: "Italian GP",             circuit: "Autodromo di Monza",    country: "Italy",        lat: 45.6156,  lng: 9.2811,   sprint: false, timezone: "Europe/Rome"          },
  { round: 14, name: "Spanish GP",             circuit: "Madring Street Circuit",country: "Spain",        lat: 40.4530,  lng: -3.6883,  sprint: false, timezone: "Europe/Madrid",
    isNew: true, newLabel: "NEW VENUE — Madrid Street Circuit" },
  { round: 15, name: "Azerbaijan GP",          circuit: "Baku City Circuit",     country: "Azerbaijan",   lat: 40.3725,  lng: 49.8533,  sprint: false, timezone: "Asia/Baku"            },
  { round: 16, name: "Singapore GP",           circuit: "Marina Bay Street Circuit", country: "Singapore",lat: 1.2914,   lng: 103.8639, sprint: true,  timezone: "Asia/Singapore"       },
  { round: 17, name: "United States GP",       circuit: "Circuit of the Americas",country: "USA",         lat: 30.1328,  lng: -97.6411, sprint: false, timezone: "America/Chicago"      },
  { round: 18, name: "Mexico City GP",         circuit: "Autodromo Hermanos Rodriguez", country: "Mexico",lat: 19.4042,  lng: -99.0907, sprint: false, timezone: "America/Mexico_City"  },
  { round: 19, name: "São Paulo GP",           circuit: "Autodromo Interlagos",  country: "Brazil",       lat: -23.7036, lng: -46.6997, sprint: false, timezone: "America/Sao_Paulo"    },
  { round: 20, name: "Las Vegas GP",           circuit: "Las Vegas Strip Circuit",country: "USA",         lat: 36.1147,  lng: -115.1728,sprint: false, timezone: "America/Los_Angeles"  },
  { round: 21, name: "Qatar GP",               circuit: "Lusail International Circuit", country: "Qatar", lat: 25.4900,  lng: 51.4542,  sprint: false, timezone: "Asia/Qatar"           },
  { round: 22, name: "Abu Dhabi GP",           circuit: "Yas Marina Circuit",    country: "UAE",          lat: 24.4672,  lng: 54.6031,  sprint: false, timezone: "Asia/Dubai"           },
];

export const F1_CANCELED_2026 = [
  { name: "Bahrain GP",      circuit: "Bahrain International Circuit", country: "Bahrain",      round: "Was Rd 4", reason: "Canceled — Middle East conflict" },
  { name: "Saudi Arabian GP",circuit: "Jeddah Corniche Circuit",       country: "Saudi Arabia", round: "Was Rd 5", reason: "Canceled — Middle East conflict" },
  { name: "Emilia Romagna GP",circuit: "Autodromo di Imola",           country: "Italy",        round: "Dropped",  reason: "Replaced by Madrid GP" },
];

export function getTimezoneForVenue(circuitName: string): string {
  const map: Record<string, string> = {
    "Albert Park": "Australia/Melbourne",
    "Shanghai Int'l Circuit": "Asia/Shanghai",
    "Suzuka Circuit": "Asia/Tokyo",
    "Miami Int'l Autodrome": "America/New_York",
    "Circuit de Monaco": "Europe/Monaco",
    "Circuit de Catalunya": "Europe/Madrid",
    "Circuit Gilles Villeneuve": "America/Toronto",
    "Red Bull Ring": "Europe/Vienna",
    "Silverstone Circuit": "Europe/London",
    "Spa-Francorchamps": "Europe/Brussels",
    "Hungaroring": "Europe/Budapest",
    "Circuit Zandvoort": "Europe/Amsterdam",
    "Autodromo di Monza": "Europe/Rome",
    "Madring Street Circuit": "Europe/Madrid",
    "Baku City Circuit": "Asia/Baku",
    "Marina Bay Street Circuit": "Asia/Singapore",
    "Circuit of the Americas": "America/Chicago",
    "Autodromo Hermanos Rodriguez": "America/Mexico_City",
    "Autodromo Interlagos": "America/Sao_Paulo",
    "Las Vegas Strip Circuit": "America/Los_Angeles",
    "Lusail International Circuit": "Asia/Qatar",
    "Yas Marina Circuit": "Asia/Dubai",
  };
  return map[circuitName] ?? "UTC";
}
