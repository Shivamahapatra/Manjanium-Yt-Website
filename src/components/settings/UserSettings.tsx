'use client';
import React from 'react';

import { useUser } from '@clerk/nextjs';

import { Spin } from 'antd';
export function UserSettingsComponent() {

const { user, isLoaded } = useUser();
if (!isLoaded) {

return <div className="flex items-center justify-center h-full"><Spin size="large" /></div>;

}
if (!user) {

return <div className="p-8 text-center text-neutral-400">User not found</div>;

}
return (

<div className="p-8 max-w-2xl">

<h2 className="text-3xl font-bold text-white mb-2">User Settings</h2>

<p className="text-neutral-400 mb-8">Manage your profile, notifications, and privacy.</p>
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
      {[
        { label: 'Email Notifications', desc: 'Receive important updates and newsletters via email.' },
        { label: 'Push Notifications', desc: 'Allow browser push notifications for real-time alerts.' },
        { label: 'Match Alerts', desc: 'Get notified when your favorite football teams score.' },
        { label: 'Race Alerts', desc: 'Session starting alerts and red flag notifications.' }
      ].map((notif) => (
        <div key={notif.label} className="flex items-start gap-4">
          <input type="checkbox" defaultChecked className="mt-1 w-5 h-5" />
          <div>
            <label className="block text-white font-medium">{notif.label}</label>
            <p className="text-sm text-neutral-500">{notif.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Privacy & Data */}
  <div className="bg-white/5 border border-neutral-800 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
      <span className="text-manjanium-gold">🔒</span> Privacy & Data
    </h3>

    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" defaultChecked className="w-5 h-5" />
        <div>
          <p className="text-white font-medium">Analytics</p>
          <p className="text-sm text-neutral-500">Help us improve by sharing anonymous usage data.</p>
        </div>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" defaultChecked className="w-5 h-5" />
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
