import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTallyWebhook } from '../src/lib/webhook'

// Mock the Microsoft Graph Client
vi.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    initWithMiddleware: vi.fn()
  }
}))

// Mock auth provider module used by webhook.ts
vi.mock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js', () => ({
  TokenCredentialAuthenticationProvider: vi.fn()
}))

// Mock Azure Identity
vi.mock('@azure/identity', () => ({
  ClientSecretCredential: vi.fn()
}))

import { Client } from '@microsoft/microsoft-graph-client'

describe('Tally Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extract sh_ fields and create SharePoint item successfully', async () => {
    // Mock the payload
    const payload = {
      data: {
        fields: [
          { label: 'sh_name', value: 'John Doe' },
          { label: 'sh_age', value: 25 },
          { label: 'other_field', value: 'ignore' }
        ]
      }
    }

    const env = {
      SHAREPOINT_TENANT: 'test-tenant',
      SHAREPOINT_CLIENT_ID: 'test-client-id',
      SHAREPOINT_CLIENT_SECRET: 'test-secret',
      SHAREPOINT_SITE_ID: 'test-site-id',
      SHAREPOINT_LIST_ID: 'test-list-id'
    }

    // Mock successful SDK call
    const mockPost = vi.fn().mockResolvedValue({ id: 'new-item-id' })
    const mockApi = vi.fn().mockReturnValue({ post: mockPost })
    const mockClient = { api: mockApi }
    ;(Client.initWithMiddleware as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)

    // Call the handler
    const result = await processTallyWebhook(payload, env)

    // Assertions
    expect(result.success).toBe(true)
    expect(result.message).toBe('Item created successfully')

    // Check SDK was initialized
    expect(Client.initWithMiddleware).toHaveBeenCalledWith(expect.objectContaining({
      authProvider: expect.any(Object)
    }))

    // Check API call
    expect(mockApi).toHaveBeenCalledWith('/sites/test-site-id/lists/test-list-id/items')
    expect(mockPost).toHaveBeenCalledWith({
      fields: {
        name: 'John Doe',
        age: 25
      }
    })
  })

  it('should return failure for invalid payload', async () => {
    const payload = { invalid: 'payload' }
    const env = {} as any

    const result = await processTallyWebhook(payload, env)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Invalid payload structure')
  })

  it('should return failure for SDK operation failure', async () => {
    const payload = {
      data: {
        fields: [
          { label: 'sh_test', value: 'value' }
        ]
      }
    }
    const env = {
      SHAREPOINT_TENANT: 'test-tenant',
      SHAREPOINT_CLIENT_ID: 'test-client-id',
      SHAREPOINT_CLIENT_SECRET: 'test-secret',
      SHAREPOINT_SITE_ID: 'test-site-id',
      SHAREPOINT_LIST_ID: 'test-list-id'
    }

    // Mock SDK failure
    const mockPost = vi.fn().mockRejectedValue(new Error('SDK error'))
    const mockApi = vi.fn().mockReturnValue({ post: mockPost })
    const mockClient = { api: mockApi }
    ;(Client.initWithMiddleware as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)

    const result = await processTallyWebhook(payload, env)

    expect(result.success).toBe(false)
    expect(result.message).toBe('SharePoint operation failed')
  })

  it('should handle special characters in field values', async () => {
    // Mock the payload with special characters in values
    const payload = {
      data: {
        fields: [
          { label: 'sh_name', value: 'Jozko Mrkvička' },
          { label: 'sh_description', value: 'Niečo špeciálne' }
        ]
      }
    }

    const env = {
      SHAREPOINT_TENANT: 'test-tenant',
      SHAREPOINT_CLIENT_ID: 'test-client-id',
      SHAREPOINT_CLIENT_SECRET: 'test-secret',
      SHAREPOINT_SITE_ID: 'test-site-id',
      SHAREPOINT_LIST_ID: 'test-list-id'
    }

    // Mock successful SDK call
    const mockPost = vi.fn().mockResolvedValue({ id: 'new-item-id' })
    const mockApi = vi.fn().mockReturnValue({ post: mockPost })
    const mockClient = { api: mockApi }
    ;(Client.initWithMiddleware as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)

    // Call the handler
    const result = await processTallyWebhook(payload, env)

    // Assertions
    expect(result.success).toBe(true)
    expect(result.message).toBe('Item created successfully')

    // Check API call
    expect(mockApi).toHaveBeenCalledWith('/sites/test-site-id/lists/test-list-id/items')
    expect(mockPost).toHaveBeenCalledWith({
      fields: {
        name: 'Jozko Mrkvička',
        description: 'Niečo špeciálne'
      }
    })
  })

  it('should handle special characters in field labels', async () => {
    // Mock the payload with special characters in labels
    const payload = {
      data: {
        fields: [
          { label: 'sh_meňo', value: 'Jozko' },
          { label: 'sh_priežvisko', value: 'Mrkvička' }
        ]
      }
    }

    const env = {
      SHAREPOINT_TENANT: 'test-tenant',
      SHAREPOINT_CLIENT_ID: 'test-client-id',
      SHAREPOINT_CLIENT_SECRET: 'test-secret',
      SHAREPOINT_SITE_ID: 'test-site-id',
      SHAREPOINT_LIST_ID: 'test-list-id'
    }

    // Mock successful SDK call
    const mockPost = vi.fn().mockResolvedValue({ id: 'new-item-id' })
    const mockApi = vi.fn().mockReturnValue({ post: mockPost })
    const mockClient = { api: mockApi }
    ;(Client.initWithMiddleware as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)
    ;(Client.initWithMiddleware as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)

    // Call the handler
    const result = await processTallyWebhook(payload, env)

    // Assertions
    expect(result.success).toBe(true)
    expect(result.message).toBe('Item created successfully')

    // Check API call
    expect(mockApi).toHaveBeenCalledWith('/sites/test-site-id/lists/test-list-id/items')
    expect(mockPost).toHaveBeenCalledWith({
      fields: {
        meňo: 'Jozko',
        priežvisko: 'Mrkvička'
      }
    })
  })
})