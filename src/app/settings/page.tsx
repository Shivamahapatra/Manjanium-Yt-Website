"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, User, Info, MessageSquare, Settings as SettingsIcon, Layout, Lock } from "lucide-react";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { UserSettingsComponent } from "@/components/settings/UserSettings";
import { DashboardPresets } from "@/components/settings/DashboardPresets";
import { AboutApp } from "@/components/settings/AboutApp";
import { SuggestionPage } from "@/components/settings/SuggestionPage";
import { useRouter } from "next/navigation";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@clerk/nextjs";
import { Spin } from "antd";

const SETTINGS_CATEGORIES = [
  { id: "appearance", label: "APPEARANCE", icon: <Palette className="w-5 h-5" /> },
  { id: "user", label: "USER SETTINGS", icon: <User className="w-5 h-5" /> },
  { id: "dashboard", label: "DASHBOARD PRESETS", icon: <Layout className="w-5 h-5" /> },
  { id: "about", label: "ABOUT APP", icon: <Info className="w-5 h-5" /> },
  { id: "suggestions", label: "SUGGESTIONS", icon: <MessageSquare className="w-5 h-5" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");
  const router = useRouter();
  
  const { isSignedIn, isLoaded } = useAuth();
  const { preferences, loading, updatePreferences } = useUserPreferences();

  const handleLoginClick = () => {
    router.push("/sign-up");
  };

  const renderActiveTab = () => {
    if (!isSignedIn && !isLoaded) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isSignedIn && activeTab !== "about") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-border-color">
            <Lock className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Sign in to customize</h2>
          <p className="text-text-secondary mb-8">
            Guest users can browse the dashboard, but you need an account to customize your appearance, dashboard layouts, and notification preferences.
          </p>
          <button
            onClick={handleLoginClick}
            className="w-full sm:w-auto px-8 py-3 bg-semantic-blue hover:opacity-90 hover:shadow-[0_0_15px_var(--semantic-blue)] text-white font-semibold rounded-lg transition-all duration-200"
          >
            Sign Up / Login
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "appearance":
        return <AppearanceSettings />;
      case "user":
        return <UserSettingsComponent />;
      case "dashboard":
        return <DashboardPresets />;
      case "about":
        return <AboutApp />;
      case "suggestions":
        return <SuggestionPage />;
      default:
        return <AppearanceSettings />;
    }
  };

  if (isSignedIn && loading) {
    return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  }

  return (
    <div className="min-h-full w-full bg-background flex flex-col md:flex-row">
      {/* MOBILE TABS */}
      <div className="md:hidden flex items-center overflow-x-auto border-b border-border-color shrink-0 hide-scrollbar bg-surface sticky top-0 z-20">
        {SETTINGS_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-4 whitespace-nowrap text-sm font-semibold transition-colors relative",
              activeTab === category.id ? "text-accent" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {category.icon}
            <span>{category.label}</span>
            {activeTab === category.id && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-[250px] shrink-0 border-r border-border-color bg-surface p-4 min-h-[calc(100vh-64px)]">
        <div className="flex items-center gap-3 mb-8 px-2 mt-4">
          <SettingsIcon className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-bold text-text-primary tracking-wide">SETTINGS</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 relative overflow-hidden group text-left hover:scale-[1.02]",
                activeTab === category.id 
                  ? "text-accent bg-bg-primary" 
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-primary"
              )}
            >
              <div className="relative z-10 flex items-center gap-3">
                {category.icon}
                {category.label}
              </div>
              
              {activeTab === category.id && (
                <motion.div
                  layoutId="desktop-tab-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-bg-primary relative">
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
