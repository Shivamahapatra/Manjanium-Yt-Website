"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Clock, MapPin, Compass, Keyboard, RefreshCw } from "lucide-react";
import { useGlobeCalendar, RaceVenue } from "@/hooks/useGlobeCalendar";
import { RaceDetailsModal } from "@/components/globe/RaceDetailsModal";
import { findVenueByCoords } from "@/lib/globe-interactions";
import { message } from "antd";

// Dynamically import Globe to avoid SSR hydration issues
const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] aspect-square rounded-2xl bg-neutral-900/40 animate-pulse flex flex-col items-center justify-center border border-neutral-800 gap-2">
        <RefreshCw className="w-6 h-6 text-neutral-600 animate-spin" />
        <span className="text-neutral-500 text-xs font-mono">Loading 3D Globe...</span>
      </div>
    ),
  }
);

interface GlobeCalendarProps {
  theme?: "dark" | "light";
  onHoverRoundChange?: (round: number | null) => void;
  hoveredRoundFromParent?: number | null;
}

export function GlobeCalendar({
  theme = "dark",
  onHoverRoundChange,
  hoveredRoundFromParent = null,
}: GlobeCalendarProps): React.JSX.Element {
  const {
    venues,
    arcData,
    loading,
    error,
    nextRace,
    filter,
    setFilter,
    filteredVenues,
  } = useGlobeCalendar();

  const [selectedRace, setSelectedRace] = useState<RaceVenue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState("");
  
  // Custom camera focus target coord state
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Keyboard round input buffer (e.g. typing "1" then "4" to focus Round 14 Madrid)
  const [inputBuffer, setInputBuffer] = useState<string>("");
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen reader announcer helper
  const announceToScreenReader = useCallback((msg: string) => {
    setSrAnnouncement(msg);
    setTimeout(() => {
      setSrAnnouncement((prev) => (prev === msg ? "" : prev));
    }, 1000);
  }, []);

  // Update initial focus coords to the next upcoming race on load
  useEffect(() => {
    if (nextRace && !loading) {
      setFocusTarget({ lat: nextRace.lat, lng: nextRace.lng });
    }
  }, [nextRace, loading]);

  // Sync hovered state from parent calendar list if provided
  const highlightedRound = useMemo<number | undefined>(() => {
    if (hoveredRoundFromParent !== null) return hoveredRoundFromParent;
    return nextRace?.round;
  }, [hoveredRoundFromParent, nextRace]);

  // Click handlers on Globe arcs/points
  const handleElementClick = useCallback((lat: number, lng: number) => {
    const venueDetail = findVenueByCoords(lat, lng);
    if (venueDetail) {
      // Find full RaceVenue object matching round
      const fullVenue = venues.find((v) => v.round === venueDetail.round);
      if (fullVenue) {
        setSelectedRace(fullVenue);
        setIsModalOpen(true);
        setFocusTarget({ lat: fullVenue.lat, lng: fullVenue.lng });
        announceToScreenReader(`Selected Round ${fullVenue.round}: ${fullVenue.name}`);
      }
    }
  }, [venues, announceToScreenReader]);

  const handlePointClick = useCallback((point: any) => {
    handleElementClick(point.lat, point.lng);
  }, [handleElementClick]);

  const handleArcClick = useCallback((arc: any) => {
    handleElementClick(arc.startLat, arc.startLng);
  }, [handleElementClick]);

  // Keyboard navigation buffering for rounds 1-22
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const newBuffer = inputBuffer + e.key;
      setInputBuffer(newBuffer);

      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }

      bufferTimeoutRef.current = setTimeout(() => {
        const roundNum = parseInt(newBuffer, 10);
        if (roundNum >= 1 && roundNum <= 22) {
          const match = venues.find((v) => v.round === roundNum);
          if (match) {
            setFocusTarget({ lat: match.lat, lng: match.lng });
            message.success(`Orbiting to Round ${roundNum}: ${match.name}`, 2);
            announceToScreenReader(`Orbiting camera to focus on Round ${roundNum}: ${match.name}`);
          } else {
            message.error(`Round ${roundNum} not found`, 1.5);
          }
        } else if (newBuffer.length > 0) {
          message.warning(`Invalid round number: ${newBuffer}. Enter 1-22.`, 2);
        }
        setInputBuffer("");
      }, 600); // 600ms input timeout
    } else if (e.key === "Enter") {
      // Open details modal for next race (if nothing selected) or last focused
      if (nextRace && !isModalOpen) {
        setSelectedRace(nextRace);
        setIsModalOpen(true);
        announceToScreenReader(`Opening details for ${nextRace.name}`);
      }
    }
  }, [inputBuffer, venues, nextRace, isModalOpen, announceToScreenReader]);

  // Filter arc data to show matching coordinates based on selected filter option
  const filteredArcData = useMemo(() => {
    const now = new Date();
    return arcData.filter((arc) => {
      const venue = venues.find((v) => v.id === arc.venueId);
      if (!venue) return false;
      const raceDate = new Date(`${venue.date}T${venue.time || "00:00:00Z"}`);
      const isPast = raceDate < now;

      if (filter === "upcoming") return !isPast;
      if (filter === "completed") return isPast;
      return true;
    });
  }, [arcData, venues, filter]);

  // Interactive Globe Config
  const globeConfig = useMemo(() => {
    return {
      ambientLight: theme === "light" ? "#f0f0f0" : "#ffffff",
      directionalLeftLight: theme === "light" ? "#0ea5e9" : "#3b82f6",
      directionalTopLight: "#ffffff",
      pointLight: "#ffffff",
      globeColor: theme === "light" ? "#e8f1f5" : "#0b1329",
      polygonColor: theme === "light" ? "rgba(14, 165, 233, 0.25)" : "rgba(14, 165, 233, 0.45)",
      showAtmosphere: true,
      atmosphereColor: theme === "light" ? "#87ceeb" : "#2563eb",
      atmosphereAltitude: theme === "light" ? 0.1 : 0.15,
      autoRotate: !focusTarget, // pause auto-rotate while focused on a GP
      autoRotateSpeed: 0.5,
      enableZoom: true,
      initialPosition: focusTarget || undefined,
    };
  }, [theme, focusTarget]);

  const containerThemeClasses = theme === "light"
    ? "bg-neutral-50 border-neutral-200 text-neutral-900"
    : "bg-[#0b0c10]/20 border-neutral-800/80 text-white";

  const bannerThemeClasses = theme === "light"
    ? "bg-white border-neutral-200 shadow-md text-neutral-800"
    : "bg-neutral-900/40 border-neutral-800/60 shadow-[0_0_20px_rgba(0,0,0,0.2)] text-neutral-200";

  return (
    <figure
      role="figure"
      aria-label="F1 2026 Interactive Season Globe"
      className={`relative w-full border rounded-2xl p-4 flex flex-col items-center justify-center ${containerThemeClasses}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Dynamic Action Controls Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 z-10">
        {/* Next GP Summary Pill */}
        {nextRace && (
          <div className={`flex items-center gap-3 px-4 py-2 border rounded-xl ${bannerThemeClasses}`}>
            <span className="text-2xl leading-none animate-bounce">{nextRace.flag}</span>
            <div>
              <span className="text-[9px] font-mono font-black uppercase text-blue-500 block leading-none mb-1">
                Next Grand Prix
              </span>
              <h4 className="text-xs font-bold leading-tight">
                {nextRace.name} — Rd {nextRace.round}
              </h4>
            </div>
          </div>
        )}

        {/* Filters bar */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/30 border border-neutral-800/50 rounded-xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            All GP Arcs
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === "upcoming"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              filter === "completed"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Main 3D canvas viewport container */}
      <div className="relative w-full aspect-square md:h-[500px] max-w-full overflow-hidden flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-neutral-500 animate-spin" />
            <span className="text-xs font-mono text-neutral-500">Syncing F1 telemetry...</span>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <p className="text-red-500 font-semibold mb-2">Error loading calendar coordinates</p>
            <p className="text-xs text-neutral-500">{error}</p>
          </div>
        ) : (
          <div className="w-full h-full relative focus-visible:outline-none">
            <Globe
              globeConfig={globeConfig}
              data={filteredArcData}
              highlightedRound={highlightedRound || undefined}
              onPointClick={handlePointClick}
              onArcClick={handleArcClick}
              onHoverRoundChange={onHoverRoundChange}
            />

            {/* Quick Keyboard shortcuts help badge overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-neutral-800/80 text-[8px] font-mono text-neutral-400 select-none">
              <Keyboard className="w-3.5 h-3.5 text-blue-500" />
              <span>Type [1-22] to focus GP • [Enter] Race Specs</span>
            </div>
          </div>
        )}
      </div>

      {/* Details modal overlay */}
      <RaceDetailsModal
        venue={selectedRace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
      />

      {/* Screen Reader live alerts */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Semantic Accessible description caption */}
      <figcaption className="sr-only">
        Interactive F1 2026 Season Globe connecting 22 Grand Prix venues via dynamic color-coded arcs.
        Use tab to focus. Keyboard controls: Type round numbers 1-22 to orbit camera, Enter to display race specs modal.
      </figcaption>
    </figure>
  );
}
export default GlobeCalendar;
