/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 18px 40px rgba(0,0,0,0.35)',
        soft: '0 8px 24px rgba(0,0,0,0.28)',
      },
    },
  },
  plugins: [],
};
