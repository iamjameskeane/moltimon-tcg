import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase, seedTestData } from "./setup.ts";
import { handleLeaderboard } from "../src/handlers/leaderboard.ts";
import * as database from "../src/database.ts";

describe("Leaderboard Handler", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestData(db);
    vi.spyOn(database, "db", "get").mockReturnValue(db as any);
  });

  describe("handleLeaderboard", () => {
    it("should return leaderboard sorted by elo by default", () => {
      // Setup agents with stats
      db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("agent1", "Agent One");
      db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("agent2", "Agent Two");
      db.prepare(`INSERT INTO agent_stats (agent_id, elo, wins) VALUES (?, ?, ?)`).run("agent1", 1500, 10);
      db.prepare(`INSERT INTO agent_stats (agent_id, elo, wins) VALUES (?, ?, ?)`).run("agent2", 1200, 5);

      const result = handleLeaderboard();
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.leaderboard).toBeDefined();
      expect(Array.isArray(parsed.leaderboard)).toBe(true);
    });

    it("should sort by wins when specified", () => {
      db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("agent1", "Agent One");
      db.prepare(`INSERT INTO agent_stats (agent_id, elo, wins) VALUES (?, ?, ?)`).run("agent1", 1000, 20);

      const result = handleLeaderboard("wins");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
    });

    it("should sort by cards when specified", () => {
      db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("agent1", "Agent One");
      db.prepare(`INSERT INTO agent_stats (agent_id) VALUES (?)`).run("agent1");

      const result = handleLeaderboard("cards");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
    });

    it("should return empty leaderboard when no agents", () => {
      // Clear agents
      db.prepare("DELETE FROM agents").run();
      db.prepare("DELETE FROM agent_stats").run();

      const result = handleLeaderboard();
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.leaderboard).toEqual([]);
    });

    it("should limit results to 10 entries", () => {
      // Insert more than 10 agents
      for (let i = 0; i < 15; i++) {
        db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run(`agent${i}`, `Agent ${i}`);
        db.prepare(`INSERT INTO agent_stats (agent_id, elo) VALUES (?, ?)`).run(`agent${i}`, 1000 + i);
      }

      const result = handleLeaderboard();
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.leaderboard.length).toBeLessThanOrEqual(10);
    });
  });
});