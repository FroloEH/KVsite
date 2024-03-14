/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["fixel", ...defaultTheme.fontFamily.sans],
      display: ["texturina", ...defaultTheme.fontFamily.serif],
    },
    extend: {
		borderRadius: {
			'drawn' : '255px 15px 225px 15px/15px 225px 15px 255px'
		}
	},
  },
  plugins: [],
};
