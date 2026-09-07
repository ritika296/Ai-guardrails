import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0D12",
        panel: "#12161F",
        raised: "#1A2029",
        hairline: "#262D3A",
        ink: "#E7EAF0",
        muted: "#8B93A5",
        faint: "#5B6274",
        signal: "#3FD0C9",
        signalDim: "#1E3F3D",
        allow: "#34D399",
        allowDim: "#123328",
        block: "#F87171",
        blockDim: "#3A1717",
        escalate: "#FBBF24",
        escalateDim: "#3A2E0C",
      },
      fontFamily: {
        display: [
          "Space Grotesk",
          "Avenir Next",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(63,208,201,0.15), 0 0 24px rgba(63,208,201,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
