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
          DEFAULT: "#352f6e",
          light: "#6b63a8",
          dark: "#221c52",
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
