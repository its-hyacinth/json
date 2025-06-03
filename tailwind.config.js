/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cnu-blue': '#003366',
        'cnu-gray': '#8B9DAF',
      },
    },
  },
  plugins: [],
  important: true, // This ensures Tailwind classes override MUI styles
} 