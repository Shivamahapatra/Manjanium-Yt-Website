import { F1_VENUES_2026 } from "@/lib/f1-helpers";

export interface VenueDetailInfo {
  round: number;
  name: string;
  circuit: string;
  locality?: string;
  country: string;
  lat: number;
  lng: number;
  date?: string;
  sprint?: boolean;
  isNew?: boolean;
  circuitType: "street" | "permanent";
  trackLength: string;
  turns: number;
  podiumHistory: string;
}

// Additional metadata for the 22 rounds of 2026
const CIRCUIT_EXTRA_METADATA: Record<number, {
  circuitType: "street" | "permanent";
  trackLength: string;
  turns: number;
  podiumHistory: string;
}> = {
  1: { circuitType: "street", trackLength: "5.278 km", turns: 14, podiumHistory: "1st: Sainz, 2nd: Leclerc, 3rd: Norris" }, // Australia
  2: { circuitType: "permanent", trackLength: "5.451 km", turns: 16, podiumHistory: "1st: Verstappen, 2nd: Norris, 3rd: Perez" }, // China
  3: { circuitType: "permanent", trackLength: "5.807 km", turns: 18, podiumHistory: "1st: Verstappen, 2nd: Perez, 3rd: Sainz" }, // Japan
  4: { circuitType: "street", trackLength: "5.412 km", turns: 19, podiumHistory: "1st: Norris, 2nd: Verstappen, 3rd: Leclerc" }, // Miami
  5: { circuitType: "street", trackLength: "3.337 km", turns: 19, podiumHistory: "1st: Leclerc, 2nd: Piastri, 3rd: Sainz" }, // Monaco
  6: { circuitType: "permanent", trackLength: "4.657 km", turns: 14, podiumHistory: "1st: Verstappen, 2nd: Norris, 3rd: Hamilton" }, // Barcelona
  7: { circuitType: "permanent", trackLength: "4.361 km", turns: 14, podiumHistory: "1st: Verstappen, 2nd: Norris, 3rd: Russell" }, // Canada
  8: { circuitType: "permanent", trackLength: "4.318 km", turns: 10, podiumHistory: "1st: Russell, 2nd: Piastri, 3rd: Sainz" }, // Austria
  9: { circuitType: "permanent", trackLength: "5.891 km", turns: 18, podiumHistory: "1st: Hamilton, 2nd: Verstappen, 3rd: Norris" }, // Silverstone
  10: { circuitType: "permanent", trackLength: "7.004 km", turns: 19, podiumHistory: "1st: Hamilton, 2nd: Piastri, 3rd: Leclerc" }, // Spa
  11: { circuitType: "permanent", trackLength: "4.381 km", turns: 14, podiumHistory: "1st: Piastri, 2nd: Norris, 3rd: Hamilton" }, // Hungary
  12: { circuitType: "permanent", trackLength: "4.259 km", turns: 14, podiumHistory: "1st: Norris, 2nd: Verstappen, 3rd: Leclerc" }, // Zandvoort
  13: { circuitType: "permanent", trackLength: "5.793 km", turns: 11, podiumHistory: "1st: Leclerc, 2nd: Piastri, 3rd: Norris" }, // Monza
  14: { circuitType: "street", trackLength: "5.470 km", turns: 20, podiumHistory: "New Circuit - Inaugural Race in 2026" }, // Madrid (New)
  15: { circuitType: "street", trackLength: "6.003 km", turns: 20, podiumHistory: "1st: Piastri, 2nd: Leclerc, 3rd: Russell" }, // Baku
  16: { circuitType: "street", trackLength: "4.940 km", turns: 19, podiumHistory: "1st: Norris, 2nd: Verstappen, 3rd: Piastri" }, // Singapore
  17: { circuitType: "permanent", trackLength: "5.513 km", turns: 20, podiumHistory: "1st: Leclerc, 2nd: Sainz, 3rd: Verstappen" }, // Austin
  18: { circuitType: "permanent", trackLength: "4.304 km", turns: 17, podiumHistory: "1st: Sainz, 2nd: Norris, 3rd: Leclerc" }, // Mexico
  19: { circuitType: "permanent", trackLength: "4.309 km", turns: 15, podiumHistory: "1st: Verstappen, 2nd: Ocon, 3rd: Gasly" }, // Brazil
  20: { circuitType: "street", trackLength: "6.201 km", turns: 17, podiumHistory: "1st: Russell, 2nd: Hamilton, 3rd: Sainz" }, // Las Vegas
  21: { circuitType: "permanent", trackLength: "5.419 km", turns: 16, podiumHistory: "1st: Verstappen, 2nd: Russell, 3rd: Hamilton" }, // Qatar
  22: { circuitType: "permanent", trackLength: "5.281 km", turns: 16, podiumHistory: "1st: Verstappen, 2nd: Leclerc, 3rd: Russell" }, // Abu Dhabi
};

// Maps lat/lng coordinates to our detailed F1 venue list using a proximity tolerance threshold
export function findVenueByCoords(lat: number, lng: number): VenueDetailInfo | null {
  const tolerance = 0.5; // Half a degree tolerance
  
  const baseVenue = F1_VENUES_2026.find(
    (v) => Math.abs(v.lat - lat) < tolerance && Math.abs(v.lng - lng) < tolerance
  );
  
  if (!baseVenue) return null;
  
  const extra = CIRCUIT_EXTRA_METADATA[baseVenue.round] || {
    circuitType: "permanent",
    trackLength: "TBC",
    turns: 0,
    podiumHistory: "TBC"
  };
  
  return {
    ...baseVenue,
    circuitType: extra.circuitType,
    trackLength: extra.trackLength,
    turns: extra.turns,
    podiumHistory: extra.podiumHistory
  } as VenueDetailInfo;
}
