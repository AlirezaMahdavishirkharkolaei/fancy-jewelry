/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        gold: "#C9A84C",
        "gold-lt": "#E2C97E",
        "gold-dk": "#9A7B3A",
        champagne: "#F5E6C8",
        obsidian: "#0A0A0F",
        navy: "#080D1A",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Vazirmatn", "serif"],
        cinzel: ['"Cinzel"', "Vazirmatn", "serif"],
        body: ['"Montserrat"', "Vazirmatn", "sans-serif"],
      },
    },
  },
  plugins: [],
};
