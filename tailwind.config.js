/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dark Mode Palette ─────────────────────────
        'dark-primary':   '#E80F88',
        'dark-accent':    '#E63E6D',
        'dark-deep':      '#790252',
        'dark-deeper':    '#4C0033',

        // ── Light Mode Palette ────────────────────────
        'light-primary':  '#F13E93',
        'light-accent':   '#F875AA',
        'light-50':       '#FFE4EF',
        'light-100':      '#FFAAB8',
        'light-200':      '#FE9EC7',
        'light-300':      '#F891BB',

        // ── Semantic shortcuts ────────────────────────
        brand: {
          DEFAULT: 'var(--color-brand)',
          muted:   'var(--color-brand-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        // Dark Mode gradients
        'hero-dark':  'linear-gradient(135deg, #4C0033 0%, #790252 50%, #E80F88 100%)',
        'card-dark':  'linear-gradient(145deg, #2a0020 0%, #4C0033 100%)',
        // Light Mode gradients  
        'hero-light': 'linear-gradient(135deg, #FFE4EF 0%, #FE9EC7 50%, #F13E93 100%)',
        'card-light': 'linear-gradient(145deg, #FFE4EF 0%, #F891BB 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        fadeIn:  'fadeIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
      },
      boxShadow: {
        'glow-dark':  '0 0 24px rgba(232, 15, 136, 0.35)',
        'glow-light': '0 0 24px rgba(241, 62, 147, 0.25)',
        'card':       '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
