import plugin from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      sans: ['fixel', ...defaultTheme.fontFamily.sans],
      display: ['inknut', ...defaultTheme.fontFamily.serif],
      large: ['maitree', ...defaultTheme.fontFamily.serif],
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
