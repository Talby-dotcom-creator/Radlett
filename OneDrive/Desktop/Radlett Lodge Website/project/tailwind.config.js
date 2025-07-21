/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef1f6',
          100: '#d0d9e8',
          200: '#b1c1d9',
          300: '#92a9cb',
          400: '#7391bc',
          500: '#5479ae',
          600: '#14213D', // Primary navy blue
          700: '#0e1a30',
          800: '#091324',
          900: '#040b17',
        },
        secondary: {
          50: '#fff8e6',
          100: '#feeab0',
          200: '#fedb7a',
          300: '#fdcd44',
          400: '#fcc01d',
          500: '#FCA311', // Primary gold
          600: '#d68504',
          700: '#af6c03',
          800: '#895303',
          900: '#623b02',
        },
        neutral: {
          50: '#E5E5E5', // Primary cream
          100: '#d1d1d1',
          200: '#aeaeae',
          300: '#8b8b8b',
          400: '#686868',
          500: '#454545',
          600: '#373737',
          700: '#292929',
          800: '#1a1a1a',
          900: '#0d0d0d',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        sans: ['"Open Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};