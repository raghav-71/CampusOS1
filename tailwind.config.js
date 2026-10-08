/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
    },
    extend: {
      colors: {
        background: { DEFAULT: '#F5F5F7' },
        foreground: { DEFAULT: '#1D1D1F' },
        primary: {
          DEFAULT: '#22C55E',
          dark: '#15803D',
          light: '#DCFCE7',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F0FDF4',
          foreground: '#15803D',
        },
        accent: {
          DEFAULT: '#15803D',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F5F7',
          foreground: '#6E6E73',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1D1D1F',
        },
        border: { DEFAULT: 'rgba(0, 0, 0, 0.08)' },
        input: { DEFAULT: '#FFFFFF' },
        ring: { DEFAULT: '#22C55E' },
        danger: { DEFAULT: '#EF4444' },
        warning: { DEFAULT: '#F59E0B' },
        success: { DEFAULT: '#22C55E' },
        info: { DEFAULT: '#3B82F6' },
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          700: '#15803D',
        },
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
        md: '12px',
        lg: '16px',
        xl: '18px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'var(--font-plus-jakarta-sans)',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04)',
        card: '0 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.07)',
        modal: '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
        glow: '0 4px 14px 0 rgba(34, 197, 94, 0.25)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};