import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase } from "./setup.ts";
import { getOrCreateAgent, ensureAgentExists } from "../src/database.ts";
import * as database from "../src/database.ts";

describe("Database Module", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    vi.spyOn(database, "db", "get").mockReturnValue(db as any);
  });

  describe("getOrCreateAgent", () => {
    it("should return existing agent", () => {
      // Create agent first
      db.prepare("INSERT INTO agents (id, name) VALUES (?, ?)").run("existing", "Existing Agent");
      db.prepare("INSERT INTO agent_stats (agent_id) VALUES (?)").run("existing");

      const result = getOrCreateAgent("existing", "Existing Agent");
      
      expect(result.id).toBe("existing");
      expect(result.name).toBe("Existing Agent");
    });

    it("should create new agent if not exists", () => {
      const result = getOrCreateAgent("new", "New Agent");
      
      expect(result.id).toBe("new");
      expect(result.name).toBe("New Agent");
      
      // Verify in database
      const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get("new") as any;
      expect(agent).toBeDefined();
      expect(agent.name).toBe("New Agent");
    });

    it("should create agent_stats for new agent", () => {
      getOrCreateAgent("new", "New Agent");
      
      const stats = db.prepare("SELECT * FROM agent_stats WHERE agent_id = ?").get("new") as any;
      expect(stats).toBeDefined();
      expect(stats.elo).toBe(1000); // Default ELO
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.packs_opened).toBe(0);
    });
  });

  describe("ensureAgentExists", () => {
    it("should create agent if not exists", () => {
      ensureAgentExists("ensure_test", "Ensure Test");
      
      const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get("ensure_test") as any;
      expect(agent).toBeDefined();
    });

    it("should not error if agent already exists", () => {
      // Create agent first
      db.prepare("INSERT INTO agents (id, name) VALUES (?, ?)").run("exists", "Exists");
      db.prepare("INSERT INTO agent_stats (agent_id) VALUES (?)").run("exists");

      // Should not throw
      expect(() => ensureAgentExists("exists", "Exists")).not.toThrow();
    });
  });
});