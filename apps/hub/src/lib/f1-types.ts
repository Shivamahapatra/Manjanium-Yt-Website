// Interfaces for OpenF1 data
export interface F1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  country_code: string;
  session_key: number;
}

export interface F1Position {
  driver_number: number;
  position: number;
  date: string;
}

export interface F1Interval {
  driver_number: number;
  gap_to_leader: number | string;
  interval: number | string;
  date: string;
}

export interface F1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  country_name: string;
  country_code: string;
  circuit_short_name: string;
  date_start: string;
  date_end: string;
  year: number;
}

export interface F1Weather {
  air_temperature: number;
  track_temperature: number;
  wind_speed: number;
  wind_direction: number;
  rainfall: number;
  humidity: number;
  pressure: number;
  date: string;
}

export interface F1RaceControl {
  date: string;
  category: string;
  flag: string;
  message: string;
  scope: string;
  driver_number?: number;
  lap_number?: number;
}

export interface F1TeamRadio {
  date: string;
  driver_number: number;
  recording_url: string;
}

export interface F1CarData {
  date: string;
  driver_number: number;
  speed: number;
  throttle: number;
  brake: number;
  n_gear: number;
  rpm: number;
  drs: number;
}

// Jolpica/Ergast interfaces
export interface ErgastDriver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

export interface ErgastConstructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: ErgastDriver;
  Constructors: ErgastConstructor[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: ErgastConstructor;
}

export interface RaceResult {
  position: string;
  number: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
  Time?: { time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { speed: string };
  };
}

export interface QualifyingResult {
  position: string;
  number: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
      lat: string;
      long: string;
    };
  };
  Results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
  SprintResults?: RaceResult[];
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

// News/Updates
export interface F1NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  tags: string[];
}

// Country code to flag emoji mapping
export const COUNTRY_FLAGS: Record<string, string> = {
  'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺', 'Japan': '🇯🇵',
  'China': '🇨🇳', 'USA': '🇺🇸', 'United States': '🇺🇸', 'Miami': '🇺🇸',
  'Italy': '🇮🇹', 'Monaco': '🇲🇨', 'Canada': '🇨🇦', 'Spain': '🇪🇸',
  'Austria': '🇦🇹', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧', 'Great Britain': '🇬🇧',
  'Hungary': '🇭🇺', 'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Singapore': '🇸🇬',
  'Azerbaijan': '🇦🇿', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Qatar': '🇶🇦',
  'UAE': '🇦🇪', 'Abu Dhabi': '🇦🇪', 'Las Vegas': '🇺🇸', 'Portugal': '🇵🇹',
  'France': '🇫🇷', 'Turkey': '🇹🇷', 'Germany': '🇩🇪', 'Russia': '🇷🇺',
  'South Africa': '🇿🇦', 'Thailand': '🇹🇭', 'South Korea': '🇰🇷',
};

// Constructor name to color fallback (when OpenF1 data unavailable)
export const TEAM_COLORS: Record<string, string> = {
  'Red Bull': '#3671C6', 'Ferrari': '#E8002D', 'Mercedes': '#27F4D2',
  'McLaren': '#FF8000', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
  'Williams': '#64C4FF', 'RB': '#6692FF', 'AlphaTauri': '#6692FF',
  'Kick Sauber': '#52E252', 'Sauber': '#52E252', 'Alfa Romeo': '#C92D4B',
  'Haas F1 Team': '#B6BABD', 'Haas': '#B6BABD',
  'Cadillac': '#FFD700', 'Racing Bulls': '#6692FF',
};

// Session type labels
export const SESSION_TYPES: Record<string, string> = {
  'Practice 1': 'FP1', 'Practice 2': 'FP2', 'Practice 3': 'FP3',
  'Qualifying': 'QUALI', 'Race': 'RACE', 'Sprint': 'SPRINT',
  'Sprint Qualifying': 'SQ', 'Sprint Shootout': 'SS',
};
