import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        sun: "var(--sun)",
        energy: "var(--energy)",
        "soft-yellow": "#fed7aa",
        surface: "var(--surface)",
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        ready: "var(--ready)",
        caution: "var(--caution)",
        strain: "var(--strain)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Segoe UI", "sans-serif"],
        display: ["var(--font-archivo)", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
