import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  getAccessToken: defineAction({
    input: z.string(),
    handler: async (code) => {
      const params = {
        "client_id" : import.meta.env.CLIENT_ID,
        "client_secret" : import.meta.env.CLIENT_SECRET,
        "code" : code
      }
      const result = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if(result.status === 200){
        const formData = await result.formData();
        const token = formData.get('access_token')?.toString();
        console.log(`authorization:github:"success":${JSON.stringify({ token })}`);
        return token;
      }
      else {
        console.error(result);
      }
    }
   })
}