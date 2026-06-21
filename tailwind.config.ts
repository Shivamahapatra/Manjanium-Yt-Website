import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Standardizing F1 Red accents
        f1: {
          red: "var(--f1-red, #E10600)",
          "red-hover": "var(--f1-red-hover, #c20500)",
        },
        // Stitch Veridian Flow theme tokens mapped to CSS variables for dynamic light/dark mode support
        stitch: {
          background: "var(--stitch-background, #f8f9ff)",
          foreground: "var(--stitch-foreground, #0b1c30)",
          primary: "var(--stitch-primary, #006d32)",
          "primary-container": "var(--stitch-primary-container, #00d166)",
          secondary: "var(--stitch-secondary, #0059bb)",
          "secondary-container": "var(--stitch-secondary-container, #0070ea)",
          surface: "var(--stitch-surface, #f8f9ff)",
          "surface-container": "var(--stitch-surface-container, #e5eeff)",
          "surface-container-low": "var(--stitch-surface-container-low, #eff4ff)",
          "surface-container-highest": "var(--stitch-surface-container-highest, #d3e4fe)",
          "surface-container-lowest": "var(--stitch-surface-container-lowest, #ffffff)",
          outline: "var(--stitch-outline, #6c7b6c)",
          "outline-variant": "var(--stitch-outline-variant, #bbcbb9)",
          error: "var(--stitch-error, #ba1a1a)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
