import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0F",
        panel: "#11121A",
        panel2: "#171923",
        line: "rgba(255,255,255,0.1)",
        coral: "#FF5A66",
        mint: "#22C55E",
        amber: "#F59E0B",
        violet: "#8B5CF6",
        cyan: "#38BDF8"
      },
      boxShadow: {
        glow: "0 0 50px rgba(255,90,102,0.22)",
        ring: "0 0 80px rgba(56,189,248,0.22)"
      },
      keyframes: {
        ringPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" }
        },
        slideDown: {
          "0%": { transform: "translateY(-120%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        bar: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" }
        }
      },
      animation: {
        ringPulse: "ringPulse 2s ease-in-out infinite",
        dangerPulse: "ringPulse .6s ease-in-out infinite",
        slideDown: "slideDown .42s cubic-bezier(.22,1,.36,1)",
        scan: "scan 2.4s ease-in-out infinite",
        bar: "bar 1s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
