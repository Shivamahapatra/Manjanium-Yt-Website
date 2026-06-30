"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { getTimezoneForVenue, F1_VENUES_2026 } from "@/lib/f1-helpers";
import { F1Card } from "@/components/f1/F1Card";
import { F1PresetLiveFocused } from "@/components/f1/presets/F1PresetLiveFocused";
import { F1PresetStatsDetailed } from "@/components/f1/presets/F1PresetStatsDetailed";
import { F1PresetCompactOverview } from "@/components/f1/presets/F1PresetCompactOverview";
import { usePresetWithHydration } from "@/hooks/usePresetWithHydration";
import { HUDSkeleton } from "@/components/ui/LoadingSkeleton";
import { useDashboardPreset } from "@/hooks/useDashboardPreset";

// Dynamic import for the 3D Live focus Globe
const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => (
      <div className="w-80 h-80 rounded-2xl bg-neutral-900 animate-pulse mx-auto border border-neutral-800" />
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

export function WeatherWidget({ weatherData, loading }: { weatherData: any; loading: boolean }) {
  if (loading || !weatherData) return <div className="glass-panel p-4 rounded-xl flex items-center justify-center min-h-25"><Spin size="small" /></div>;

  return (
    <F1Card title="Weather">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1F2937] p-4 rounded-xl flex flex-col gap-2 transition-all hover:border-[#FBBF24]">
          <span className="font-bold text-xs uppercase text-[#6B7280]">AIR TEMP</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{weatherData?.air_temperature ?? '--'}</span>
            <span className="text-sm text-[#6B7280]">°C</span>
          </div>
          <div className="w-full bg-[#333333] h-1.5 rounded-2xl overflow-hidden">
            <div className="bg-[#FBBF24] h-full transition-all" style={{ width: `${Math.min((weatherData?.air_temperature || 0) * 2, 100)}%` }} />
          </div>
        </div>
        <div className="bg-[#1F2937] p-4 rounded-xl flex flex-col gap-2 transition-all hover:border-[#FBBF24]">
          <span className="font-bold text-xs uppercase text-[#6B7280]">TRACK TEMP</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{weatherData?.track_temperature ?? '--'}</span>
            <span className="text-sm text-[#6B7280]">°C</span>
          </div>
          <div className="w-full bg-[#333333] h-1.5 rounded-2xl overflow-hidden">
            <div className="bg-[#0EA5E9] h-full transition-all" style={{ width: `${Math.min((weatherData?.track_temperature || 0) * 1.5, 100)}%` }} />
          </div>
        </div>
      </div>
    </F1Card>
  );
}

export function RaceControlFeed({ messages }: { messages: any[] }) {
  return (
    <F1Card title="Race Control" className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'none' }}>
        {messages?.length === 0 ? (
          <div className="text-text-secondary text-sm opacity-50">No messages</div>
        ) : (
          messages?.map((msg, idx) => (
            <div key={idx} className="text-sm border-b border-border-variant pb-2 last:border-0">
              <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono mb-1">
                <span>{msg?.date ? new Date(msg.date).toLocaleTimeString("en-GB", { hour12: false }) : ''}</span>
                <span className="uppercase">{msg?.category}</span>
              </div>
              <p className="font-medium text-xs text-text-primary leading-tight">{msg?.message}</p>
            </div>
          ))
        )}
      </div>
    </F1Card>
  );
}

export function TeamRadioPanel({ radioMsgs }: { radioMsgs: any[] }) {
  return (
    <>
      {radioMsgs?.map((msg, idx) => (
        <F1Card key={idx} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FBBF24]">volume_up</span>
            <span className="text-xs font-bold uppercase text-white">CAR #{msg?.driver_number}</span>
          </div>
          <audio src={msg?.recording_url} controls className="w-full h-8 scale-90 origin-left" />
        </F1Card>
      ))}
    </>
  );
}

