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
        olive: {
          DEFAULT: "#2596be",
          light: "#5ab0cf",
          dark: "#1a78a0",
        },
        gold: {
          DEFAULT: "#B8962E",
          light: "#D4AF60",
        },
        cream: "#F8F4E8",
      },
    },
  },
  plugins: [],
};
export default config;
