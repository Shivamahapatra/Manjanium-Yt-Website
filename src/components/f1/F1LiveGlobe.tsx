"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useSpring } from "react-spring";
import { motion } from "framer-motion";
import { F1_VENUES_2026, getCountryFlag, getTimezoneForVenue } from "@/lib/f1-helpers";

interface F1LiveGlobeProps {
  sessionVenue: {
    circuitName: string;
    raceName: string;
    country: string;
    lat: number;
    lng: number;
    sessionType: "Race" | "Sprint" | "Qualifying" | "Practice";
    sessionName: string;
  } | null;
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

export default function F1LiveGlobe({ sessionVenue }: F1LiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulsingContainerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef<number>(0);

  const [localTime, setLocalTime] = useState<string>("");
  const [size, setSize] = useState(320);
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

  // Handle WebGL availability checks
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Sync focused round coordinate changes
  useEffect(() => {
    if (sessionVenue) {
      const targetPhi = -(sessionVenue.lng * Math.PI) / 180;
      const targetTheta = (sessionVenue.lat * Math.PI) / 180;
      springApi.start({ phi: targetPhi, theta: targetTheta });
    }
  }, [sessionVenue, springApi]);

  // Update circuit local time clock every second
  useEffect(() => {
    if (!sessionVenue) return;
    const tz = getTimezoneForVenue(sessionVenue.circuitName);

    const updateTime = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-GB", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date());
        setLocalTime(formatted);
      } catch {
        setLocalTime("--:--:--");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [sessionVenue]);

  // Cobe Globe Initialization
  useEffect(() => {
    if (!hasWebGL || !canvasRef.current) return;

    let phiVal = 0;
    let phiOffset = 0;

    // Build markers array
    const markers: any[] = [];
    if (sessionVenue) {
      // Show focused marker
      let color: [number, number, number] = [0.23, 0.51, 0.97]; // Practice: Blue
      if (sessionVenue.sessionType === "Race" || sessionVenue.sessionType === "Sprint") {
        color = [0.94, 0.27, 0.27]; // Race/Sprint: Red
      } else if (sessionVenue.sessionType === "Qualifying") {
        color = [0.96, 0.62, 0.04]; // Qualifying: Amber
      }
      markers.push({
        location: [sessionVenue.lat, sessionVenue.lng],
        size: 0.12, // large focused marker
        color,
      });
    } else {
      // Show all 22 race markers in dim blue
      F1_VENUES_2026.forEach((venue) => {
        markers.push({
          location: [venue.lat, venue.lng],
          size: 0.04,
          color: [0.1, 0.2, 0.4], // dim blue
        });
      });
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
      onRender: (state: any) => {
        state.width = size * 2;
        state.height = size * 2;

        if (sessionVenue) {
          // Snaps then slowly auto-rotates
          state.phi = phi.get() + phiOffset;
          state.theta = theta.get();
          phiOffset += 0.002;
        } else {
          phiVal += 0.005;
          state.phi = phiVal + phi.get();
          state.theta = 0.3;
        }

        currentPhiRef.current = state.phi;
        currentThetaRef.current = state.theta;

        // Project pulsing active race coordinates
        if (sessionVenue && pulsingContainerRef.current) {
          const coords = getScreenCoords(
            sessionVenue.lat,
            sessionVenue.lng,
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
  }, [hasWebGL, size, sessionVenue, phi, theta, springApi]);

  // Mobile Fallback Card
  if (!hasWebGL) {
    if (sessionVenue) {
      const flag = getCountryFlag(sessionVenue.country);
      return (
        <div className="bg-neutral-900 rounded-2xl p-6 text-center border border-neutral-800 w-[320px] mx-auto">
          <div className="text-6xl mb-3">{flag}</div>
          <div className="text-white font-bold text-xl">{sessionVenue.circuitName}</div>
          <div className="text-neutral-400 text-sm mt-1">Active Session</div>
          <div className="text-blue-400 text-sm mt-1">
            {sessionVenue.raceName} — {sessionVenue.sessionName}
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-neutral-900 rounded-2xl p-6 text-center border border-neutral-800 w-[320px] mx-auto">
          <div className="text-6xl mb-3">🏁</div>
          <div className="text-white font-bold text-xl">No Active Session</div>
          <div className="text-neutral-400 text-sm mt-1">22 Rounds, 20 Countries</div>
        </div>
      );
    }
  }

  // Determine theme colors based on session type
  let isRaceOrSprint = false;
  let isQuali = false;
  let ringColorClass = "border-blue-500";
  let statusText = "";
  let statusBadgeClass = "";

  if (sessionVenue) {
    isRaceOrSprint = sessionVenue.sessionType === "Race" || sessionVenue.sessionType === "Sprint";
    isQuali = sessionVenue.sessionType === "Qualifying";

    if (isRaceOrSprint) {
      ringColorClass = "border-red-500";
      statusText = "● RACE LIVE";
      statusBadgeClass = "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse";
    } else if (isQuali) {
      ringColorClass = "border-amber-500";
      statusText = "● QUALIFYING";
      statusBadgeClass = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    } else {
      ringColorClass = "border-blue-500";
      statusText = `● ${sessionVenue.sessionName}`;
      statusBadgeClass = "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }
  }

  return (
    <div className="flex flex-col items-center select-none w-[320px] mx-auto">
      {/* Globe Area */}
      <div
        className="relative overflow-hidden rounded-full border border-neutral-800/30 bg-[#070714] flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          style={{ width: size, height: size, cursor: "grab", outline: "none" }}
        />

        {/* Pulsing overlay rings (Correction 1) */}
        {sessionVenue && (
          <div
            ref={pulsingContainerRef}
            className="absolute w-0 h-0 pointer-events-none z-10"
            style={{ display: "none" }}
          >
            {[0, 1, 2].map((idx) => (
              <motion.div
                key={idx}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${ringColorClass} w-4 h-4`}
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
        )}
      </div>

      {/* Info Card Below Globe */}
      <div className="w-full mt-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center shadow-xl">
        {sessionVenue ? (
          <>
            <div className="text-5xl mb-2">{getCountryFlag(sessionVenue.country)}</div>
            <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
              {sessionVenue.country}
            </div>
            <h4 className="text-white font-bold text-base leading-tight mb-3">
              {sessionVenue.circuitName}
            </h4>

            <div className="flex flex-col items-center gap-3">
              <span className={`px-2.5 py-0.5 text-[10px] font-black tracking-widest rounded uppercase ${statusBadgeClass}`}>
                {statusText}
              </span>
              <div className="border-t border-neutral-800 pt-2 w-full mt-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">
                  Circuit Local Time
                </span>
                <span className="text-xl font-mono font-bold text-white tracking-widest">
                  {localTime}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-2">
            <div className="text-4xl mb-2">🏁</div>
            <h4 className="text-white font-bold text-base mb-1">No Active Session</h4>
            <p className="text-neutral-400 text-xs font-mono">
              22 Rounds, 20 Countries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
