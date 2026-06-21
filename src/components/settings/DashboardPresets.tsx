"use client";

import React, { useState } from "react";
import { useUserPreferences, UserPreferences } from "@/hooks/useUserPreferences";
import { Spin } from "antd";
import { F1_PRESETS, F1PresetKey, FOOTBALL_PRESETS, FootballPresetKey } from "@/lib/dashboard-presets";
import { Check } from "lucide-react";

export function DashboardPresets() {
  const { preferences, loading, updatePreferences, error: hookError } = useUserPreferences();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!preferences) {
    return <div className="p-8 text-center text-neutral-400">Loading preferences...</div>;
  }

  const handleUpdate = async (updates: Partial<UserPreferences>) => {
    setMessage("");
    setError(null);
    setSaving(true);

    try {
      await updatePreferences(updates);
      setMessage("✓ Preset applied");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-3xl font-bold text-white mb-2">Dashboard Presets</h2>
      <p className="text-neutral-400 mb-8">
        Customize the layout and visible panels for the F1 and Football hubs.
      </p>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">{error}</div>}
      {hookError && <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">{hookError}</div>}
      {message && <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded mb-6 flex items-center gap-2"><Check className="w-5 h-5" /> {message}</div>}

      {/* F1 Presets */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-2 h-6 bg-red-600 rounded-full" />
          F1 Hub Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(F1_PRESETS) as F1PresetKey[]).map((key) => {
            const preset = F1_PRESETS[key];
            const isActive = preferences.f1DashboardPreset === key;
            return (
              <button
                key={key}
                onClick={() => handleUpdate({ f1DashboardPreset: key })}
                disabled={saving}
                className={`flex flex-col text-left p-6 rounded-2xl border-2 transition-all ${
                  isActive
                    ? "border-red-500 bg-red-500/10 shadow-lg"
                    : "border-neutral-800 bg-black/20 hover:border-neutral-600"
                } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <h4 className={`text-lg font-bold ${isActive ? "text-red-400" : "text-white"}`}>{preset.name}</h4>
                  {isActive && <Check className="w-5 h-5 text-red-500" />}
                </div>
                <p className="text-sm text-neutral-400 mb-4 h-10">{preset.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {preset.showTelemetry && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Telemetry</span>}
                  {preset.showStandings && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Standings</span>}
                  <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded capitalize">Size: {preset.timingSize}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Football Presets */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-600 rounded-full" />
          Football Hub Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(FOOTBALL_PRESETS) as FootballPresetKey[]).map((key) => {
            const preset = FOOTBALL_PRESETS[key];
            const isActive = preferences.footballDashboardPreset === key;
            return (
              <button
                key={key}
                onClick={() => handleUpdate({ footballDashboardPreset: key })}
                disabled={saving}
                className={`flex flex-col text-left p-6 rounded-2xl border-2 transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-500/10 shadow-lg"
                    : "border-neutral-800 bg-black/20 hover:border-neutral-600"
                } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <h4 className={`text-lg font-bold ${isActive ? "text-blue-400" : "text-white"}`}>{preset.name}</h4>
                  {isActive && <Check className="w-5 h-5 text-blue-500" />}
                </div>
                <p className="text-sm text-neutral-400 mb-4 h-10">{preset.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {preset.showStats && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Match Stats</span>}
                  {preset.showStandings && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Standings</span>}
                  <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded capitalize">{preset.layout}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {saving && <p className="text-center text-neutral-500 text-sm">Saving preset...</p>}
    </div>
  );
}
