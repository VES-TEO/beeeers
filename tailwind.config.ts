import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#221609",
        "bg-elev": "#33210F",
        "bg-elev-2": "#402A16",
        border: "rgba(255,201,60,0.14)",
        text: "#F5F3EE",
        "text-dim": "#C4A98B",
        amber: "#FFC93C",
        "amber-deep": "#FFA630",
        coral: "#FF5D73",
        mint: "#6EE7B7",
      },
      fontFamily: {
        fredoka: ["var(--font-fredoka)", "sans-serif"],
        baloo: ["var(--font-baloo)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
