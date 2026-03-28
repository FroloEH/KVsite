import { z } from 'zod'
import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';


const FieldSchema = z.object({
  label: z.string().nullable(),
  value: z.any()
})

const WebhookPayloadSchema = z.object({
  data: z.object({
    fields: z.array(FieldSchema)
  })
})

function encodeSharePointFieldName(fieldName: string): string {
  var encodedName = fieldName.replace(/[^A-Za-z0-9_]/g, (char) => {
    const codePoint = char.charCodeAt(0).toString(16).padStart(4, '0')
    return `_x${codePoint}_`
  })

  return encodedName.slice(0, 32)
}

interface Env {
  SHAREPOINT_TENANT: string
  SHAREPOINT_CLIENT_ID: string
  SHAREPOINT_CLIENT_SECRET: string
  SHAREPOINT_SITE_ID: string
  SHAREPOINT_LIST_ID: string
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
    if (typeof field.label === 'string' && field.label.startsWith('sh_')) {
      const label = field.label.slice(3)
      sharepointFields[encodeSharePointFieldName(label)] = field.value
    }
  }

  try {
    // Initialize Azure Identity credential
    const credential = new ClientSecretCredential(
      env.SHAREPOINT_TENANT,
      env.SHAREPOINT_CLIENT_ID,
      env.SHAREPOINT_CLIENT_SECRET
    )

    const authProvider = new TokenCredentialAuthenticationProvider(
      credential,
      {
        scopes: ['https://graph.microsoft.com/.default'],
      },
    );

    const client = Client.initWithMiddleware({ authProvider })

    // Create SharePoint list item using SDK
    const apiEndpoint = `/sites/${env.SHAREPOINT_SITE_ID}/lists/${env.SHAREPOINT_LIST_ID}/items`
    
    const listItem = {
      fields: sharepointFields
    }
    await client.api(apiEndpoint).post(listItem)

    return { success: true, message: 'Item created successfully'}
    
  } catch (error) {
    const err = error as any
    console.error('Webhook processing error:', err.message)
    if (err.statusCode) {
      console.error('HTTP Status:', err.statusCode)
    }
    if (err.body) {
      console.error('Error body:', err.body)
    }
    if (err.code) {
      console.error('Error code:', err.code)
    }
    if (err.responseHeaders) {
      console.error('Response headers:', Object.fromEntries(err.responseHeaders.entries?.() || []))
    }
    console.error('Full error:', error)
    return { success: false, message: 'SharePoint operation failed' }
  }
}