import { defineConfig } from "astro-imagetools/config";

export default defineConfig({
    placeholder: "blurred",
    loading: "lazy",
    breakpoints: [640, 1024, 1280], //in tailwind sm, lg, xl
  });