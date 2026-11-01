import type { Config } from "tailwindcss";

// Design tokens lấy từ Stitch "Ethereal Oracle AI" (DESIGN.md)
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#080B0C",
        abyss: "#0F1416",
        glass: "#161D20",
        surface: "#111415",
        "surface-container-lowest": "#0c0f10",
        "surface-container-low": "#191c1d",
        "surface-container": "#1d2021",
        "surface-container-high": "#272a2c",
        "surface-container-highest": "#323536",
        "on-surface": "#e1e3e4",
        "on-surface-variant": "#b9cbb9",
        outline: "#849585",
        "outline-variant": "#3b4b3d",
        primary: "#f1ffef",
        "primary-container": "#00ff87",
        "on-primary-container": "#007138",
        secondary: "#4edea3",
        "secondary-container": "#00a572",
        "tertiary-container": "#63f8bb",
        emerald: { DEFAULT: "#10B981", deep: "#059669", mist: "#34D399" },
        muted: "#94A3B8",
        error: "#ffb4ab",
        "error-soft": "#f87171",
      },
      fontFamily: {
        serif: ["var(--font-garamond)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        label: ["var(--font-grotesk)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["56px", { lineHeight: "64px", letterSpacing: "-0.02em" }],
        "headline-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.015em" }],
        "headline-md": ["28px", { lineHeight: "36px", fontWeight: "500" }],
        "headline-sm": ["22px", { lineHeight: "28px", fontWeight: "500" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "500" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.12em", fontWeight: "500" }],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,255,135,0.25), 0 0 2px #00FF87",
        halo: "0 0 20px rgba(0,255,135,0.35)",
        float: "0 8px 32px -8px rgba(0,0,0,0.65), 0 0 20px -2px rgba(16,185,129,0.12)",
      },
      keyframes: {
        breathe: { "0%,100%": { boxShadow: "0 0 12px rgba(0,255,135,0.15)" }, "50%": { boxShadow: "0 0 28px rgba(0,255,135,0.4)" } },
        flip: { "0%": { transform: "rotateY(180deg)" }, "100%": { transform: "rotateY(0deg)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: {
        breathe: "breathe 3s ease-in-out infinite",
        flip: "flip .7s ease-out both",
        fadeUp: "fadeUp .5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
