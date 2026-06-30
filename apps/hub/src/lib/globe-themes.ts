export interface GlobeThemeConfig {
  ambientLight: string;
  directionalLeftLight: string;
  directionalTopLight: string;
  pointLight: string;
  globeColor: string;
  polygonColor: string;
  showAtmosphere: boolean;
  atmosphereColor: string;
  atmosphereAltitude: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export const GLOBE_THEMES: Record<"dark" | "light", GlobeThemeConfig> = {
  dark: {
    ambientLight: "#ffffff",
    directionalLeftLight: "#3b82f6",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    globeColor: "#0b1329",
    polygonColor: "rgba(14, 165, 233, 0.45)",
    showAtmosphere: true,
    atmosphereColor: "#2563eb",
    atmosphereAltitude: 0.15,
    autoRotate: true,
    autoRotateSpeed: 0.6,
  },
  light: {
    ambientLight: "#f0f0f0",
    directionalLeftLight: "#0ea5e9",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    globeColor: "#e8f1f5",
    polygonColor: "rgba(14, 165, 233, 0.25)",
    showAtmosphere: true,
    atmosphereColor: "#87ceeb",
    atmosphereAltitude: 0.1,
    autoRotate: true,
    autoRotateSpeed: 0.6,
  },
};

// Maps standard F1 circuit colors to high-contrast versions based on theme to satisfy WCAG AA contrast (4.5:1)
const COLOR_THEME_MAP: Record<string, { dark: string; light: string }> = {
  "#3b82f6": { dark: "#3b82f6", light: "#1d4ed8" }, // Blue
  "#ef4444": { dark: "#ef4444", light: "#dc2626" }, // Red
  "#10b981": { dark: "#34d399", light: "#059669" }, // Green (emerald for dark mode visibility)
  "#f59e0b": { dark: "#f59e0b", light: "#b45309" }, // Amber
  "#8b5cf6": { dark: "#a78bfa", light: "#6d28d9" }, // Purple (violet for dark mode visibility)
  "#06b6d4": { dark: "#22d3ee", light: "#0891b2" }, // Cyan
  "#14b8a6": { dark: "#2dd4bf", light: "#0f766e" }, // Teal
};

export function getThemeArcColor(baseColor: string, theme: "dark" | "light"): string {
  const match = COLOR_THEME_MAP[baseColor.toLowerCase()];
  if (match) {
    return theme === "light" ? match.light : match.dark;
  }
  return baseColor;
}
