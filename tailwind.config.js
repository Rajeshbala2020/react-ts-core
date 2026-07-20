/** @type {import('tailwindcss').Config} */
module.exports = {
  // Isolate library utilities from consumer Tailwind (e.g. .flex vs .qbs-flex)
  prefix: 'qbs-',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{html,js,ts,tsx}'],
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
