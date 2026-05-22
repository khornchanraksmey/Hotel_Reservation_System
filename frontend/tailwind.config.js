/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          50: '#e8eef5',
          100: '#c5d4e6',
          200: '#9eb8d5',
          300: '#769cc4',
          400: '#5886b8',
          500: '#3a70ab',
          600: '#2d5a8e',
          700: '#1e3a5f',
          800: '#142843',
          900: '#0a1628',
        },
        gold: {
          DEFAULT: '#c9a84c',
          50: '#fdf8ec',
          100: '#f9eec9',
          200: '#f4e0a0',
          300: '#edd175',
          400: '#e5c254',
          500: '#c9a84c',
          600: '#a8883c',
          700: '#85692d',
          800: '#624d1f',
          900: '#3f3113',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
