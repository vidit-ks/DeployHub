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
        background: '#070709',
        card: '#0e0e13',
        'card-hover': '#14141c',
        border: 'rgba(236, 72, 153, 0.15)',
        'border-hover': 'rgba(236, 72, 153, 0.4)',
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
          neon: '#ff1493',
          glow: '#ff2a85',
        },
        surface: {
          DEFAULT: '#0d0d12',
          subtle: '#12121a',
          hover: '#181824',
          active: '#212130'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(236, 72, 153, 0.45)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'pink-sm': '0 0 12px rgba(236, 72, 153, 0.25)',
        'pink-md': '0 0 24px rgba(236, 72, 153, 0.35)',
        'pink-lg': '0 0 45px rgba(236, 72, 153, 0.45)',
        'pink-neon': '0 0 20px rgba(255, 42, 133, 0.6), 0 0 60px rgba(236, 72, 153, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        'pink-gradient-glow': 'linear-gradient(135deg, #ff2a85 0%, #ec4899 50%, #8b5cf6 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0d0d12 0%, #070709 100%)',
        'radial-pink': 'radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
      }
    },
  },
  plugins: [],
}
