"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { CloudRain, Radio, Flag, Wind, Thermometer, Volume2, AlertCircle } from "lucide-react";
import { LiveTimingTower } from "@/components/f1/LiveTimingTower";
import { F1_VENUES_2026, getCountryFlag, getTimezoneForVenue } from "@/lib/f1-helpers";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { F1_PRESETS, F1PresetKey } from "@/lib/dashboard-presets";
import { F1TelemetryTab } from "@/components/f1/tabs/F1TelemetryTab";
import { F1StandingsTab } from "@/components/f1/tabs/F1StandingsTab";
import { TerminalChat } from "@/components/chat/TerminalChat";

// Dynamic import for the 3D Live focus Globe
const Globe = dynamic(
  () => import("@/components/ui/Globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] h-[320px] rounded-2xl bg-neutral-900 animate-pulse mx-auto border border-neutral-800" />
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

function WeatherWidget({ sessionKey }: { sessionKey: string }) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/f1/weather?session_key=${sessionKey}`);
        const json = await res.json();
        if (json.weather && json.weather.length > 0) {
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

  if (loading || !weatherData) return <div className="glass-panel p-4 rounded-xl flex items-center justify-center min-h-[100px]"><Spin size="small" /></div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 hover-lift">
        <span className="font-bold text-xs uppercase text-text-primary opacity-80">AIR TEMP</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{weatherData.air_temperature}</span>
          <span className="text-sm">°C</span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-2xl overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${Math.min(weatherData.air_temperature * 2, 100)}%` }} />
        </div>
      </div>
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 hover-lift">
        <span className="font-bold text-xs uppercase text-text-primary opacity-80">TRACK TEMP</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{weatherData.track_temperature}</span>
          <span className="text-sm">°C</span>
        </div>
        <div className="w-full bg-surface-container h-1.5 rounded-2xl overflow-hidden">
          <div className="bg-secondary h-full transition-all" style={{ width: `${Math.min(weatherData.track_temperature * 1.5, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function RaceControlFeed({ sessionKey }: { sessionKey: string }) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchControl = async () => {
      try {
        const res = await fetch(`/api/f1/racecontrol?session_key=${sessionKey}`);
        const json = await res.json();
        if (json.racecontrol) {
          const sorted = [...json.racecontrol].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setMessages(sorted.slice(0, 8));
        }
      } catch (err) {}
    };
    fetchControl();
    const interval = setInterval(fetchControl, 10000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  return (
    <div className="h-full glass-panel rounded-xl overflow-hidden flex flex-col p-4">
      <div className="flex items-center gap-2 border-b border-border-default pb-3 mb-3">
        <span className="material-symbols-outlined text-primary text-[18px]">flag</span>
        <h4 className="font-bold uppercase tracking-widest text-sm text-text-primary">Race Control</h4>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'none' }}>
        {messages.length === 0 ? (
          <div className="text-text-secondary text-sm opacity-50">No messages</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="text-sm border-b border-border-variant pb-2 last:border-0">
              <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono mb-1">
                <span>{new Date(msg.date).toLocaleTimeString("en-GB", { hour12: false })}</span>
                <span className="uppercase">{msg.category}</span>
              </div>
              <p className="font-medium text-xs text-text-primary leading-tight">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TeamRadioPanel({ sessionKey }: { sessionKey: string }) {
  const [radioMsgs, setRadioMsgs] = useState<any[]>([]);

  useEffect(() => {
    const fetchRadio = async () => {
      try {
        const res = await fetch(`/api/f1/radio?session_key=${sessionKey}`);
        const json = await res.json();
        if (json.radio) {
          const sorted = [...json.radio].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRadioMsgs(sorted.slice(0, 4));
        }
      } catch (err) {}
    };
    fetchRadio();
    const interval = setInterval(fetchRadio, 15000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  return (
    <>
      {radioMsgs.map((msg, idx) => (
        <div key={idx} className="glass-panel p-4 rounded-xl flex flex-col gap-2 hover-lift">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">volume_up</span>
            <span className="text-xs font-bold uppercase text-text-primary">CAR #{msg.driver_number}</span>
          </div>
          <audio src={msg.recording_url} controls className="w-full h-8 scale-90 origin-left" />
        </div>
      ))}
    </>
  );
}

import { useF1PresetLayout } from "@/hooks/usePresetLayout";

export function F1LiveTab({ presetLayout }: { presetLayout?: any }) {
  const { preferences } = useUserPreferences();
  const localPresetLayout = useF1PresetLayout();
  const layout = presetLayout || localPresetLayout;

  const [session, setSession] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState<string>("latest");
  const [loading, setLoading] = useState(true);
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    const fetchSessionInfo = async () => {
      try {
        const res = await fetch("/api/f1/live");
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          setSessionKey(String(data.session.session_key || "latest"));
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchSessionInfo();
    const interval = setInterval(fetchSessionInfo, 10000);
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

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Spin size="large" /></div>;

  return (
    <div className="w-full relative animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 w-full max-w-[1600px] mx-auto pb-10">
        
        {/* Live Timing Tower */}
        <section className={`md:col-span-12 ${layout.timingTowerCols} flex flex-col gap-4 ${layout.timingTowerClass}`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase text-primary flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary rounded-2xl animate-pulse shadow-[0_0_8px_var(--color-primary)]"></span>
              LIVE TIMING TOWER
            </h2>
          </div>
          <div className={`rounded-xl overflow-y-auto ${layout.timingTowerHeight || 'h-[600px]'}`} style={{ scrollbarWidth: 'thin' }}>
             <LiveTimingTower />
          </div>
        </section>

        {/* Center Section: Globe & Weather */}
        <section className={`md:col-span-12 ${layout.mainGridCols} flex flex-col gap-6`}>
          <div className={`relative h-[300px] md:h-[400px] glass-panel rounded-xl overflow-hidden flex items-center justify-center border-border-default ${layout.circuitFocusClass}`}>
             <Globe globeConfig={globeConfig} data={globeArcs} />
             <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h3 className="text-xs font-bold uppercase text-primary mb-1 tracking-widest">GLOBAL RACE TRACKER</h3>
                <p className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-text-primary drop-shadow-md">
                   {currentVenue ? currentVenue.raceName : "AWAITING RACE"}
                </p>
             </div>
             <div className="absolute bottom-6 right-6 text-right z-10 pointer-events-none">
                <span className="text-xs text-text-secondary uppercase font-bold tracking-widest block mb-1">LOCAL TIME</span>
                <span className="text-2xl text-primary font-mono font-bold drop-shadow-md">{localTime || "--:--:--"}</span>
             </div>
          </div>
          <div className={layout.weatherClass}>
            <WeatherWidget sessionKey={sessionKey} />
          </div>
        </section>

        {/* Circuit Focus / Race Control Card */}
        <section className="md:col-span-12 flex flex-col gap-6 h-full">
           <RaceControlFeed sessionKey={sessionKey} />
        </section>

        {/* Supplementary Feed (Team Radio) */}
        <section className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
           <TeamRadioPanel sessionKey={sessionKey} />
        </section>

        {/* Terminal Chat Widget */}
        <section className="md:col-span-12 mt-4">
           <TerminalChat context="f1" />
        </section>
      </div>

      <div className="mt-8 space-y-8">
        <div className={`glass-panel rounded-xl p-4 md:p-6 ${layout.telemetryChartsClass}`}>
          <h3 className="text-xl font-bold uppercase mb-4 text-primary tracking-wider">Live Telemetry</h3>
          <F1TelemetryTab />
        </div>
        <div className={`glass-panel rounded-xl p-4 md:p-6 ${layout.standingsClass}`}>
          <h3 className="text-xl font-bold uppercase mb-4 text-primary tracking-wider">Championship Standings</h3>
          <F1StandingsTab />
        </div>
      </div>
    </div>
  );
}
