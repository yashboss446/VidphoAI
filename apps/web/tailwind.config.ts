import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b0b0f',
        panel: '#15151c',
        accent: '#6366f1',
      },
    },
  },
  plugins: [],
} satisfies Config;
