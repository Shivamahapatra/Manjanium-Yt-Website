"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, User, Info, MessageSquare, Settings as SettingsIcon } from "lucide-react";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { UserSettingsComponent } from "@/components/settings/UserSettings";
import { AboutApp } from "@/components/settings/AboutApp";
import { SuggestionPage } from "@/components/settings/SuggestionPage";

const SETTINGS_CATEGORIES = [
  { id: "appearance", label: "APPEARANCE", icon: <Palette className="w-5 h-5" /> },
  { id: "user", label: "USER SETTINGS", icon: <User className="w-5 h-5" /> },
  { id: "about", label: "ABOUT APP", icon: <Info className="w-5 h-5" /> },
  { id: "suggestions", label: "SUGGESTIONS", icon: <MessageSquare className="w-5 h-5" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appearance":
        return <AppearanceSettings />;
      case "user":
        return <UserSettingsComponent />;
      case "about":
        return <AboutApp />;
      case "suggestions":
        return <SuggestionPage />;
      default:
        return <AppearanceSettings />;
    }
  };

  return (
    <div className="min-h-full w-full bg-background flex flex-col md:flex-row">
      {/* MOBILE TABS */}
      <div className="md:hidden flex items-center overflow-x-auto border-b border-white/10 shrink-0 hide-scrollbar bg-[#0f172a] sticky top-0 z-20">
        {SETTINGS_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-4 whitespace-nowrap text-sm font-semibold transition-colors relative",
              activeTab === category.id ? "text-[#fbbf24]" : "text-[#94a3b8] hover:text-white"
            )}
          >
            {category.icon}
            <span>{category.label}</span>
            {activeTab === category.id && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fbbf24]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-[250px] shrink-0 border-r border-white/10 bg-[#0f172a] p-4 min-h-[calc(100vh-64px)]">
        <div className="flex items-center gap-3 mb-8 px-2 mt-4">
          <SettingsIcon className="w-6 h-6 text-[#fbbf24]" />
          <h1 className="text-xl font-bold text-white tracking-wide">SETTINGS</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all relative overflow-hidden group text-left",
                activeTab === category.id 
                  ? "text-[#fbbf24] bg-white/5" 
                  : "text-[#94a3b8] hover:text-white hover:bg-white/5"
              )}
            >
              <div className="relative z-10 flex items-center gap-3">
                {category.icon}
                {category.label}
              </div>
              
              {activeTab === category.id && (
                <motion.div
                  layoutId="desktop-tab-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#fbbf24]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-background/50 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
