"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "auto";
export type FontSize = "small" | "normal" | "large";
export type ColorIntensity = "normal" | "vibrant";
export type AnimationSpeed = "slow" | "normal" | "fast";

export interface UserSettings {
  displayName: string;
  email: string;
  favoriteF1Teams: string[];
  favoriteFootballTeams: string[];
  preferredLanguage: string;
  timezone: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  matchAlerts: boolean;
  raceAlerts: boolean;
  newsletter: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  personalizedRecommendations: boolean;
  shareProfileData: boolean;
}

export interface AppSettings {
  appearance: {
    theme: Theme;
    fontSize: FontSize;
    colorIntensity: ColorIntensity;
    animationSpeed: AnimationSpeed;
    sidebarAlwaysExpanded: boolean;
  };
  user: UserSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

const defaultSettings: AppSettings = {
  appearance: {
    theme: "dark", // Defaulting to dark as per design system
    fontSize: "normal",
    colorIntensity: "normal",
    animationSpeed: "normal",
    sidebarAlwaysExpanded: false,
  },
  user: {
    displayName: "Guest User",
    email: "guest@example.com",
    favoriteF1Teams: [],
    favoriteFootballTeams: [],
    preferredLanguage: "en",
    timezone: "auto",
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    matchAlerts: true,
    raceAlerts: true,
    newsletter: false,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    personalizedRecommendations: true,
    shareProfileData: false,
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (section: keyof AppSettings, payload: any) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("manjanium-settings");
      if (stored) {
        // Merge with default settings to ensure new fields are populated
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          appearance: { ...prev.appearance, ...(parsed.appearance || {}) },
          user: { ...prev.user, ...(parsed.user || {}) },
          notifications: { ...prev.notifications, ...(parsed.notifications || {}) },
          privacy: { ...prev.privacy, ...(parsed.privacy || {}) },
        }));
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("manjanium-settings", JSON.stringify(settings));
      
      // Apply theme to document (Preview mode functionality)
      // Note: Full app light mode needs CSS variable overrides in globals.css
      if (settings.appearance.theme === "light") {
        document.documentElement.classList.add("light-theme-preview");
      } else {
        document.documentElement.classList.remove("light-theme-preview");
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (section: keyof AppSettings, payload: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...payload,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("manjanium-settings");
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
