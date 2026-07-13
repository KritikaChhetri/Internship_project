/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ink: {
          900: "#11141A",
          700: "#2B303B",
          500: "#5B6472",
          300: "#9AA2B1",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F4F6F9",
          dark: "#171A21",
          darksubtle: "#1E222B",
        },
        accent: {
          DEFAULT: "#3454D1",
          dark: "#27408B",
          light: "#E8EDFC",
        },
        positive: "#1A8754",
        negative: "#D33C3C",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
