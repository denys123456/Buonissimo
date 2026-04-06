import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E0E10",
        sand: "#F7F2E8",
        line: "#E9E1D4",
        accent: "#B6542C",
        gold: "#B89155",
        olive: "#6E7C54",
        cream: "#FFFDF8"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
        premium: "0 24px 80px rgba(15, 23, 42, 0.12)",
        glow: "0 16px 40px rgba(182, 84, 44, 0.16)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        paper:
          "radial-gradient(circle at top left, rgba(184,145,85,0.12), transparent 35%), radial-gradient(circle at top right, rgba(182,84,44,0.08), transparent 30%)",
        premium:
          "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(247,242,232,0.82))"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        rise: "rise 700ms ease-out both",
        float: "float 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
