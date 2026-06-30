import { Player as BasePlayer, Team as BaseTeam } from './football';

export interface MatchEvent {
  id: string;
  minute: number;
  second: number;
  type: 'goal' | 'substitution' | 'card' | 'chance' | 'injury' | 'foul';
  team: 'homeTeam' | 'awayTeam';
  player: { id: string; name: string; number: number };
  assistPlayer?: { id: string; name: string; number: number };
  cardType?: 'yellow' | 'red';
  description: string;
  statistic?: string;
}

export interface Player extends BasePlayer {
  status: 'on_field' | 'bench' | 'substituted';
  isSubstituted: boolean;
  minuteSubstitutedOut?: number;
  minuteSubstitutedIn?: number;
}

export interface Lineup {
  id: string;
  team: BaseTeam;
  formation: string;
  startingXI: Player[];
  substitutes: Player[];
  manager?: string;
}

export interface TeamStats {
  possession: number;
  shotsOnTarget: number;
  shots: number;
  passes: number;
  passCompletion: number;
  tackles: number;
  interceptions: number;
  fouls: number;
  corners: number;
  offsides: number;
  saves?: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchDetails {
  id: string;
  status: 'live' | 'finished' | 'upcoming';
  kickoffTime: string;
  endTime?: string;
  elapsedTime: number;
  currentPeriod: 1 | 2;
  homeTeam: BaseTeam & { score: number; formation: string; lineup: Player[]; substitutes: Player[] };
  awayTeam: BaseTeam & { score: number; formation: string; lineup: Player[]; substitutes: Player[] };
  venue: { name: string; city: string; country: string };
  events: MatchEvent[];
  stats: { homeTeam: TeamStats; awayTeam: TeamStats };
}

export interface MatchSummary {
  id: string;
  homeTeam: { id: string; name: string; logo?: string; score: number };
  awayTeam: { id: string; name: string; logo?: string; score: number };
  kickoffTime: string;
  venue: string;
  group: string;
  status: 'finished';
  goalScorers: { player: string; team: string; minute: number; assistPlayer?: string }[];
}
