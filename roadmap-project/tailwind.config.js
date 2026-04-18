/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-blue-600', 'bg-blue-500',
    'bg-indigo-600', 'bg-indigo-500',
    'bg-purple-600', 'bg-purple-500',
    'bg-pink-600', 'bg-pink-500',
    'bg-slate-600', 'bg-slate-500'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}