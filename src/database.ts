// Database connection and helpers for Moltimon TCG

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { Agent } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "..", "moltimon.db");
const schemaPath = join(__dirname, "..", "schema.sql");

// Initialize database connection
export const db: Database.Database = new Database(dbPath);

// Run schema on first load
export function initializeSchema(): void {
  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

/**
 * Get an existing agent or create a new one
 */
export function getOrCreateAgent(agentId: string, name: string): Agent {
  const existing = db.prepare("SELECT * FROM agents WHERE id = ?").get(agentId) as Agent | undefined;
  if (existing) return existing;

  db.prepare(
    "INSERT INTO agents (id, name) VALUES (?, ?)"
  ).run(agentId, name);

  db.prepare(
    "INSERT INTO agent_stats (agent_id) VALUES (?)"
  ).run(agentId);

  return db.prepare("SELECT * FROM agents WHERE id = ?").get(agentId) as Agent;
}

/**
 * Check if an agent exists, create if not
 */
export function ensureAgentExists(agentId: string, name: string): void {
  getOrCreateAgent(agentId, name);
}
