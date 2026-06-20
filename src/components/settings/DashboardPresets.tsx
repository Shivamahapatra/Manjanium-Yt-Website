"use client";

import React, { useState } from "react";
import { useSettings } from "@/lib/settings-context";
import { F1_PRESETS, FOOTBALL_PRESETS, PresetDefinition } from "@/lib/dashboard-presets";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to render a miniature version of the grid for thumbnails
const PresetThumbnail = ({ preset, isActive }: { preset: PresetDefinition, isActive: boolean }) => {
  return (
    <div className={cn(
      "w-full aspect-video rounded-lg p-2 mb-3 grid gap-1 transition-colors",
      isActive ? "bg-[#fbbf24]/20" : "bg-[#0f172a] group-hover:bg-white/5",
      preset.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"
    )}>
      {preset.widgets.map((w, i) => (
        <div 
          key={i} 
          className={cn(
            "rounded-sm border",
            isActive ? "border-[#fbbf24]/50 bg-[#fbbf24]/20" : "border-white/10 bg-white/5",
            w.size === "large" ? (preset.gridCols === 3 ? "col-span-2" : "col-span-2 row-span-2") : "",
            w.size === "medium" ? "col-span-1 row-span-2" : "col-span-1 row-span-1"
          )}
        />
      ))}
    </div>
  );
};

// Full screen preview overlay
const PreviewModal = ({ preset, type }: { preset: PresetDefinition, type: "F1" | "Football" }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col pointer-events-none"
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{type} Dashboard Preview</h2>
        <p className="text-[#fbbf24] font-medium">{preset.name}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 pt-24">
        <div className={cn(
          "w-full max-w-5xl aspect-video bg-[#0f172a] rounded-xl border border-[#fbbf24]/30 shadow-2xl p-4 grid gap-4",
          preset.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"
        )}>
          {preset.widgets.map((w, i) => (
            <div 
              key={i} 
              className={cn(
                "rounded-lg border border-white/10 bg-white/5 flex items-center justify-center p-4",
                w.size === "large" ? (preset.gridCols === 3 ? "col-span-2" : "col-span-2 row-span-2") : "",
                w.size === "medium" ? "col-span-1 row-span-2" : "col-span-1 row-span-1"
              )}
            >
              <span className="text-white/50 font-mono text-sm uppercase text-center">
                {w.id.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        Click to apply this layout
      </div>
    </motion.div>
  );
};

export function DashboardPresets() {
  const { settings, updateSettings } = useSettings();
  const [hoveredPreset, setHoveredPreset] = useState<{ preset: PresetDefinition, type: "F1" | "Football" } | null>(null);

  const handleSelect = async (type: "f1Preset" | "footballPreset", presetId: string) => {
    // 1. Update local state immediately
    updateSettings("dashboard", { [type]: presetId });

    // 2. Fire background API request to save to Supabase
    try {
      await fetch('/api/user/dashboard-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: presetId })
      });
    } catch (e) {
      console.error("Failed to save preset to API", e);
    }
  };

  const PresetCard = ({ preset, type, currentSelectedId }: { preset: PresetDefinition, type: "f1Preset" | "footballPreset", currentSelectedId: string }) => {
    const isActive = currentSelectedId === preset.id;

    return (
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setHoveredPreset({ preset, type: type === "f1Preset" ? "F1" : "Football" })}
        onMouseLeave={() => setHoveredPreset(null)}
        onClick={() => handleSelect(type, preset.id)}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "h-full p-4 rounded-xl border-2 transition-all duration-300 flex flex-col",
            isActive 
              ? "border-[#fbbf24] bg-[#fbbf24]/5" 
              : "border-white/10 bg-[#0f172a] hover:border-white/30"
          )}
        >
          <PresetThumbnail preset={preset} isActive={isActive} />
          
          <div className="flex items-start justify-between gap-2 mt-2">
            <div>
              <h4 className={cn("font-bold text-sm mb-1", isActive ? "text-[#fbbf24]" : "text-white")}>
                {preset.name}
              </h4>
              <p className="text-xs text-[#94a3b8] leading-tight">
                {preset.description}
              </p>
            </div>
            {isActive && (
              <div className="shrink-0 text-[#fbbf24]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-lg mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Dashboard Layouts</h3>
            <p className="text-sm text-[#94a3b8]">Customize your widget arrangements. Hover to preview.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* F1 Presets */}
          <div>
            <h4 className="text-sm font-semibold text-[#fbbf24] uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Formula 1 Hub</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(F1_PRESETS).map(preset => (
                <PresetCard 
                  key={preset.id} 
                  preset={preset} 
                  type="f1Preset" 
                  currentSelectedId={settings.dashboard.f1Preset} 
                />
              ))}
            </div>
          </div>

          {/* Football Presets */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Football Hub</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(FOOTBALL_PRESETS).map(preset => (
                <PresetCard 
                  key={preset.id} 
                  preset={preset} 
                  type="footballPreset" 
                  currentSelectedId={settings.dashboard.footballPreset} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Preview Portal */}
      <AnimatePresence>
        {hoveredPreset && (
          <PreviewModal preset={hoveredPreset.preset} type={hoveredPreset.type} />
        )}
      </AnimatePresence>
    </>
  );
}
