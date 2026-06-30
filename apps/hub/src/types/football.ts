export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  photo: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  passCompletion?: number;
  shotsOnTarget?: number;
  tackles?: number;
  dribbles?: number;
}

export interface Team {
  id: string;
  name: string;
  flag: string;
  logo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualification: 'qualified' | 'eliminated' | 'contending';
  players: Player[];
}

export interface Group {
  groupName: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  teams: Team[];
}

export interface StandingsResponse {
  groups: Group[];
  lastUpdated: string; // ISO 8601
  cachedUntil: string; // ISO 8601
}

export interface APIError {
  message: string;
  code: number;
  timestamp: string;
}

export interface LiveFixtureData {
  id?: string;
  fixture?: {
    id?: string;
    status?: {
      short?: string;
      elapsed?: number;
    };
  };
  league?: {
    name?: string;
  };
  teams?: {
    home?: {
      name?: string;
      logo?: string;
    };
    away?: {
      name?: string;
      logo?: string;
    };
  };
  goals?: {
    home?: number;
    away?: number;
  };
}
