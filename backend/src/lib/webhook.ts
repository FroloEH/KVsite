import { z } from 'zod'

const FieldSchema = z.object({
  key: z.string(),
  value: z.any()
})

const WebhookPayloadSchema = z.object({
  data: z.object({
    fields: z.array(FieldSchema)
  })
})

interface Env {
  SHAREPOINT_TENANT: string
  SHAREPOINT_CLIENT_ID: string
  SHAREPOINT_CLIENT_SECRET: string
  SHAREPOINT_SITE_NAME: string
  SHAREPOINT_LIST_NAME: string
}

export async function processTallyWebhook(payload: unknown, env: Env): Promise<{ success: boolean; message: string }> {
  // Validate payload
  const validation = WebhookPayloadSchema.safeParse(payload)
  if (!validation.success) {
    return { success: false, message: 'Invalid payload structure' }
  }

  const { data } = validation.data

  const sharepointFields: Record<string, any> = {}
  for (const field of data.fields) {
    if (field.key.startsWith('sh_')) {
      const key = field.key.slice(3)
      sharepointFields[key] = field.value
    }
  }

  // Get access token
  const tokenUrl = `https://login.microsoftonline.com/${env.SHAREPOINT_TENANT}/oauth2/v2.0/token`
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHAREPOINT_CLIENT_ID,
      client_secret: env.SHAREPOINT_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default'
    })
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('Token request failed:', tokenResponse.status, errorText)
    return { success: false, message: 'Authentication failed' }
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  // Create SharePoint item
  const listName = encodeURIComponent(env.SHAREPOINT_LIST_NAME)
  const sharepointUrl = `https://graph.microsoft.com/v1.0/sites/root:/sites/${env.SHAREPOINT_SITE_NAME}:/lists/${listName}/items`
  const sharepointResponse = await fetch(sharepointUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: sharepointFields
    })
  })

  if (!sharepointResponse.ok) {
    const errorText = await sharepointResponse.text()
    console.error('SharePoint request failed:', sharepointResponse.status, errorText)
    return { success: false, message: 'SharePoint operation failed' }
  }

  return { success: true, message: 'Item created successfully' }
}