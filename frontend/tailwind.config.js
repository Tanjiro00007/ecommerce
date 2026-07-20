/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        paper: "#FAFAF7",
        moss: {
          50: "#F1F5F0",
          100: "#DCE6D9",
          300: "#9DB894",
          500: "#5C7A52",
          600: "#4A6342",
          700: "#3A4E34",
        },
        clay: "#B5563C",
        gold: "#C9A15A",
        line: "#E4E2DA",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
