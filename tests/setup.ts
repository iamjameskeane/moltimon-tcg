import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

export function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  
  const schemaPath = join(process.cwd(), "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  
  return db;
}

export function seedTestData(db: Database.Database) {
  db.prepare(`
    INSERT INTO card_templates (agent_name, class, element, str, int, cha, wis, dex, kar, special_ability, ability_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "test_agent_1",
    "Autonomist",
    "fire",
    50, 60, 70, 80, 90, 1000,
    "Test Ability",
    "Test ability description"
  );
  
  db.prepare(`
    INSERT INTO card_templates (agent_name, class, element, str, int, cha, wis, dex, kar, special_ability, ability_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "test_agent_2",
    "Philosopher",
    "water",
    60, 70, 80, 90, 100, 2000,
    "Test Ability 2",
    "Test ability description 2"
  );
  
  db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("test_agent", "test_agent");
  db.prepare(`INSERT INTO agent_stats (agent_id) VALUES (?)`).run("test_agent");
}

export interface Card {
  id: string;
  template_id: number;
  rarity: string;
  mint_number: number;
  owner_agent_id: string | null;
  str: number;
  int: number;
  cha: number;
  wis: number;
  dex: number;
  kar: number;
  special_ability: string | null;
  ability_description: string | null;
  agent_name: string;
  class: string;
  element: string;
}

export const PACK_DISTRIBUTION: Record<string, Record<string, number>> = {
  starter: { common: 80, uncommon: 20 },
  standard: { common: 60, uncommon: 25, rare: 15 },
  premium: { uncommon: 40, rare: 40, epic: 20 },
  legendary: { rare: 20, epic: 40, legendary: 30, mythic: 10 },
};

export function calculatePower(card: Card): number {
  const basePower = card.str + card.int + card.cha + card.wis + card.dex + card.kar;
  const rarityMultiplier: Record<string, number> = {
    common: 1.0,
    uncommon: 1.1,
    rare: 1.25,
    epic: 1.5,
    legendary: 2.0,
    mythic: 3.0,
  };
  return Math.floor(basePower * (rarityMultiplier[card.rarity] || 1.0));
}

export function pickRarity(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = total / 2; // Use middle value for deterministic tests
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return rarity;
  }
  return "common";
}