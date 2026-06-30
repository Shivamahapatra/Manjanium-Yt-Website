import { useState, useEffect, useMemo, useCallback } from "react";
import { F1_VENUES_2026, getCountryFlag } from "@/lib/f1-helpers";
import { findVenueByCoords } from "@/lib/globe-interactions";

export interface CircuitInfo {
  name: string;
  length: number; // in km
  turns: number;
  type: "street" | "permanent";
}

export interface RaceVenue {
  id: string; // round-X
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  round: number;
  date: string;
  time: string;
  circuit: CircuitInfo;
  arcColor: string;
  isSprint: boolean;
  winner?: string;
  podiumHistory?: string;
}

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  venueId: string;
  round: number;
  arcAlt: number;
}

export function useGlobeCalendar() {
  const [calendarRaces, setCalendarRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  // Fetch the 2026 F1 calendar from our API (which handles Ergast routing)
  useEffect(() => {
    let active = true;
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/f1/calendar");
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        if (active) {
          setCalendarRaces(data.calendar || []);
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to load F1 calendar for globe integration:", err);
        if (active) {
          setError(err.message || "Failed to load calendar");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCalendar();
    return () => {
      active = false;
    };
  }, []);

  // Map circuit coordinates and enrich with API data
  const venues = useMemo<RaceVenue[]>(() => {
    const ARC_COLORS = [
      "#3b82f6", // Blue
      "#ef4444", // Red
      "#10b981", // Green
      "#f59e0b", // Amber
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#ec4899", // Pink
      "#14b8a6", // Teal
    ];

    return F1_VENUES_2026.map((venue, i) => {
      // Find matching race in API calendar
      const apiRace = calendarRaces.find((r) => Number(r.round) === venue.round);
      const circuitDetails = findVenueByCoords(venue.lat, venue.lng);

      const parsedLength = circuitDetails?.trackLength
        ? parseFloat(circuitDetails.trackLength)
        : 0;

      return {
        id: `round-${venue.round}`,
        name: apiRace?.raceName || venue.name,
        country: venue.country,
        flag: getCountryFlag(venue.country),
        lat: venue.lat,
        lng: venue.lng,
        round: venue.round,
        date: apiRace?.date || "2026-01-01",
        time: apiRace?.time || "12:00:00Z",
        circuit: {
          name: venue.circuit,
          length: parsedLength,
          turns: circuitDetails?.turns || 0,
          type: circuitDetails?.circuitType || "permanent",
        },
        arcColor: ARC_COLORS[(venue.round - 1) % ARC_COLORS.length],
        isSprint: !!(venue.sprint || apiRace?.isSprint),
        winner: apiRace?.winner || undefined,
        podiumHistory: circuitDetails?.podiumHistory || undefined,
      };
    });
  }, [calendarRaces]);

  // Map venues to sequential arc data (Melbourne -> China -> ... -> Abu Dhabi -> Melbourne)
  const arcData = useMemo<ArcData[]>(() => {
    if (venues.length === 0) return [];
    return venues.map((v, i) => {
      const nextVenue = venues[(i + 1) % venues.length];
      return {
        startLat: v.lat,
        startLng: v.lng,
        endLat: nextVenue.lat,
        endLng: nextVenue.lng,
        color: v.arcColor,
        venueId: v.id,
        round: v.round,
        arcAlt: 0.15 + (i % 3) * 0.08, // Dynamic altitude layout
      };
    });
  }, [venues]);

  // Find the next upcoming/current GP based on dates
  const nextRace = useMemo<RaceVenue | null>(() => {
    if (venues.length === 0) return null;
    const now = new Date();
    const upcoming = venues.find((v) => {
      const raceDate = new Date(`${v.date}T${v.time || "00:00:00Z"}`);
      return raceDate > now;
    });
    return upcoming || venues[venues.length - 1] || null; // Fallback to last race if season ended
  }, [venues]);

  // Filter venues based on user choices (All, Upcoming, Completed)
  const filteredVenues = useMemo<RaceVenue[]>(() => {
    const now = new Date();
    return venues.filter((v) => {
      const raceDate = new Date(`${v.date}T${v.time || "00:00:00Z"}`);
      const isPast = raceDate < now;
      
      if (filter === "upcoming") return !isPast;
      if (filter === "completed") return isPast;
      return true;
    });
  }, [venues, filter]);

  return {
    venues,
    arcData,
    loading,
    error,
    nextRace,
    filter,
    setFilter,
    filteredVenues,
  };
}
