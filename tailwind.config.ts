import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#000000",
          panel: "#111111",
          hover: "#1a1a1a",
        },
        border: {
          DEFAULT: "#222222",
          soft: "#1a1a1a",
        },
        text: {
          DEFAULT: "#e8eaf0",
          muted: "#6e7485",
          subtle: "#333333",
        },
        accent: {
          DEFAULT: "#8fb4ff",
        },
        thinking: {
          DEFAULT: "#b39ddb",
        },
        tool: {
          pending: "#d7bb7d",
          done: "#8ec9a8",
        },
        danger: {
          DEFAULT: "#d98c8c",
        },
        code: {
          bg: "#0d0d18",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', "Consolas", "monospace"],
      },
      maxWidth: {
        chat: "760px",
      },
      animation: {
        blink: "blink 0.9s step-end infinite",
        pulse: "pulse 1.2s ease-in-out infinite",
        spin: "spin 0.65s linear infinite",
      },
      keyframes: {
        blink: {
          "50%": { opacity: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
