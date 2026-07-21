/** @type {import('tailwindcss').Config} */
module.exports = {
  // Isolate library utilities from consumer Tailwind (e.g. .flex vs .qbs-flex)
  prefix: 'qbs-',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{html,js,ts,tsx}'],
  // Keep rare/important utilities even if the scanner misses template-string edges
  safelist: [
    '!qbs-pl-[45px]',
    '!qbs-pt-[10px]',
    'qbs-min-w-[20px]',
    'qbs-min-w-[28px]',
    'qbs-min-h-[28px]',
    'qbs-h-[20px]',
    'qbs-h-[25px]',
    'qbs-h-[34px]',
    'qbs-pl-[10px]',
    'qbs-top-1.5',
    'qbs-p-0.5',
    'qbs-px-1.5',
    'qbs-px-2.5',
    'qbs-py-0.5',
    'qbs-py-1.5',
    'qbs-ps-3.5',
    'qbs-text-[10px]',
    'qbs-right-[1px]',
    'qbs-start-[14px]',
    'peer-focus:qbs-top-1.5',
    'rtl:peer-focus:qbs-translate-x-1/6',
    'rtl:peer-focus:qbs-translate-x-1/4',
    'rtl:peer-focus:qbs-left-auto',
  ],
  corePlugins: {
    preflight: false,
    // `container` becomes `.qbs-container` with our prefix and collided with
    // component class names used as non-Tailwind wrappers.
    container: false,
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
