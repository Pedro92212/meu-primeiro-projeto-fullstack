import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff",
        "surface-container": "#f1edec",
        background: "#fdf8f8",
        primary: "#000000",
        "on-surface-variant": "#444748",
        "on-surface": "#1c1b1b",
        "surface-container-highest": "#e5e2e1",
        "surface-tint": "#5f5e5e",
        "on-secondary-container": "#755400",
        "on-background": "#1c1b1b",
        error: "#ba1a1a",
        "surface-container-low": "#f7f3f2",
        surface: "#fdf8f8",
        secondary: "#7b5900",
        "surface-container-lowest": "#ffffff",
        "secondary-container": "#fcca66",
        "outline-variant": "#c4c7c7",
        outline: "#747878",
        "aged-gold": "#C89B3C",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        xl: "64px",
        lg: "40px",
        gutter: "20px",
        unit: "4px",
        sm: "16px",
        md: "24px",
        xs: "8px",
        "margin-mobile": "20px",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        h2: ["Plus Jakarta Sans", "sans-serif"],
        button: ["Inter", "sans-serif"],
        "h1-mobile": ["Plus Jakarta Sans", "sans-serif"],
        h1: ["Plus Jakarta Sans", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      fontSize: {
        body: ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        h2: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        button: ["14px", { lineHeight: "1.0", fontWeight: "600" }],
        "h1-mobile": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        label: ["13px", { lineHeight: "1.0", letterSpacing: "0.01em", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
export default config;
