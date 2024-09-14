import { z, defineCollection } from 'astro:content'

const eventCollection = defineCollection({
  type: 'content',
  schema: z.object({
    nadpis: z.string(),
    datum: z.string(),
    miesto: z.string(),
    linkFbEvent: z.string().url(),
    instagram: z.string().url(),
    discord: z.string().url(),
    obrazok: z.string(),
    podnadpis: z.string(),
    anotacia: z.string(),
  }),
})

const partnersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    logo: z.string(),
    link: z.string().url(),
  }),
})

const teamCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    image: z.string(),
    role: z.string(),
  }),
})

const storyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    image: z.string(),
    story: z.string(),
    event: z.string(),
  }),
})

export const collections = {
  events: eventCollection,
  partners: partnersCollection,
  team: teamCollection,
  stories: storyCollection,
}
