import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background
        "ts-bg":        "#050505",
        "ts-surface":   "#0D0D0D",
        "ts-surface-2": "#141414",
        "ts-border":    "rgba(255,255,255,0.08)",

        // Acentos
        "ts-cyan":      "#00F2FE",
        "ts-purple":    "#4FACFE",

        // Texto
        "ts-white":     "#EDEDED",
        "ts-gray":      "#8A8A8E",
        "ts-gray-2":    "#3A3A3E",
      },

      fontFamily: {
        sans:  ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-geist-mono)", "monospace"],
      },

      // Gradiantes
      backgroundImage: {
        "ts-gradient":       "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
        "ts-gradient-dark":  "linear-gradient(135deg, #00F2FE20 0%, #4FACFE20 100%)",
        "ts-radial":         "radial-gradient(ellipse at top, #0D1F3C 0%, #050505 70%)",
      },

      // Animaciones
      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
      },

      // Blur
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
