/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        teal: {
          50: '#e8f5f3',
          100: '#d0ede9',
          200: '#a3dbd3',
          300: '#72c8bc',
          400: '#45b5a5',
          500: '#22a99a',
          600: '#1a7a6e',
          700: '#145f55',
          800: '#0e4840',
          900: '#083028',
        },
        gold: {
          50: '#fef9ec',
          100: '#fef3d3',
          200: '#fde5a0',
          300: '#fbd263',
          400: '#f5a623',
          500: '#f0921a',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
};
