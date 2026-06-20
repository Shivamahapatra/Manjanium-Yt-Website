'use client';

import React, { useState, useEffect } from 'react';
import { useUserPreferences, UserPreferences } from '@/hooks/useUserPreferences';
import { Spin } from 'antd';

export function AppearanceSettings() {
  const { preferences, loading, updatePreferences, error: hookError } = useUserPreferences();
  const [localPrefs, setLocalPrefs] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spin size="large" /></div>;
  }

  if (!localPrefs) {
    return <div className="p-8 text-center text-neutral-400">Loading preferences...</div>;
  }

  const handleChange = async (updates: Partial<UserPreferences>) => {
    // Optimistic update - change UI immediately
    setLocalPrefs(prev => prev ? { ...prev, ...updates } : null);
    setMessage('');
    setError(null);
    setSaving(true);

    try {
      await updatePreferences(updates);
      setMessage('✓ Changes saved');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setLocalPrefs(preferences); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-3xl font-bold text-white mb-2">Theme Preferences</h2>
      <p className="text-neutral-400 mb-8">Customize the visual appearance of Manjanium Sports Hub.</p>

      {error && <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">{error}</div>}
      {hookError && <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">{hookError}</div>}
      {message && <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded mb-6">{message}</div>}

      {/* Theme Selection */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">🎨 Theme Mode</h3>
        <div className="flex gap-4 flex-wrap">
          {(['light', 'dark', 'auto'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => handleChange({ theme })}
              disabled={saving}
              className={`px-8 py-6 rounded-2xl border-2 font-semibold transition-all ${
                localPrefs.theme === theme
                  ? 'border-manjanium-gold bg-manjanium-gold/10 text-white shadow-lg'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {theme === 'light' ? '☀️ Light' : theme === 'dark' ? '🌙 Dark' : '⚙️ Auto'}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">T Font Size</h3>
        <div className="flex gap-4 flex-wrap">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => handleChange({ fontSize: size })}
              disabled={saving}
              className={`px-8 py-4 rounded-lg border-2 font-semibold transition-all ${
                localPrefs.fontSize === size
                  ? 'border-manjanium-gold bg-manjanium-gold/10 text-white shadow-lg'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {size === 'sm' ? 'Small' : size === 'md' ? 'Normal' : 'Large'}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Speed */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-white mb-6">⚡ Animation Speed</h3>
        <div className="flex gap-4 flex-wrap">
          {(['normal', 'reduced', 'fast'] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => handleChange({ animationSpeed: speed })}
              disabled={saving}
              className={`px-8 py-4 rounded-lg border-2 font-semibold transition-all ${
                localPrefs.animationSpeed === speed
                  ? 'border-manjanium-gold bg-manjanium-gold/10 text-white shadow-lg'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {saving && <p className="text-center text-neutral-500 text-sm">Saving...</p>}
    </div>
  );
}
