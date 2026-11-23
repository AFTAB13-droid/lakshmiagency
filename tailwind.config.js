/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#FAF2F7',
          100: '#F4E3EE',
          200: '#E9C7DD',
          300: '#D7A1C4',
          400: '#BD71A2',
          500: '#9E4781',
          600: '#6E104B',
          700: '#520D38',
          800: '#3D0728',
          900: '#260319',
        },
        lotus: {
          50: '#FFF0F7',
          100: '#FFE3F0',
          200: '#FFC7E2',
          300: '#FF9BCC',
          400: '#FF5EAE',
          500: '#E83A89',
          600: '#D41E6F',
          700: '#B00E56',
          800: '#8E0F46',
          900: '#75113C',
        },
        gold: {
          50: '#FDFBF4',
          100: '#FAF5E3',
          200: '#F5ECC5',
          300: '#EDDC9D',
          400: '#E3C86F',
          500: '#D4AF37',
          600: '#B89326',
          700: '#92701D',
          800: '#73571A',
          900: '#5C4517',
        },
        pearl: '#FFF8FA',
        cream: '#FFFDF9',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
