// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
  tabWidth: 2,
  useTabs: false,
  bracketSameLine: true,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
