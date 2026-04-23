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
        brand: {
          50: "#EFFAF1",
          100: "#D7F0DD",
          300: "#78CB84",
          500: "#4CAF50",
          700: "#1B5E20",
          900: "#103A15"
        },
        amber: {
          500: "#FF6F00"
        },
        gold: {
          500: "#FFC107"
        },
        surface: "#FFFFFF",
        background: "#F5F5F5",
        ink: {
          900: "#212121",
          500: "#757575"
        },
        danger: "#D32F2F"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(27, 94, 32, 0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(255, 193, 7, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(76, 175, 80, 0.2), transparent 28%), linear-gradient(180deg, #f6fbf6 0%, #f5f5f5 100%)"
      }
    }
  },
  plugins: []
};

export default config;

