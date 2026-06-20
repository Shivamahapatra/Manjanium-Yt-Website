"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { CloudRain, Radio, Flag, Wind, Thermometer, Volume2, AlertCircle } from "lucide-react";
import { LiveTimingTower } from "@/components/f1/LiveTimingTower";
import { F1_VENUES_2026 } from "@/lib/f1-helpers";

// Dynamic import for the 3D Live focus Globe
const F1LiveGlobe = dynamic(
  () => import("@/components/f1/F1LiveGlobe"),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] h-[320px] rounded-full bg-neutral-900 animate-pulse mx-auto border border-neutral-800" />
    ),
  }
);

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
            <div className="bg-[#111111]/30 border border-[#1f1f1f] rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl">
              <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider block mb-4">
                Live Circuit Focus
              </span>
              <F1LiveGlobe sessionVenue={currentVenue} />
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
