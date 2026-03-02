/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- THIS LINE IS CRITICAL
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#9333ea',
      },
    },
  },
  plugins: [],
}