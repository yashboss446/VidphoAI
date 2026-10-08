import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#08080c',
          raised: '#101015',
        },
        panel: {
          DEFAULT: '#13131a',
          hover: '#191922',
          border: '#232330',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          pink: '#ec4899',
          cyan: '#22d3ee',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#f43f5e',
        ink: {
          DEFAULT: '#f4f4f6',
          muted: '#9696a6',
          faint: '#5c5c6e',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'gradient-mesh':
          'radial-gradient(at 20% 20%, rgba(99,102,241,0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(236,72,153,0.25) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(34,211,238,0.18) 0px, transparent 50%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.3), 0 8px 24px -4px rgba(139,92,246,0.35)',
        'glow-sm': '0 0 0 1px rgba(139,92,246,0.25), 0 2px 10px -2px rgba(139,92,246,0.3)',
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 2.2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
