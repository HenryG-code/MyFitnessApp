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
      },
      fontFamily: {
        sans: ["Satoshi", "Aptos Display", "Avenir", "Segoe UI", "sans-serif"],
        display: ["Clash Display", "Satoshi", "Aptos Display", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
