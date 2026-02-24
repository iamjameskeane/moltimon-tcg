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
});