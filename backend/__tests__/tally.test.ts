import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTallyWebhook } from '../src/lib/webhook'

// Mock the Microsoft Graph Client
vi.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    init: vi.fn(() => ({
      api: vi.fn(() => ({
        post: vi.fn()
      }))
    }))
  }
}))

// Mock Azure Identity
vi.mock('@azure/identity', () => ({
  ClientSecretCredential: vi.fn()
}))

describe('Tally Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extract sh_ fields and create SharePoint item successfully', async () => {
    // Mock the payload
    const payload = {
      data: {
        fields: [
          { key: 'sh_name', value: 'John Doe' },
          { key: 'sh_age', value: 25 },
          { key: 'other_field', value: 'ignore' }
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
    const { Client } = await import('@microsoft/microsoft-graph-client')
    Client.init.mockReturnValue(mockClient)

    // Call the handler
    const result = await processTallyWebhook(payload, env)

    // Assertions
    expect(result.success).toBe(true)
    expect(result.message).toBe('Item created successfully')

    // Check SDK was initialized
    expect(Client.init).toHaveBeenCalledWith({
      authProvider: expect.any(Function)
    })

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
          { key: 'sh_test', value: 'value' }
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
    const { Client } = await import('@microsoft/microsoft-graph-client')
    Client.init.mockReturnValue(mockClient)

    const result = await processTallyWebhook(payload, env)

    expect(result.success).toBe(false)
    expect(result.message).toBe('SharePoint operation failed')
  })
})