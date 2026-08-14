/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070c',
        surface: '#0a0f1c',
        'surface-raised': '#101a2e',
        border: '#1f2a44',
        accent: {
          DEFAULT: '#ef3b4a',
          dim: '#b7222f',
          glow: '#ff6b7a',
        },
        safe: '#22c55e',
        suspicious: '#eab308',
        high: '#ef4444',
        unknown: '#64748b',
        text: {
          DEFAULT: '#e9edf5',
          muted: '#8b93a8',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(239,59,74,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(239,59,74,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(239, 59, 74, 0.65)',
        glow: '0 0 24px rgba(239, 59, 74, 0.25)',
        'glow-lg': '0 0 60px rgba(239, 59, 74, 0.18)',
      },
    },
  },
  plugins: [],
};
