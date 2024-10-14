/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [], // Ensure this includes all relevant paths
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{html,js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'blue-navy': '#001f3f',
        'table-hover': '#f8f8f8',
        'neutrals-grey-20': '#f4f4f4',
        slected_node: '#8dc1f0',
      },
    },
  },
  plugins: [],
};
