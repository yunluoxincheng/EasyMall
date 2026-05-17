import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "\"SF Pro Display\"",
          "\"PingFang SC\"",
          "\"Segoe UI\"",
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
        "accent-foreground": "var(--accent-foreground)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      boxShadow: {
        card: "0 18px 40px rgba(15, 23, 42, 0.08)",
        panel: "0 24px 56px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      backgroundImage: {
        "storefront-glow":
          "radial-gradient(circle at top left, rgba(16, 185, 129, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,1))",
        "admin-grid":
          "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "20px 20px",
      },
    },
  },
  plugins: [],
};

export default config;
