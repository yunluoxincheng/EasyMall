import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-body)",
          "\"PingFang SC\"",
          "\"Hiragino Sans GB\"",
          "\"Microsoft YaHei\"",
          "\"Helvetica Neue\"",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        border: "var(--border)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-foreground": "var(--accent-foreground)",
        "accent-light": "var(--accent-light)",
        "accent-lighter": "var(--accent-lighter)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0, 0, 0, 0.06)",
        panel: "0 2px 12px rgba(0, 0, 0, 0.08)",
        float: "0 4px 20px rgba(0, 0, 0, 0.1)",
        header: "0 1px 8px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
