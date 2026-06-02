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
        // Brand palette — warm, earthy, trustworthy
        earth: {
          50:  "#fdf6ee",
          100: "#f8e8cf",
          200: "#f0cc97",
          300: "#e6aa5a",
          400: "#dc8f2e",
          500: "#c97520",
          600: "#a85b19",
          700: "#854418",
          800: "#6b381a",
          900: "#572e19",
        },
        forest: {
          50:  "#f0f7f0",
          100: "#d9edd9",
          200: "#b4d9b4",
          300: "#82bf82",
          400: "#529f52",
          500: "#337f33",
          600: "#266326",
          700: "#1e4f1e",
          800: "#193f19",
          900: "#163416",
        },
        sand: {
          50:  "#fdfaf5",
          100: "#f9f1e0",
          200: "#f2e0bb",
          300: "#e8c98a",
          400: "#dcad57",
          500: "#ce9334",
          DEFAULT: "#f9f1e0",
        },
        clay: {
          DEFAULT: "#c0634a",
          light: "#d4856e",
          dark: "#8f3d29",
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
