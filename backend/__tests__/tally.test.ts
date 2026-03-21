import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTallyWebhook } from '../src/lib/webhook'

// Mock fetch globally
global.fetch = vi.fn()

describe('Tally Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extract sh_ fields, get access token, and create SharePoint item', async () => {
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
      SHAREPOINT_SITE_NAME: 'test-site',
      SHAREPOINT_LIST_NAME: 'test-list'
    }

    // Mock token response
    const mockTokenResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ access_token: 'mock-token' })
    }

    // Mock SharePoint response
    const mockSharePointResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'new-item-id' })
    }

    // Mock fetch calls
    global.fetch
      .mockResolvedValueOnce(mockTokenResponse) // Token request
      .mockResolvedValueOnce(mockSharePointResponse) // SharePoint request

    // Call the handler
    const result = await processTallyWebhook(payload, env)

    // Assertions
    expect(result.success).toBe(true)
    expect(result.message).toBe('Item created successfully')

    // Check token request
    expect(global.fetch).toHaveBeenCalledWith(
      'https://login.microsoftonline.com/test-tenant/oauth2/v2.0/token',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    )

    // Check SharePoint request
    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.microsoft.com/v1.0/sites/root:/sites/test-site:/lists/test-list/items',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          fields: {
            name: 'John Doe',
            age: 25
          }
        })
      })
    )
  })

  it('should return failure for invalid payload', async () => {
    const payload = { invalid: 'payload' }
    const env = {} as any

    const result = await processTallyWebhook(payload, env)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Invalid payload structure')
  })

  it('should return failure for auth failure', async () => {
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
      SHAREPOINT_SITE_NAME: 'test-site',
      SHAREPOINT_LIST_NAME: 'test-list'
    }

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('Auth error')
    })

    const result = await processTallyWebhook(payload, env)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Authentication failed')
  })
})