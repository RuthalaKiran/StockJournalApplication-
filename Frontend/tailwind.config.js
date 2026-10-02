/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e17',
          surface: '#111827',
          card: '#161f30',
          border: '#1f293d',
          hover: '#1e293b',
          muted: '#8e9bb0',
        },
        trade: {
          green: '#10b981',
          'green-light': '#34d399',
          'green-bg': 'rgba(16, 185, 129, 0.15)',
          red: '#ef4444',
          'red-light': '#f87171',
          'red-bg': 'rgba(239, 68, 68, 0.15)',
          orange: '#f59e0b',
          'orange-light': '#fbbf24',
          'orange-bg': 'rgba(245, 158, 11, 0.15)',
          cyan: '#06b6d4',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
