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
        jarvis: {
          bg: '#080C14',
          surface: '#0F172A',
          card: '#131D31',
          panel: '#1E293B',
          border: 'rgba(56, 189, 248, 0.15)',
          accent: '#38BDF8',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          purple: '#A855F7',
          glow: 'rgba(56, 189, 248, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'ripple': 'ripple 2s infinite cubic-bezier(0, 0.2, 0.8, 1)',
        'wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.3), inset 0 0 15px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(56, 189, 248, 0.7), inset 0 0 25px rgba(168, 85, 247, 0.4)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        wave: {
          '0%': { height: '15%' },
          '100%': { height: '95%' },
        }
      }
    },
  },
  plugins: [],
}
