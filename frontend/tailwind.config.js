/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark editorial palette
        charcoal:   '#0f0f13',
        surface:    '#16161d',
        surface2:   '#1e1e28',
        border:     '#2a2a36',
        muted:      '#6b6b7b',
        offwhite:   '#f0ede8',
        cream:      '#d4d0c8',
        accent:     '#f5c518',   // electric yellow
        'accent-dim': '#c49e10',
        negative:   '#e74c3c',   // deep red
        positive:   '#27ae60',   // green
        neutral:    '#6b6b7b',   // grey
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        growWidth: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--target-width, 100%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        toastIn: {
          '0%':   { transform: 'translateY(100%) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease-out forwards',
        'grow-width': 'growWidth 1s ease-out forwards',
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
        'toast-in':   'toastIn 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
