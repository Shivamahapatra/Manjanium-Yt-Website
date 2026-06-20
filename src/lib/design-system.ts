export const colors = {
  primary: "#0f172a", // Deep Navy
  accent: "#fbbf24", // Gold/Amber
  secondary: "#0ea5e9", // Electric Blue
  success: "#10b981", // Emerald
  alert: "#ef4444", // Scarlet
  background: "#09090b", // Near-black
  text: "#f1f5f9", // Light gray
};

export const typography = {
  fonts: {
    heading: "var(--font-space-grotesk)",
    body: "var(--font-inter)",
    mono: "var(--font-jetbrains-mono)",
  },
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
  },
};

export const spacing = {
  base: 4,
  increments: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
    16: "64px",
  },
};

export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "50%",
};

export const shadows = {
  subtle: "0 1px 3px rgba(0,0,0,0.12)",
  medium: "0 4px 12px rgba(0,0,0,0.15)",
  deep: "0 8px 24px rgba(0,0,0,0.2)",
  glow: "0 0 20px rgba(251,191,36,0.3)",
};

export const components = {
  buttonSizes: {
    sm: "32px",
    md: "40px",
    lg: "48px",
  },
  inputHeight: "40px",
  cardPadding: "16px",
  sectionPadding: "24px",
};

export const transitions = {
  durations: {
    quick: "150ms",
    standard: "300ms",
    slow: "500ms",
  },
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

export const breakpoints = {
  mobile: "320px",
  tablet: "768px",
  desktop: "1024px",
  large: "1440px",
};
