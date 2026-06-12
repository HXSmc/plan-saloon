import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#16181c",
          deep: "#0e1013",
          light: "#22262c",
        },
        cream: {
          DEFAULT: "#f4efe3",
          dim: "#cfc8b8",
        },
        neon: {
          yellow: "#ffd11a",
          glow: "#ffe35c",
          red: "#ff3b4e",
          blue: "#2f7bff",
        },
        amber: {
          glow: "rgba(255,180,60,0.18)",
        },
      },
      fontFamily: {
        display: ["var(--font-archivo)", "var(--font-arabic)", "system-ui", "sans-serif"],
        label: ["var(--font-montserrat)", "var(--font-arabic)", "system-ui", "sans-serif"],
        body: ["var(--font-lora)", "var(--font-arabic)", "Georgia", "serif"],
      },
      boxShadow: {
        "glow-yellow":
          "0 0 12px rgba(255,209,26,0.55), 0 0 28px rgba(255,209,26,0.30)",
        "glow-yellow-lg":
          "0 0 18px rgba(255,209,26,0.65), 0 0 48px rgba(255,209,26,0.35)",
        "glow-red": "0 0 10px rgba(255,59,78,0.6), 0 0 22px rgba(255,59,78,0.4)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "panel-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "panel-in": "panel-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
