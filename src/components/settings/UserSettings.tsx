"use client";

import React, { useState } from "react";
import { useSettings } from "@/lib/settings-context";
import { User, Bell, Shield, Database, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function UserSettingsComponent() {
  const { settings, updateSettings } = useSettings();
  const { user, notifications, privacy } = settings;
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [localName, setLocalName] = useState(user.displayName);

  const handleSaveName = () => {
    setSaveStatus("saving");
    updateSettings("user", { displayName: localName });
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="pr-4">
        <div className="font-semibold text-white mb-1">{label}</div>
        <div className="text-sm text-[#94a3b8]">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors shrink-0",
          checked ? "bg-[#fbbf24]" : "bg-white/20"
        )}
      >
        <motion.div
          className={cn(
            "w-4 h-4 rounded-full bg-white absolute top-1",
            checked ? "shadow-sm" : ""
          )}
          initial={false}
          animate={{
            left: checked ? "calc(100% - 20px)" : "4px",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">User Settings</h2>
        <p className="text-[#94a3b8]">Manage your profile, notifications, and privacy.</p>
      </div>

      {/* Account Info */}
      <section className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-lg">Account Information</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Display Name</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="flex-1 bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
              />
              <button
                onClick={handleSaveName}
                disabled={localName === user.displayName || saveStatus === "saving"}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                  saveStatus === "saved" 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    : "bg-[#fbbf24] text-black hover:bg-[#fbbf24]/90 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40"
                )}
              >
                {saveStatus === "saved" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Email Address</label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full bg-background/50 border border-white/5 rounded-lg px-4 py-2 text-[#94a3b8] cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">Email address cannot be changed at this time.</p>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-lg">Notifications</h3>
        </div>

        <div className="flex flex-col">
          <ToggleSwitch 
            label="Email Notifications" 
            description="Receive important updates and newsletters via email."
            checked={notifications.emailNotifications}
            onChange={(val) => updateSettings("notifications", { emailNotifications: val })}
          />
          <ToggleSwitch 
            label="Push Notifications" 
            description="Allow browser push notifications for real-time alerts."
            checked={notifications.pushNotifications}
            onChange={(val) => updateSettings("notifications", { pushNotifications: val })}
          />
          <ToggleSwitch 
            label="Match Alerts" 
            description="Get notified when your favorite football teams score."
            checked={notifications.matchAlerts}
            onChange={(val) => updateSettings("notifications", { matchAlerts: val })}
          />
          <ToggleSwitch 
            label="Race Alerts" 
            description="Session starting alerts and red flag notifications."
            checked={notifications.raceAlerts}
            onChange={(val) => updateSettings("notifications", { raceAlerts: val })}
          />
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-lg">Privacy & Data</h3>
        </div>

        <div className="flex flex-col">
          <ToggleSwitch 
            label="Analytics" 
            description="Help us improve by sharing anonymous usage data."
            checked={privacy.analytics}
            onChange={(val) => updateSettings("privacy", { analytics: val })}
          />
          <ToggleSwitch 
            label="Personalized Recommendations" 
            description="Allow us to use your browsing history to recommend content."
            checked={privacy.personalizedRecommendations}
            onChange={(val) => updateSettings("privacy", { personalizedRecommendations: val })}
          />
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-[#94a3b8]" />
            <h4 className="font-semibold text-white">Data Management</h4>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/10">
              Export My Data
            </button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/10">
              Clear Cache
            </button>
            <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium border border-red-500/20">
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
