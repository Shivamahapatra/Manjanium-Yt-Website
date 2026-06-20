'use client';

import React from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Spin } from 'antd';

export function AppearanceSettings() {
  const { preferences, loading, updatePreferences, error } = useUserPreferences();

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spin size="large" /></div>;
  }

  if (!preferences) {
    return <div className="p-8 text-center text-neutral-400">No preferences found</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">Theme Preferences</h2>
      <p className="text-neutral-400 mb-8">Customize the visual appearance of Manjanium Sports Hub.</p>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">{error}</div>}

      {/* Theme Selection */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">Theme Mode</h3>
        <div className="flex gap-4">
          {(['light', 'dark', 'auto'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updatePreferences({ theme })}
              className={`px-8 py-6 rounded-2xl border-2 font-semibold transition-all ${
                preferences.theme === theme
                  ? 'border-manjanium-gold bg-manjanium-gold/10 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              {theme.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">Font Size</h3>
        <div className="flex gap-4">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updatePreferences({ fontSize: size })}
              className={`px-8 py-4 rounded-lg border-2 font-semibold transition-all ${
                preferences.fontSize === size
                  ? 'border-manjanium-gold bg-manjanium-gold/10 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              {size === 'sm' ? 'Small' : size === 'md' ? 'Normal' : 'Large'}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Speed */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">Animation Speed</h3>
        <div className="flex gap-4">
          {(['normal', 'reduced', 'fast'] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => updatePreferences({ animationSpeed: speed })}
              className={`px-8 py-4 rounded-lg border-2 font-semibold transition-all ${
                preferences.animationSpeed === speed
                  ? 'border-manjanium-gold bg-manjanium-gold/10 text-white'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-neutral-500">Changes are saved automatically.</p>
    </div>
  );
}
