import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import pagefind from 'astro-pagefind'
import sanity from '@sanity/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    pagefind(),
    sanity({
        projectId: 'sb0cunx0',
        dataset: 'production',
        useCdn: false, // for static builds
        studioBassePath: '/admin' 
    }),
  ],
  output: 'static',
})
