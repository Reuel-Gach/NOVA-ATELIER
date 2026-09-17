// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enables toggleable light/dark mode
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0A0A0A", // Deep matte black for backgrounds
          800: "#1A1A1A",
          900: "#050505",
        },
        gold: {
          DEFAULT: "#D4AF37", // Burnished gold for accents
          light: "#E5C158",   // Warm champagne for highlights
          muted: "#8C7326",
        },
        alabaster: {
          DEFAULT: "#F9F9F6", // Off-white for light mode
          200: "#EBEBE8",
        }
      },
      fontFamily: {
        editorial: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.25em',
      }
    },
  },
  plugins: [],
};
export default config;