"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useSpring } from "react-spring";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, MapPin, Calendar as CalendarIcon, Zap } from "lucide-react";
import { F1_VENUES_2026, getCountryFlag } from "@/lib/f1-helpers";

interface F1CalendarGlobeProps {
  activeRound?: number | null;
  completedRounds: number[];
  nextRound: number;
}

// Spherical coordinates projection function matching Cobe internal math
function getScreenCoords(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  width: number,
  height: number
) {
  const radLat = (lat * Math.PI) / 180;
  const radLng = (lng * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(radLat);
  const sinLat = Math.sin(radLat);
  const cosLng = Math.cos(radLng);
  const sinLng = Math.sin(radLng);

  const vx = -cosLat * cosLng * 0.85; // 0.8 + elevation 0.05
  const vy = sinLat * 0.85;
  const vz = cosLat * sinLng * 0.85;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const c = cosPhi * vx + sinPhi * vz;
  const s = sinPhi * sinTheta * vx + cosTheta * vy - cosPhi * sinTheta * vz;

  // Orthographic backface culling check
  const zPlane = -sinPhi * cosTheta * vx + sinTheta * vy + cosPhi * cosTheta * vz;
  const isVisible = zPlane >= 0 || c * c + s * s >= 0.64;

  const aspect = width / height;
  const screenX = (c / aspect + 1) / 2;
  const screenY = (-s + 1) / 2;

  return {
    x: screenX * 100,
    y: screenY * 100,
    visible: isVisible,
  };
}

export default function F1CalendarGlobe({
  activeRound,
  completedRounds,
  nextRound,
}: F1CalendarGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulsingContainerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hoveredRoundState, setHoveredRoundState] = useState<number | null>(null);
  const [size, setSize] = useState(500);
  const [isHovered, setIsHovered] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  // References for render loop
  const currentPhiRef = useRef(0);
  const currentThetaRef = useRef(0.3);

  // Spring animation values for focusing camera coordinates
  const [{ phi, theta }, springApi] = useSpring(() => ({
    phi: 0,
    theta: 0.3,
    config: { tension: 40, friction: 20 },
  }));

  // Handle responsive size and WebGL capability checks
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSize(320);
      } else {
        setSize(600);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Verify WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync focused round coordinate changes
  const targetRound = activeRound !== undefined && activeRound !== null ? activeRound : hoveredRoundState;
  useEffect(() => {
    if (targetRound) {
      const activeVenue = F1_VENUES_2026.find((v) => v.round === targetRound);
      if (activeVenue) {
        const targetPhi = -(activeVenue.lng * Math.PI) / 180;
        const targetTheta = (activeVenue.lat * Math.PI) / 180;
        springApi.start({ phi: targetPhi, theta: targetTheta });
      }
    }
  }, [targetRound, springApi]);

  // Cobe Globe Initialization
  useEffect(() => {
    if (!hasWebGL || !canvasRef.current) return;

    let phiVal = 0;
    const nextRaceVenue = F1_VENUES_2026.find((v) => v.round === nextRound);

    // Build markers array (color & size mapped by round status)
    const markers: any[] = [];
    F1_VENUES_2026.forEach((venue) => {
      const isCompleted = completedRounds.includes(venue.round);
      const isNext = venue.round === nextRound;
      const isActive = venue.round === targetRound;
      const isNew = venue.isNew;

      let color: [number, number, number] = [0.23, 0.51, 0.97]; // Future GP: Blue-500
      let size = 0.05;

      if (isActive) {
        color = [1, 1, 1]; // Active GP: White
        size = 0.09;
      } else if (isNext) {
        color = [0.94, 0.27, 0.27]; // Next GP: Red-500
        size = 0.08;
      } else if (isNew) {
        color = [0.96, 0.62, 0.04]; // New Venue: Amber
        size = 0.06;
      } else if (isCompleted) {
        color = [0.2, 0.2, 0.2]; // Past GP: Dark Grey
        size = 0.04;
      }

      markers.push({ location: [venue.lat, venue.lng], size, color });

      // Add sprint dot indicator if sprint weekend
      if (venue.sprint) {
        markers.push({
          location: [venue.lat + 0.8, venue.lng + 0.8], // slightly offset
          size: 0.02,
          color: [1, 1, 1], // secondary white dot
        });
      }
    });

    // Build arcs array for the next 3 rounds only (current -> +1 -> +2)
    const arcs: any[] = [];
    const nextIndex = F1_VENUES_2026.findIndex((v) => v.round === nextRound);
    if (nextIndex !== -1) {
      const gradientColors: [number, number, number][] = [
        [0.23, 0.51, 0.97], // Blue
        [0.6, 0.4, 0.8],    // Purple
        [0.94, 0.27, 0.27],  // Red
      ];
      for (let i = 0; i < 3; i++) {
        const fromVenue = F1_VENUES_2026[nextIndex + i];
        const toVenue = F1_VENUES_2026[nextIndex + i + 1];
        if (fromVenue && toVenue) {
          arcs.push({
            from: [fromVenue.lat, fromVenue.lng],
            to: [toVenue.lat, toVenue.lng],
            color: gradientColors[i],
          });
        }
      }
    }

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.2],
      markerColor: [0.1, 0.8, 1.0],
      glowColor: [0.2, 0.4, 1.0],
      markers,
      arcs,
      arcWidth: 1.5,
      arcHeight: 0.2,
      onRender: (state: any) => {
        state.width = size * 2;
        state.height = size * 2;

        // Handle rotation state and snap animations
        if (isHovered || targetRound) {
          state.phi = phi.get();
          state.theta = theta.get();
        } else {
          phiVal += 0.003;
          state.phi = phiVal;
          state.theta = 0.3;
          // Keep spring values in sync
          springApi.start({ phi: phiVal, theta: 0.3, immediate: true });
        }

        currentPhiRef.current = state.phi;
        currentThetaRef.current = state.theta;

        // Project pulsing next race coordinates
        if (nextRaceVenue && pulsingContainerRef.current) {
          const coords = getScreenCoords(
            nextRaceVenue.lat,
            nextRaceVenue.lng,
            state.phi,
            state.theta,
            size,
            size
          );
          if (coords.visible) {
            pulsingContainerRef.current.style.display = "block";
            pulsingContainerRef.current.style.left = `${coords.x}%`;
            pulsingContainerRef.current.style.top = `${coords.y}%`;
          } else {
            pulsingContainerRef.current.style.display = "none";
          }
        }
      },
    } as any);

    return () => globe.destroy();
  }, [hasWebGL, size, completedRounds, nextRound, targetRound, isHovered, phi, theta, springApi]);

  // Pointer event logic to detect hovers over WebGL markers
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let closestVenue: any = null;
    let minDistance = Infinity;

    F1_VENUES_2026.forEach((venue) => {
      const coords = getScreenCoords(
        venue.lat,
        venue.lng,
        currentPhiRef.current,
        currentThetaRef.current,
        rect.width,
        rect.height
      );
      if (coords.visible) {
        const dx = coords.x - x;
        const dy = coords.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestVenue = venue;
        }
      }
    });

    if (minDistance < 5) {
      setHoveredRoundState(closestVenue.round);
    } else {
      setHoveredRoundState(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerInteracting.current = null;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const isClick = Math.sqrt(dx * dx + dy * dy) < 5;

    if (isClick && targetRound) {
      const target = document.getElementById(`round-${targetRound}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setHoveredRoundState(null);
  };

  // Mobile Fallback details card if WebGL fails
  if (!hasWebGL) {
    const activeVenue = F1_VENUES_2026.find((v) => v.round === targetRound) || F1_VENUES_2026.find((v) => v.round === nextRound)!;
    const flag = getCountryFlag(activeVenue.country);
    return (
      <div className="bg-neutral-900 rounded-2xl p-6 text-center max-w-md mx-auto my-8 border border-neutral-800">
        <div className="text-6xl mb-3">{flag}</div>
        <div className="text-white font-bold text-xl">{activeVenue.circuit}</div>
        <div className="text-neutral-400 text-sm mt-1">Round {activeVenue.round} of 22</div>
        <div className="text-blue-400 text-sm mt-1">{activeVenue.name}</div>
      </div>
    );
  }

  // Find info data to render in card
  const cardRound = targetRound || nextRound;
  const venueInfo = F1_VENUES_2026.find((v) => v.round === cardRound);
  const isPast = completedRounds.includes(cardRound);
  const isNext = cardRound === nextRound;

  return (
    <div className="w-full flex flex-col items-center justify-center relative select-none">
      {/* Globe rendering canvas container */}
      <div
        className="relative overflow-hidden mx-auto flex items-center justify-center"
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handlePointerLeave}
      >
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          style={{ width: size, height: size, cursor: "grab", outline: "none" }}
          className="active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        />

        {/* CSS coordinate pulsing overlay (Correction 1) */}
        <div
          ref={pulsingContainerRef}
          className="absolute w-0 h-0 pointer-events-none z-10"
          style={{ display: "none" }}
        >
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500 w-4 h-4"
              animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: idx * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Floating details overlay card */}
        {venueInfo && (
          <AnimatePresence mode="wait">
            <motion.div
              key={venueInfo.round}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 right-4 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-4 w-64 shadow-2xl z-20"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-neutral-400 font-bold">
                  RD {venueInfo.round}
                </span>
                <div className="flex flex-col gap-1 items-end">
                  {venueInfo.sprint && (
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase">
                      Sprint Weekend
                    </span>
                  )}
                  {venueInfo.isNew && (
                    <span className="bg-blue-500/20 text-blue-400 text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase">
                      New Venue
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-white font-bold text-base leading-tight mb-1">
                {venueInfo.name}
              </h4>
              <p className="text-neutral-400 text-xs mb-3">{venueInfo.circuit}</p>

              <div className="flex items-center gap-2 text-xs text-neutral-300 mb-4">
                <span>{getCountryFlag(venueInfo.country)}</span>
                <span className="font-medium">{venueInfo.country}</span>
              </div>

              <div className="border-t border-neutral-800 pt-2 flex justify-between items-center">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                  Status
                </span>
                {isPast ? (
                  <span className="text-xs text-neutral-400 font-bold uppercase">
                    Completed
                  </span>
                ) : isNext ? (
                  <span className="text-xs text-red-500 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    Next Race
                  </span>
                ) : (
                  <span className="text-xs text-blue-400 font-bold uppercase">
                    Upcoming
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
