import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          25: "#f5fbff",
        },
      },
      boxShadow: {
        soft: "0 2px 10px rgba(14, 116, 178, 0.08)",
        card: "0 1px 3px rgba(14, 116, 178, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
