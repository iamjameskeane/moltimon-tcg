// Authentication utilities for Moltimon TCG
// Verifies Moltbook API keys by calling the Moltbook API

import { db } from '../database.js';
import crypto from 'crypto';

const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || 'https://www.moltbook.com/api/v1';
const MOLTBOOK_API_VERSION = 'v1';

export interface MoltbookAgent {
  id: string;                // Internal UUID from our database
  moltbook_id?: string;      // Moltbook's agent ID (external)
  name: string;
  api_key: string;
  created_at: string;
  stats?: {
    posts: number;
    followers: number;
    karma: number;
  };
}

export interface AuthResult {
  success: boolean;
  agent?: MoltbookAgent;
  error?: string;
}

/**
 * Verify a Moltbook API key by calling the Moltbook API
 * @param apiKey The Moltbook API key to verify
 * @returns AuthResult with agent info if successful
 */
export async function verifyMoltbookApiKey(apiKey: string): Promise<AuthResult> {
  if (!apiKey) {
    return {
      success: false,
      error: 'Missing moltbook_api_key. Please provide your Moltbook API key.',
    };
  }

  // TEST MODE: Bypass auth for development
  // Set NODE_ENV=development and use "test_key" as API key
  const isTestMode = process.env.NODE_ENV === 'development' && 
                     (apiKey === 'test_key' || apiKey.startsWith('test_'));
  
  if (isTestMode) {
    // Import database to create agent
    const { getOrCreateAgent } = await import('../database.js');
    
    // In test mode, use the API key (minus 'test_' prefix) as Moltbook ID
    // This allows different test users to have different IDs
    // If no prefix provided, generate unique ID based on timestamp
    let testMoltbookId = apiKey.replace('test_', '');
    if (!testMoltbookId || testMoltbookId === apiKey) {
      testMoltbookId = `test_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    // Convert test ID to readable name (capitalize first letter)
    const testAgentName = testMoltbookId.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Create or get the test agent (will generate internal UUID)
    const agentRecord = getOrCreateAgent(testMoltbookId, testAgentName);
    
    return {
      success: true,
      agent: {
        id: agentRecord.id,              // Internal UUID
        moltbook_id: agentRecord.moltbook_id,  // Moltbook ID (test_*)
        name: agentRecord.name,
        api_key: apiKey,
        created_at: agentRecord.created_at || new Date().toISOString(),
        stats: {
          posts: agentRecord.post_count || 0,
          followers: agentRecord.follower_count || 0,
          karma: agentRecord.karma || 0,
        },
      },
    };
  }

  try {
    const baseUrl = MOLTBOOK_API_URL.endsWith(`/${MOLTBOOK_API_VERSION}`) 
      ? MOLTBOOK_API_URL 
      : `${MOLTBOOK_API_URL}/${MOLTBOOK_API_VERSION}`;
    const response = await fetch(`${baseUrl}/agents/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return {
        success: false,
        error: 'Invalid Moltbook API key. Please check your API key.',
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Moltbook API error: ${response.status} - ${errorText}`,
      };
    }

    const moltbookAgent = await response.json() as { id: string; name: string; stats?: { posts: number; followers: number; karma: number } };
    
    // Import database to create/get agent with internal UUID
    const { getOrCreateAgent } = await import('../database.js');
    
    // Create or get the agent using Moltbook's ID as the moltbook_id
    // This will generate an internal UUID for our system
    const agentRecord = getOrCreateAgent(moltbookAgent.id, moltbookAgent.name);
    
    // Update the stats if available
    if (moltbookAgent.stats) {
      db.prepare(`
        UPDATE agent_stats 
        SET karma = ?, follower_count = ?, post_count = ?
        WHERE agent_id = ?
      `).run(
        moltbookAgent.stats.karma || 0,
        moltbookAgent.stats.followers || 0,
        moltbookAgent.stats.posts || 0,
        agentRecord.id
      );
    }
    
    return {
      success: true,
      agent: {
        id: agentRecord.id,              // Internal UUID
        moltbook_id: agentRecord.moltbook_id,  // Moltbook's ID
        name: agentRecord.name,
        api_key: apiKey,
        created_at: agentRecord.created_at || new Date().toISOString(),
        stats: {
          posts: agentRecord.post_count || 0,
          followers: agentRecord.follower_count || 0,
          karma: agentRecord.karma || 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to verify API key: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Extract API key from tool arguments
 * @param args Tool arguments
 * @returns The API key or undefined
 */
export function extractApiKey(args: Record<string, any>): string | undefined {
  return args.moltbook_api_key || args.api_key;
}

/**
 * Create an error response for authentication failures
 * @param error Error message
 * @returns MCP tool response
 */
export function createAuthError(error: string) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: false,
        error,
      }, null, 2),
    }],
    isError: true,
  };
}

/**
 * Generate a new admin key
 * @param name Key name (e.g., "super_admin")
 * @returns The generated admin key (raw, not hashed)
 */
export function generateAdminKey(name: string): { key: string; keyHash: string } {
  const key = crypto.randomBytes(32).toString('hex');
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  
  // Store the hash in database
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO admin_keys (id, key_hash, name)
    VALUES (?, ?, ?)
  `).run(id, keyHash, name);
  
  return { key, keyHash };
}

/**
 * Verify an admin key
 * @param key The admin key to verify
 * @returns { isValid: boolean, name?: string }
 */
export function verifyAdminKey(key: string): { isValid: boolean; name?: string } {
  if (!key) {
    return { isValid: false };
  }
  
  // Hash the provided key
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  
  // Check if hash exists in database and is active
  const result = db.prepare(`
    SELECT name FROM admin_keys 
    WHERE key_hash = ? AND is_active = 1
  `).get(keyHash) as { name: string } | undefined;
  
  if (!result) {
    return { isValid: false };
  }
  
  return { isValid: true, name: result.name };
}

/**
 * Check if agent is banned
 * @param agentId Agent's internal UUID
 * @returns { isBanned: boolean }
 */
export function isAgentBanned(agentId: string): { isBanned: boolean } {
  const result = db.prepare(`
    SELECT is_banned FROM agents WHERE id = ?
  `).get(agentId) as { is_banned: number } | undefined;
  
  if (!result) {
    return { isBanned: false };
  }
  
  return { isBanned: result.is_banned === 1 };
}
