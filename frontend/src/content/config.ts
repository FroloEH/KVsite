import { z, defineCollection } from 'astro:content'

const eventCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    place: z.string(),
    linkFbEvent: z.string().url(),
    image: z.string(),
    subTitle: z.string(),
    annotation: z.string(),
    archived: z.boolean(),
    storyIntroText: z.string(),
    storyImage: z.string(),
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

const announcementCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    text: z.string(),
    link: z.string().url(),
    link_text: z.string(),
    active: z.boolean(),
  }),
})

export const collections = {
  events: eventCollection,
  partners: partnersCollection,
  team: teamCollection,
  player_stories: storyCollection,
  gallery: galleryCollection,
  announcements: announcementCollection,
}
