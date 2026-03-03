/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        vc: {
          bg: '#060b18',
          card: '#0f1629',
          'card-hover': '#151d35',
          elevated: '#1a2340',
          border: 'rgba(255,255,255,0.06)',
          cyan: '#06d6a0',
          'cyan-dim': 'rgba(6,214,160,0.12)',
          blue: '#3b82f6',
          'blue-dim': 'rgba(59,130,246,0.12)',
          orange: '#f97316',
          'orange-dim': 'rgba(249,115,22,0.12)',
          purple: '#a78bfa',
          'purple-dim': 'rgba(167,139,250,0.12)',
          red: '#ef4444',
          'red-dim': 'rgba(239,68,68,0.12)',
          yellow: '#facc15',
          'yellow-dim': 'rgba(250,204,21,0.12)',
          pink: '#ec4899',
          'pink-dim': 'rgba(236,72,153,0.12)',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(6,214,160,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(6,214,160,0.4)' },
        },
      },
    },
  },
  plugins: [],
}
