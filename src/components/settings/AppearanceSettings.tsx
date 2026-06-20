"use client";

import React from "react";
import { useSettings, Theme, FontSize, ColorIntensity, AnimationSpeed } from "@/lib/settings-context";
import { Monitor, Moon, Sun, Type, Zap, PaintBucket, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPresets } from "./DashboardPresets";

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettings();
  const { appearance } = settings;

  const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "LIGHT MODE", icon: <Sun className="w-5 h-5" /> },
    { id: "dark", label: "DARK MODE", icon: <Moon className="w-5 h-5" /> },
    { id: "auto", label: "AUTO (SYSTEM)", icon: <Monitor className="w-5 h-5" /> },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: "small", label: "Small" },
    { id: "normal", label: "Normal" },
    { id: "large", label: "Large" },
  ];

  const animationSpeeds: { id: AnimationSpeed; label: string }[] = [
    { id: "slow", label: "Slow" },
    { id: "normal", label: "Normal" },
    { id: "fast", label: "Fast" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Theme Preferences</h2>
        <p className="text-[#94a3b8] mb-6">Customize the visual appearance of Manjanium Sports Hub.</p>

        {/* Theme Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const isActive = appearance.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => updateSettings("appearance", { theme: theme.id })}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 gap-3",
                  isActive
                    ? "border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]"
                    : "border-white/10 bg-[#0f172a] text-[#94a3b8] hover:border-white/30 hover:text-white"
                )}
              >
                {theme.icon}
                <span className="font-semibold text-sm tracking-wide">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/10" />

      {/* Other Visual Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Font Size */}
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/5 rounded-lg text-[#fbbf24]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Font Size</h3>
              <p className="text-sm text-[#94a3b8]">Adjust global text size</p>
            </div>
          </div>
          <div className="flex bg-background rounded-xl p-1">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => updateSettings("appearance", { fontSize: size.id })}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                  appearance.fontSize === size.id
                    ? "bg-[#fbbf24] text-black shadow-md"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Speed */}
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/5 rounded-lg text-[#fbbf24]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Animation Speed</h3>
              <p className="text-sm text-[#94a3b8]">Configure UI transitions</p>
            </div>
          </div>
          <div className="flex bg-background rounded-xl p-1">
            {animationSpeeds.map((speed) => (
              <button
                key={speed.id}
                onClick={() => updateSettings("appearance", { animationSpeed: speed.id })}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                  appearance.animationSpeed === speed.id
                    ? "bg-[#fbbf24] text-black shadow-md"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                {speed.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="h-[1px] w-full bg-white/10" />

      {/* Live Preview */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
        <div className={cn(
          "w-full rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300",
          appearance.theme === "light" 
            ? "bg-[#f8fafc] border-[#e2e8f0]" 
            : "bg-[#0f172a] border-white/10"
        )}>
          {/* Mock Header */}
          <div className={cn(
            "h-14 border-b flex items-center px-6 transition-colors",
            appearance.theme === "light" ? "border-[#e2e8f0] bg-white" : "border-white/10 bg-[#0f172a]"
          )}>
            <div className="w-8 h-8 rounded bg-[#fbbf24] flex items-center justify-center font-black text-black">M</div>
            <div className="flex gap-4 ml-8 hidden sm:flex">
               <div className={cn("h-4 w-16 rounded", appearance.theme === "light" ? "bg-slate-200" : "bg-white/10")} />
               <div className={cn("h-4 w-20 rounded", appearance.theme === "light" ? "bg-slate-200" : "bg-white/10")} />
            </div>
          </div>
          {/* Mock Content */}
          <div className="p-6 md:p-10 flex flex-col gap-6">
            <div className={cn(
              "text-3xl font-bold transition-colors",
              appearance.theme === "light" ? "text-slate-900" : "text-white"
            )}>
              Welcome to Manjanium
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cn(
                "p-6 rounded-xl border transition-colors",
                appearance.theme === "light" ? "bg-white border-slate-200 shadow-sm" : "bg-background border-white/5"
              )}>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <div className={cn("font-bold mb-2 transition-colors", appearance.theme === "light" ? "text-slate-900" : "text-white")}>Live Telemetry</div>
                <div className={cn("text-sm transition-colors", appearance.theme === "light" ? "text-slate-500" : "text-slate-400")}>
                  Experience real-time data directly from the paddock.
                </div>
              </div>

              <div className={cn(
                "p-6 rounded-xl border transition-colors",
                appearance.theme === "light" ? "bg-white border-slate-200 shadow-sm" : "bg-background border-white/5"
              )}>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className={cn("font-bold mb-2 transition-colors", appearance.theme === "light" ? "text-slate-900" : "text-white")}>Match Center</div>
                <div className={cn("text-sm transition-colors", appearance.theme === "light" ? "text-slate-500" : "text-slate-400")}>
                  Track live football stats and commentaries.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/10" />

      {/* Dashboard Layout Presets */}
      <DashboardPresets />
    </div>
  );
}
