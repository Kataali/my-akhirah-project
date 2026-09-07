import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — logo-aligned fresh greens
        earth: {
          50:  "#f3fcf5",
          100: "#e3f8e8",
          200: "#c7f0d1",
          300: "#9fe4b0",
          400: "#72d48d",
          500: "#45bf67",
          600: "#2fa64f",
          700: "#258541",
          800: "#1f6a36",
          900: "#1a552d",
        },
        forest: {
          50:  "#eefaf1",
          100: "#d7f2df",
          200: "#aee5bf",
          300: "#7fd49b",
          400: "#52bf78",
          500: "#2f9e57",
          600: "#237c44",
          700: "#1b6136",
          800: "#164d2c",
          900: "#123f24",
        },
        sand: {
          50:  "#fcfefd",
          100: "#f5fbf7",
          200: "#e9f5ec",
          300: "#d6ebdc",
          400: "#b8dbc4",
          500: "#96c7a7",
          DEFAULT: "#f5fbf7",
        },
        clay: {
          DEFAULT: "#2e8d4b",
          light: "#49a766",
          dark: "#1f6a35",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url('/images/grain.png')",
      },
    },
  },
  plugins: [],
};

export default config;
