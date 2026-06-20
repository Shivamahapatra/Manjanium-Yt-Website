'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Spin } from 'antd';

export function UserSettingsComponent() {
  const { user, isLoaded } = useUser();
  const { preferences, loading, updatePreferences, error } = useUserPreferences();
  const [saveMessage, setSaveMessage] = useState('');

  if (!isLoaded || loading) {
    return <div className="flex items-center justify-center h-full"><Spin size="large" /></div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-neutral-400">User not found</div>;
  }

  const notificationPrefs = preferences?.notifications || {
    email: true,
    push: true,
    alerts: true,
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      const newNotifs = { ...notificationPrefs, [key]: value };
      await updatePreferences({ notifications: newNotifs });
      setSaveMessage('✓ Saved');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      setSaveMessage('✗ Failed to save');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">User Settings</h2>
      <p className="text-neutral-400 mb-8">Manage your profile, notifications, and privacy.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded mb-6">
          {saveMessage}
        </div>
      )}

      {/* Account Information */}
      <div className="mb-12 bg-white/5 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <span className="text-manjanium-gold">👤</span> Account Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Display Name</label>
            <input
              type="text"
              value={user.firstName || ''}
              disabled
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Email Address</label>
            <input
              type="email"
              value={user.emailAddresses[0]?.emailAddress || ''}
              disabled
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-12 bg-white/5 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <span className="text-manjanium-gold">🔔</span> Notifications
        </h3>

        <div className="space-y-4">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationPrefs.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="mt-1 w-5 h-5 accent-manjanium-gold"
            />
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-neutral-500">Receive important updates and newsletters via email.</p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationPrefs.push}
              onChange={(e) => handleNotificationChange('push', e.target.checked)}
              className="mt-1 w-5 h-5 accent-manjanium-gold"
            />
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-sm text-neutral-500">Allow browser push notifications for real-time alerts.</p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationPrefs.alerts}
              onChange={(e) => handleNotificationChange('alerts', e.target.checked)}
              className="mt-1 w-5 h-5 accent-manjanium-gold"
            />
            <div>
              <p className="text-white font-medium">Match & Race Alerts</p>
              <p className="text-sm text-neutral-500">Get notified for football matches and F1 sessions.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="bg-white/5 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <span className="text-manjanium-gold">🔒</span> Privacy & Data
        </h3>

        <div className="space-y-4">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 w-5 h-5 accent-manjanium-gold"
            />
            <div>
              <p className="text-white font-medium">Analytics</p>
              <p className="text-sm text-neutral-500">Help us improve by sharing anonymous usage data.</p>
            </div>
          </label>

          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 w-5 h-5 accent-manjanium-gold"
            />
            <div>
              <p className="text-white font-medium">Personalized Recommendations</p>
              <p className="text-sm text-neutral-500">Allow us to use your browsing history to recommend content.</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
