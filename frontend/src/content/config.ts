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
    archived: z.boolean(),
    story1Title: z.string(),
    story1Text: z.string(),
    story2Title: z.string(),
    story2Text: z.string(),
    story3Title: z.string(),
    story3Text: z.string(),
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

const galleryCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    images: z.array(z.object({
      image: z.string(),
    })),
  }),
})

export const collections = {
  events: eventCollection,
  partners: partnersCollection,
  team: teamCollection,
  player_stories: storyCollection,
  gallery: galleryCollection,
}
