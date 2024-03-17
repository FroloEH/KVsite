import { z, defineCollection } from 'astro:content';

const eventCollection = defineCollection({ 
    type: 'content',
    schema: z.object({
        nadpis : z.string(),
        datum: z.string(),
        miesto: z.string(),
        linkFbEvent: z.string().url(),
        instagram: z.string().url(),
        discord: z.string().url(),
        obrazok: z.string(),
        podnadpis: z.string(),
        anotacia: z.string()
    })
 });

export const collections = {
  'events': eventCollection,
};