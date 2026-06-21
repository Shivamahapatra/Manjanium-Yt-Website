"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { CloudRain, Radio, Flag, Wind, Thermometer, Volume2, AlertCircle } from "lucide-react";
import { LiveTimingTower } from "@/components/f1/LiveTimingTower";
import { F1_VENUES_2026, getCountryFlag, getTimezoneForVenue } from "@/lib/f1-helpers";

// Dynamic import for the 3D Live focus Globe
const Globe = dynamic(
  () => import("@/components/ui/globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] h-[320px] rounded-full bg-neutral-900 animate-pulse mx-auto border border-neutral-800" />
    ),
  }
);

// F1 Racing venues coordinate arcs for Globe visualization
const globeArcs = [
  { startLat: 52.0786, startLng: -1.0169, endLat: 45.6156, endLng: 9.2811, arcAlt: 0.2, color: "#3b82f6" },
  { startLat: 45.6156, startLng: 9.2811, endLat: 43.7347, endLng: 7.4205, arcAlt: 0.15, color: "#ef4444" },
  { startLat: 43.7347, startLng: 7.4205, endLat: 50.4372, endLng: 5.9714, arcAlt: 0.2, color: "#10b981" },
  { startLat: 50.4372, startLng: 5.9714, endLat: 24.4672, endLng: 54.6031, arcAlt: 0.3, color: "#f59e0b" },
  { startLat: 24.4672, startLng: 54.6031, endLat: -37.8497, endLng: 144.9680, arcAlt: 0.4, color: "#8b5cf6" },
  { startLat: -37.8497, startLng: 144.9680, endLat: 30.1328, endLng: -97.6411, arcAlt: 0.5, color: "#ec4899" },
  { startLat: 30.1328, startLng: -97.6411, endLat: -23.7036, endLng: -46.6997, arcAlt: 0.35, color: "#06b6d4" },
  { startLat: -23.7036, startLng: -46.6997, endLat: 34.8431, endLng: 136.5407, arcAlt: 0.5, color: "#14b8a6" }
];

const globeConfig = {
  ambientLight: "#ffffff",
  directionalLeftLight: "#3b82f6",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  globeColor: "#0b1329",
  polygonColor: "rgba(14, 165, 233, 0.45)",
  showAtmosphere: true,
  atmosphereColor: "#2563eb",
  atmosphereAltitude: 0.15,
  autoRotate: true,
  autoRotateSpeed: 0.6,
};

// --- Subcomponents for live panels ---

