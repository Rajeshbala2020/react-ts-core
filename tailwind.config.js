/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'blue-navy': '#001f3f',
        'table-hover': '#f8f8f8',
        'neutrals-grey-20': '#f4f4f4',
      },
    },
  },
  plugins: [],
};
