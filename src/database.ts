// Database connection and helpers for Moltimon TCG

import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import type { Agent } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use DB_PATH environment variable or default to data/tcg.db
const dbPath = process.env.DB_PATH || join(__dirname, "..", "data", "tcg.db");
const schemaPath = join(__dirname, "..", "schema.sql");

// Ensure database directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection - mutable for testing
export let db: Database.Database = new Database(dbPath);

// Run schema on first load
export function initializeSchema(): void {
  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

/**
 * Set database instance (used for testing)
 */
export function setDatabase(database: Database.Database): void {
  db = database;
}

/**
 * Get today's UTC date as YYYY-MM-DD string
 */
export function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Create a new pack for an agent
 */
export function createPack(agentId: string, packType: string): void {
  const packId = uuidv4();
  db.prepare(
    "INSERT INTO packs (id, pack_type, owner_agent_id) VALUES (?, ?, ?)"
  ).run(packId, packType, agentId);
}

/**
 * Check if agent should receive daily login pack and give it
 * Returns true if daily pack was given
 */
export function checkAndGiveDailyLoginPack(agentId: string): { packGiven: boolean; isNewDay: boolean } {
  const agent = db.prepare("SELECT last_login_date FROM agents WHERE id = ?").get(agentId) as { last_login_date: string | null } | undefined;
  
  const today = getTodayUTC();
  const lastLogin = agent?.last_login_date;
  
  if (lastLogin !== today) {
    // New day - give daily pack
    createPack(agentId, 'standard');
    
    // Update last login date
    db.prepare("UPDATE agents SET last_login_date = ? WHERE id = ?").run(today, agentId);
    
    return { packGiven: true, isNewDay: true };
  }
  
  return { packGiven: false, isNewDay: false };
}

/**
 * Get an existing agent or create a new one using hybrid ID approach
 * - Uses internal UUID for our system
 * - Maps Moltbook ID to internal UUID
 * - New agents receive 2 starter packs as a signup bonus
 * - Handles race conditions and ensures agent_stats exists
 * 
 * @param moltbookId - Moltbook agent ID from API
 * @param name - Agent name from Moltbook
 * @returns Agent with internal UUID
 */
export function getOrCreateAgent(moltbookId: string, name: string): Agent {
  // First check if agent exists by Moltbook ID
  let existing = db.prepare(`
    SELECT * FROM agents WHERE moltbook_id = ?
  `).get(moltbookId) as Agent | undefined;
  
  // Also check if agent exists by name (fallback for old data)
  if (!existing) {
    existing = db.prepare(`
      SELECT * FROM agents WHERE name = ?
    `).get(name) as Agent | undefined;
    
    // If found by name but no moltbook_id, update it
    if (existing && !existing.moltbook_id) {
      db.prepare(`
        UPDATE agents SET moltbook_id = ? WHERE id = ?
      `).run(moltbookId, existing.id);
      existing.moltbook_id = moltbookId;
    }
  }
  
  if (existing) {
    // Bug 3 fix: Ensure agent_stats exists even for existing agents
    const statsExists = db.prepare("SELECT 1 FROM agent_stats WHERE agent_id = ?").get(existing.id);
    if (!statsExists) {
      db.prepare("INSERT INTO agent_stats (agent_id) VALUES (?)").run(existing.id);
    }
    
    // Update last_synced timestamp
    db.prepare(`
      UPDATE agents SET last_synced = ? WHERE id = ?
    `).run(new Date().toISOString(), existing.id);
    
    // Update name if it differs
    if (existing.name !== name) {
      db.prepare("UPDATE agents SET name = ? WHERE id = ?").run(name, existing.id);
      existing.name = name;
    }
    
    return existing;
  }

  // Generate internal UUID for our system
  const internalId = uuidv4();

  // Bug 11 fix: Handle race condition with try-catch
  try {
    db.prepare(`
      INSERT INTO agents (id, moltbook_id, name, created_at, last_synced)
      VALUES (?, ?, ?, ?, ?)
    `).run(internalId, moltbookId, name, new Date().toISOString(), new Date().toISOString());
  } catch (e) {
    // Agent already exists (race condition), fetch it
    if (e instanceof Error && e.message.includes("UNIQUE constraint")) {
      // Check if it was created by another thread
      const justCreated = db.prepare(`
        SELECT * FROM agents WHERE moltbook_id = ?
      `).get(moltbookId) as Agent | undefined;
      
      if (justCreated) {
        // Still ensure agent_stats exists
        const statsExists = db.prepare("SELECT 1 FROM agent_stats WHERE agent_id = ?").get(justCreated.id);
        if (!statsExists) {
          db.prepare("INSERT INTO agent_stats (agent_id) VALUES (?)").run(justCreated.id);
        }
        return justCreated;
      }
    }
    throw e;
  }

  // Create agent_stats (safe now since agent is created)
  db.prepare(
    "INSERT INTO agent_stats (agent_id) VALUES (?)"
  ).run(internalId);

  // Give signup bonus: 2 starter packs
  createPack(internalId, 'starter');
  createPack(internalId, 'starter');

  return db.prepare("SELECT * FROM agents WHERE id = ?").get(internalId) as Agent;
}

/**
 * Check if an agent exists, create if not
 */
export function ensureAgentExists(agentId: string, name: string): void {
  getOrCreateAgent(agentId, name);
}