export function F1LiveTab() {
  const { preset, loading: presetLoading } = useDashboardPreset();
  const [session, setSession] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState<string>("latest");
  const [loading, setLoading] = useState(true);
  const [localTime, setLocalTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState<any>(null);
  const [raceControlMsgs, setRaceControlMsgs] = useState<any[]>([]);
  const [radioMsgs, setRadioMsgs] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/f1/live");
        if (res.status === 429) {
          setError('API rate limited. Retrying in 30s...');
          setTimeout(fetchAllData, 30000);
          return;
        }
        if (res.status >= 500) {
          setError('Server error. Please try again later.');
          return;
        }
        const data = await res.json();
        
        const currentSessionKey = data?.session?.session_key || "latest";
        
        if (data?.session) {
          setSession(data.session);
          setSessionKey(String(currentSessionKey));
        }
        
        if (data?.drivers) {
          setDrivers(data.drivers);
        }

        // Fetch dependent data concurrently
        const [weatherRes, controlRes, radioRes] = await Promise.allSettled([
          fetch(`/api/f1/weather?session_key=${currentSessionKey}`).then(r => r.json()),
          fetch(`/api/f1/racecontrol?session_key=${currentSessionKey}`).then(r => r.json()),
          fetch(`/api/f1/radio?session_key=${currentSessionKey}`).then(r => r.json())
        ]);

        if (weatherRes.status === 'fulfilled' && weatherRes.value?.weather?.length > 0) {
          setWeatherData(weatherRes.value.weather[weatherRes.value.weather.length - 1]);
        }
        if (controlRes.status === 'fulfilled' && controlRes.value?.racecontrol) {
          const sorted = [...controlRes.value.racecontrol].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRaceControlMsgs(sorted.slice(0, 8));
        }
        if (radioRes.status === 'fulfilled' && radioRes.value?.radio) {
          const sorted = [...radioRes.value.radio].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRadioMsgs(sorted.slice(0, 4));
        }

      } catch (err) {
        console.error("F1 fetch error:", err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentVenue = useMemo(() => {
    if (!session?.country_name) return null;
    const countryStr = session.country_name.toLowerCase();
    const countryAliases: Record<string, string> = { "great britain": "uk", "united kingdom": "uk", "united states": "usa", "united states gp": "usa" };
    const targetCountry = countryAliases[countryStr] || countryStr;
    const venue = F1_VENUES_2026.find((v) => v.country.toLowerCase() === targetCountry);
    if (!venue) return null;
    return {
      circuitName: venue.circuit,
      raceName: venue.name,
      country: venue.country,
      sessionType: session.session_type || "Practice",
      sessionName: session.session_name || "FP1",
    };
  }, [session]);

  useEffect(() => {
    if (!currentVenue) return;
    const tz = getTimezoneForVenue(currentVenue.circuitName);
    const updateTime = () => {
      try {
        setLocalTime(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
      } catch {
        setLocalTime("--:--:--");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentVenue]);

  // Hydration guard: show skeleton until localStorage has been read on the client.
  // This prevents the SSR default ('live-focused') from flashing before the real
  // persisted value is applied.
  const { isMounted: presetHydrated } = usePresetWithHydration();

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-[#FBBF24] text-center space-y-4">
        <div>
          <div className="text-lg font-bold">⚠️ F1 Data Unavailable</div>
          <p className="text-sm text-[#6B7280] mt-2">
            OpenF1 API is temporarily unavailable.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#FBBF24] text-black rounded font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading || presetLoading || !presetHydrated)
    return (
      <div className="max-w-[1800px] px-4 lg:pl-8 pb-10 space-y-6">
        <HUDSkeleton />
      </div>
    );

  const presetProps = {
    sessionKey,
    session,
    localTime,
    currentVenue,
    globeArcs,
    globeConfig,
    weatherData,
    raceControlMsgs,
    radioMsgs,
    drivers
  };

  return (
    <div className="w-full relative animate-fade-in-up">
      <div className="max-w-[1800px] px-4 lg:pl-8 lg:pr-100 pb-10 space-y-6">
        
        {/* Preset Selector Removed */}

        {/* Preset Content */}
        <div className="w-full">
          {preset === 'live-focused' && <F1PresetLiveFocused {...presetProps} />}
          {preset === 'stats-detailed' && <F1PresetStatsDetailed {...presetProps} />}
          {preset === 'compact-overview' && <F1PresetCompactOverview {...presetProps} />}
        </div>

        {/*
          TerminalChat removed from here – it is now mounted once at app root
          level (src/app/layout.tsx) to prevent orphan subscriptions.
        */}
      </div>
    </div>
  );
}
