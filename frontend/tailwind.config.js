/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-primary': '#22C55E',
        'eco-hover': '#16A34A',
        'ai-accent': '#3B82F6',
        'eco-bg': '#FFFFFF',
        'eco-section': '#F8FAFC',
        'eco-text': '#0F172A',
        'eco-muted': '#475569',
        'eco-border': '#E2E8F0',
        'eco-warning': '#F59E0B',
        'eco-critical': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}