function WeatherWidget({ sessionKey }: { sessionKey: string }) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/f1/weather?session_key=${sessionKey}`);
        const json = await res.json();
        if (json.weather && json.weather.length > 0) {
          // Latest weather record
          setWeatherData(json.weather[json.weather.length - 1]);
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  if (loading) return <div className="text-neutral-500 font-mono text-xs p-4 bg-neutral-900 border border-neutral-800 rounded-xl">Loading Weather...</div>;
  if (!weatherData) return <div className="text-neutral-500 font-mono text-xs p-4 bg-neutral-900 border border-neutral-800 rounded-xl">No Weather Data</div>;

  const isRaining = weatherData.rainfall === 1 || weatherData.rainfall === "1";

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 shadow-xl">
      <h4 className="text-white font-bold text-xs mb-3 flex items-center gap-2 border-b border-[#1f1f1f] pb-2 uppercase tracking-wider">
        <CloudRain className="w-4 h-4 text-blue-400" />
        Track Weather Conditions
      </h4>
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-neutral-850">
          <Thermometer className="w-4 h-4 text-red-400" />
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">Air Temp</div>
            <div className="text-white font-bold">{weatherData.air_temperature}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-neutral-850">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">Track Temp</div>
            <div className="text-white font-bold">{weatherData.track_temperature}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-neutral-850">
          <Wind className="w-4 h-4 text-zinc-400" />
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">Wind Speed</div>
            <div className="text-white font-bold">{weatherData.wind_speed} m/s</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-neutral-850">
          <CloudRain className="w-4 h-4 text-blue-500" />
          <div>
            <div className="text-neutral-500 text-[8px] uppercase">Rainfall</div>
            <div className={`font-bold ${isRaining ? "text-blue-400 animate-pulse" : "text-green-500"}`}>
              {isRaining ? "WET" : "DRY"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RaceControlFeed({ sessionKey }: { sessionKey: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchControl = async () => {
      try {
        const res = await fetch(`/api/f1/racecontrol?session_key=${sessionKey}`);
        const json = await res.json();
        if (json.racecontrol && Array.isArray(json.racecontrol)) {
          const sorted = [...json.racecontrol].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setMessages(sorted.slice(0, 10)); // keep last 10 entries
        }
      } catch (err) {
        console.error("Failed to fetch race control messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchControl();
    const interval = setInterval(fetchControl, 10000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  if (loading) return <div className="text-neutral-500 font-mono text-xs p-4 bg-neutral-900 border border-neutral-800 rounded-xl">Loading Feed...</div>;
  if (messages.length === 0) return <div className="text-neutral-500 font-mono text-xs p-4 bg-neutral-900 border border-neutral-800 rounded-xl">No Messages</div>;

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 shadow-xl flex flex-col h-[320px]">
      <h4 className="text-white font-bold text-xs mb-3 flex items-center gap-2 border-b border-[#1f1f1f] pb-2 uppercase tracking-wider shrink-0">
        <Flag className="w-4 h-4 text-red-500 animate-pulse" />
        Race Control Messages
      </h4>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
        {messages.map((msg, idx) => {
          const date = new Date(msg.date);
          const timeStr = date.toLocaleTimeString("en-GB", { hour12: false });
          
          let badgeClass = "text-neutral-400";
          if (msg.message.toUpperCase().includes("YELLOW")) badgeClass = "text-yellow-500 font-bold";
          else if (msg.message.toUpperCase().includes("RED")) badgeClass = "text-red-500 font-bold";
          else if (msg.message.toUpperCase().includes("SAFETY CAR")) badgeClass = "text-orange-500 font-bold";
          else if (msg.message.toUpperCase().includes("VSC")) badgeClass = "text-orange-400 font-bold";
          else if (msg.message.toUpperCase().includes("GREEN")) badgeClass = "text-green-500 font-bold";

          return (
            <div key={idx} className="text-xs border-b border-[#1f1f1f]/50 pb-2">
              <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono mb-0.5">
                <span>{timeStr}</span>
                <span className="uppercase tracking-wider text-neutral-600">{msg.category}</span>
              </div>
              <p className={`font-sans leading-relaxed text-[11px] ${badgeClass}`}>{msg.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamRadioPanel({ sessionKey }: { sessionKey: string }) {
  const [radioMsgs, setRadioMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRadio = async () => {
      try {
        const res = await fetch(`/api/f1/radio?session_key=${sessionKey}`);
        const json = await res.json();
        if (json.radio && Array.isArray(json.radio)) {
          const sorted = [...json.radio].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setRadioMsgs(sorted.slice(0, 5)); // latest 5 records
        }
      } catch (err) {
        console.error("Failed to fetch team radio messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRadio();
    const interval = setInterval(fetchRadio, 15000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  if (loading) return <div className="text-neutral-500 font-mono text-xs p-4 bg-[#111111] border border-[#1f1f1f] rounded-xl">Loading Team Radio...</div>;
  if (radioMsgs.length === 0) return <div className="text-neutral-500 font-mono text-xs p-4 bg-[#111111] border border-[#1f1f1f] rounded-xl">No Radio Transmissions</div>;

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 shadow-xl">
      <h4 className="text-white font-bold text-xs mb-3 flex items-center gap-2 border-b border-[#1f1f1f] pb-2 uppercase tracking-wider">
        <Volume2 className="w-4 h-4 text-green-400" />
        Live Team Radio Transmissions
      </h4>
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {radioMsgs.map((msg, idx) => {
          const timeStr = new Date(msg.date).toLocaleTimeString("en-GB", { hour12: false });
          return (
            <div key={idx} className="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded border border-[#1f1f1f]/50 text-xs">
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span className="font-bold text-neutral-400">DRIVER CAR #{msg.driver_number}</span>
                <span>{timeStr}</span>
              </div>
              <audio src={msg.recording_url} controls className="w-full h-6 max-h-6 scale-90 origin-left" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Page Component ---

export function F1LiveTab() {
  const [session, setSession] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState<string>("latest");
  const [loading, setLoading] = useState(true);
  const [localTime, setLocalTime] = useState<string>("");

  // Poll for active session key and details
  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        const res = await fetch("/api/f1/live");
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          setSessionKey(String(data.session.session_key || "latest"));
        }
      } catch (err) {
        console.error("Failed to fetch session metadata", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionInfo();
    const interval = setInterval(fetchSessionInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  // Match the OpenF1 country name to the F1_VENUES_2026 array (Correction case-insensitive)
  const currentVenue = useMemo(() => {
    if (!session?.country_name) return null;

    const countryStr = session.country_name.toLowerCase();

    // Map common spelling variations
    const countryAliases: Record<string, string> = {
      "great britain": "uk",
      "united kingdom": "uk",
      "united states": "usa",
      "united states gp": "usa",
      "united arab emirates": "uae",
    };

    const targetCountry = countryAliases[countryStr] || countryStr;

    const venue = F1_VENUES_2026.find(
      (v) => v.country.toLowerCase() === targetCountry
    );

    if (!venue) return null;

    return {
      circuitName: venue.circuit,
      raceName: venue.name,
      country: venue.country,
      lat: venue.lat,
      lng: venue.lng,
      sessionType: (session.session_type || "Practice") as any,
      sessionName: session.session_name || "FP1",
    };
  }, [session]);

  // Update circuit local time clock every second
  useEffect(() => {
    if (!currentVenue) return;
    const tz = getTimezoneForVenue(currentVenue.circuitName);

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
  }, [currentVenue]);

  // Determine theme colors based on session type
  let isRaceOrSprint = false;
  let isQuali = false;
  let statusText = "";
  let statusBadgeClass = "";

  if (currentVenue) {
    isRaceOrSprint = currentVenue.sessionType === "Race" || currentVenue.sessionType === "Sprint";
    isQuali = currentVenue.sessionType === "Qualifying";

    if (isRaceOrSprint) {
      statusText = "● RACE LIVE";
      statusBadgeClass = "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse";
    } else if (isQuali) {
      statusText = "● QUALIFYING";
      statusBadgeClass = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    } else {
      statusText = `● ${currentVenue.sessionName}`;
      statusBadgeClass = "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        
        {/* Dual column responsive sidebar layout (65% / 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Timing Tower + Radio (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <LiveTimingTower />
            <TeamRadioPanel sessionKey={sessionKey} />
          </div>

          {/* RIGHT COLUMN: Live Globe Focus + Weather + Race Control */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Globe container */}
            <div className="bg-[#111111]/30 border border-[#1f1f1f] rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl w-full">
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider block mb-4">
                Live Circuit Focus
              </span>
              <div className="relative w-full aspect-square md:h-[320px] overflow-hidden rounded-full border border-neutral-800/30 bg-[#070714] flex items-center justify-center mb-4">
                <Globe globeConfig={globeConfig} data={globeArcs} />
              </div>

              {/* Info Card Below Globe */}
              <div className="w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center shadow-xl">
                {currentVenue ? (
                  <>
                    <div className="text-5xl mb-2">{getCountryFlag(currentVenue.country)}</div>
                    <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                      {currentVenue.country}
                    </div>
                    <h4 className="text-white font-bold text-base leading-tight mb-3">
                      {currentVenue.circuitName}
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

            {/* Weather condition status details */}
            <WeatherWidget sessionKey={sessionKey} />

            {/* Race Control feed widget */}
            <RaceControlFeed sessionKey={sessionKey} />
          </div>

        </div>

      </div>
    </div>
  );
}
