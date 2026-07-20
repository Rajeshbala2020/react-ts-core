/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{html,js,ts,tsx}'],
  // Library CSS is injected into consumer apps; avoid Tailwind preflight/base reset.
  corePlugins: {
    preflight: false,
  },
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
