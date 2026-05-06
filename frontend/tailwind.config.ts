import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-base': 'var(--bg)',
        'bg-card': 'var(--bg-elevated)',
        'bg-raised': 'var(--bg-hover)',
        accent: 'var(--c-tools)',
        'accent-h': 'var(--c-tools-hover)',
        'accent-soft': 'var(--c-tools-soft)',
        'accent-glow': 'rgba(56,189,248,0.12)',
        'text-pri': 'var(--text)',
        'text-sec': 'var(--text-muted)',
        'text-muted': 'var(--text-dim)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--error)',
        info: 'var(--c-tools)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        hover: 'rgba(255,255,255,0.12)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        glow: '0 0 16px rgba(56,189,248,0.25)',
        elev: 'var(--shadow-elev)',
      },
    },
  },
  plugins: [],
}

export default config