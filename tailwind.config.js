/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: '#E0F2FE',
          'blue-hover': '#BAE6FD',
          red: '#FFE0E0',
          'red-hover': '#FFB8B8',
        },
      },
    },
  },
  plugins: [],
}
