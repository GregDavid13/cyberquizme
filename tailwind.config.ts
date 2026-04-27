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
        cyber: {
          bg:      "#0a0a14",
          surface: "#12121f",
          card:    "#1a1a2e",
          border:  "#2a2a45",
          green:   "#00ff88",
          blue:    "#00bfff",
          purple:  "#9b59f5",
          red:     "#ff4757",
          yellow:  "#ffd700",
        },
      },
      animation: {
        "flip-in":  "flipIn 0.3s ease-out",
        "fade-in":  "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        flipIn:  { "0%": { opacity: "0", transform: "rotateY(-90deg)" }, "100%": { opacity: "1", transform: "rotateY(0deg)" } },
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
