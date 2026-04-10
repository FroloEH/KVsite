import type { APIRoute } from 'astro'
import { processTallyWebhook, verifyTallySignature } from '../../lib/webhook'

export const POST = (async ({ request }) => {
  try {
    const rawBody = await request.text()

    if (import.meta.env.MODE !== 'development') {
      const valid = await verifyTallySignature(
        rawBody,
        import.meta.env.TALLY_SIGNING_SECRET ?? '',
        request.headers.get('tally-signature')
      )
      if (!valid) {
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const result = await processTallyWebhook(payload, {
      SHAREPOINT_TENANT: import.meta.env.SHAREPOINT_TENANT,
      SHAREPOINT_CLIENT_ID: import.meta.env.SHAREPOINT_CLIENT_ID,
      SHAREPOINT_CLIENT_SECRET: import.meta.env.SHAREPOINT_CLIENT_SECRET,
      SHAREPOINT_SITE_ID: import.meta.env.SHAREPOINT_SITE_ID,
      SHAREPOINT_LIST_ID: import.meta.env.SHAREPOINT_GROUP_LIST_ID
    })

    if (result.success) {
      return new Response(result.message, { status: 200 })
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === 'Invalid payload structure') {
      return new Response('Invalid payload structure', { status: 400 })
    }
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}) satisfies APIRoute
