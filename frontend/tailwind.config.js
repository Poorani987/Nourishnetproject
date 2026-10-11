/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF7EE',
          50: '#FDFBF7',
          100: '#FBF7EE',
          200: '#F4ECE0',
        },
        forest: {
          DEFAULT: '#14532D',
          dark: '#0E3A20',
        },
        primaryGreen: {
          DEFAULT: '#217A43',
          hover: '#1B6437',
          light: '#2EA059',
        },
        softGreen: {
          DEFAULT: '#DDF0DA',
          light: '#EAF6E7',
        },
        orangeAccent: {
          DEFAULT: '#F58220',
          hover: '#E06F12',
          light: '#FDEDE2',
        },
        darkText: '#18352A',
        mutedText: '#77766F',
        lightBorder: '#E8E1D3',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(24, 53, 42, 0.06), 0 2px 6px -1px rgba(24, 53, 42, 0.04)',
        'card-hover': '0 10px 25px -3px rgba(24, 53, 42, 0.1), 0 4px 10px -2px rgba(24, 53, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
