/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'japanese': ['Noto Sans CJK JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      },
      colors: {
        'baby-pink': '#FFE4E6',
        'baby-blue': '#E0F2FE',
        'baby-yellow': '#FEF3C7',
      }
    },
  },
  plugins: [],
}