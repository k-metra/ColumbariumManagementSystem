/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['SF Pro Display', 'sans-serif'],
        'sans': ['SF Pro Text', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

