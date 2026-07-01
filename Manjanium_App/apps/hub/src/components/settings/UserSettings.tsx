'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Spin } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield } from 'lucide-react';

export function UserSettingsComponent() {
  const { user, isLoaded } = useUser();
  const { preferences, loading, updatePreferences, error } = useUserPreferences();
  const [saveMessage, setSaveMessage] = useState('');

  const showSave = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2500);
  };

  if (!isLoaded || loading) {
    return <div className="flex items-center justify-center h-full"><Spin size="large" /></div>;
  }

  if (!user) {
    return <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>User not found</div>;
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
      showSave('✓ Saved');
    } catch (err) {
      showSave('✗ Failed to save');
    }
  };

  const toggleStyle = (checked: boolean) => ({
    backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-surface-container)',
    borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
  });

  const renderToggle = (label: string, description: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-start gap-4 cursor-pointer group py-3 px-4 rounded-xl transition-colors hover:bg-[var(--color-surface-container-low)]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 items-center rounded-2xl transition-colors duration-200 shrink-0 mt-0.5 border-2"
        style={toggleStyle(checked)}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-2xl transition-transform duration-200"
          style={{
            backgroundColor: checked ? 'var(--color-background)' : 'var(--color-text-secondary)',
            transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          }}
        />
      </button>
      <div>
        <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      </div>
    </label>
  );

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          User Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your profile, notifications, and privacy.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border-l-4 text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Account Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: 'var(--color-primary)' }}>
          <User className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
            Account
          </h3>
        </div>
        <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Display Name</label>
            <input
              type="text"
              value={user.firstName || ''}
              disabled
              className="w-full rounded-lg px-4 py-3 text-sm font-medium border"
              style={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Email Address</label>
            <input
              type="email"
              value={user.emailAddresses[0]?.emailAddress || ''}
              disabled
              className="w-full rounded-lg px-4 py-3 text-sm font-medium border"
              style={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: 'var(--color-primary)' }}>
          <Bell className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
            Notifications
          </h3>
        </div>
        <div className="rounded-xl border space-y-1 py-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {renderToggle('Email Notifications', 'Receive important updates and newsletters via email.', notificationPrefs.email, (v) => handleNotificationChange('email', v))}
          {renderToggle('Push Notifications', 'Allow browser push notifications for real-time alerts.', notificationPrefs.push, (v) => handleNotificationChange('push', v))}
          {renderToggle('Match & Race Alerts', 'Get notified for football matches and F1 sessions.', notificationPrefs.alerts, (v) => handleNotificationChange('alerts', v))}
        </div>
      </section>

      {/* Privacy & Data */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-l-4 pl-3" style={{ borderColor: 'var(--color-primary)' }}>
          <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
            Privacy & Data
          </h3>
        </div>
        <div className="rounded-xl border space-y-1 py-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {renderToggle('Analytics', 'Help us improve by sharing anonymous usage data.', true, () => {})}
          {renderToggle('Personalized Recommendations', 'Allow us to use your browsing history to recommend content.', true, () => {})}
        </div>
      </section>

      {/* Save Toast */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-lg border"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: saveMessage.includes('✓') ? 'var(--color-primary)' : '#ef4444',
              borderColor: saveMessage.includes('✓') ? 'var(--color-primary)' : '#ef4444'
            }}
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
