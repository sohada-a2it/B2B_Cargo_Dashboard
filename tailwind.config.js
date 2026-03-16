/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // আপনার প্রজেক্টের পাথ অনুযায়ী
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E67E22', 
        secondary: '#fffaf6',
        third:"#122652",
        fourth:"#3C719D",
        fifth:"gray-600",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}