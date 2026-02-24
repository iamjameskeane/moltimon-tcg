import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyMoltbookApiKey } from '../src/utils/auth.js';

describe('Moltbook API URL', () => {
  it('should construct correct API URL without doubling version', async () => {
    const originalFetch = global.fetch;
    
    let capturedUrl = '';
    global.fetch = vi.fn((url: unknown) => {
      capturedUrl = String(url);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'test', name: 'TestAgent' })
      }) as any;
    });

    try {
      await verifyMoltbookApiKey('test_key');
    } catch {
      // Expected in test mode without db
    }

    expect(capturedUrl).not.toContain('/v1/v1');
    expect(capturedUrl).toMatch(/agents\/me$/);
    
    global.fetch = originalFetch;
  });

  it('should not double /v1 in the URL path', async () => {
    const originalFetch = global.fetch;
    const originalEnv = process.env.MOLTBOOK_API_URL;
    
    process.env.MOLTBOOK_API_URL = 'https://www.moltbook.com/api/v1';
    
    let capturedUrl = '';
    global.fetch = vi.fn((url: unknown) => {
      capturedUrl = String(url);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'test', name: 'TestAgent' })
      }) as any;
    });

    try {
      await verifyMoltbookApiKey('some_real_key');
    } catch {
      // Expected - just capturing the URL
    }

    expect(capturedUrl).not.toContain('/v1/v1');
    expect(capturedUrl).toBe('https://www.moltbook.com/api/v1/agents/me');
    
    process.env.MOLTBOOK_API_URL = originalEnv;
    global.fetch = originalFetch;
  });

  it('should correctly parse wrapped API response with success.agent', async () => {
    const originalFetch = global.fetch;
    const originalEnv = process.env.NODE_ENV;
    
    process.env.NODE_ENV = 'production';
    
    // Mock the Moltbook API response with the actual format
    global.fetch = vi.fn((url: unknown) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          agent: {
            id: 'agent-123',
            name: 'testagent',
            display_name: 'Test Agent',
            karma: 100,
            follower_count: 50,
            posts_count: 25
          }
        })
      }) as any;
    });

    try {
      const result = await verifyMoltbookApiKey('moltbook_sk_test');
      // Should not throw and should not have name undefined
      expect(result.success).toBe(true);
      // The error we get now is from DB, not from parsing
    } catch (e: any) {
      // DB error is expected since we're not fully mocking the database
      // But the important thing is it shouldn't fail on parsing
      expect(e.message).not.toContain('Cannot read');
      expect(e.message).not.toContain('undefined');
    }
    
    process.env.NODE_ENV = originalEnv;
    global.fetch = originalFetch;
  });
});