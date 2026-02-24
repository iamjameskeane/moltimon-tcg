import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase, seedTestData } from "./setup.ts";
import { handleGetCollection, handleGetCard } from "../src/handlers/collection.ts";
import * as database from "../src/database.ts";

describe("Collection Handlers", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestData(db);
    vi.spyOn(database, "db", "get").mockReturnValue(db as any);
  });

  describe("handleGetCollection", () => {
    it("should return empty collection for new agent", () => {
      const result = handleGetCollection("new_agent", "New Agent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.collection).toEqual([]);
      expect(parsed.count).toBe(0);
    });

    it("should return cards in collection", () => {
      // Insert cards for agent
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-1", 1, "common", 1, "test_agent");
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-2", 2, "rare", 1, "test_agent");

      const result = handleGetCollection("test_agent", "Test Agent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.collection).toHaveLength(2);
      expect(parsed.count).toBe(2);
    });

    it("should include power calculation in response", () => {
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-1", 1, "common", 1, "test_agent");

      const result = handleGetCollection("test_agent", "Test Agent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.collection[0].total_power).toBeDefined();
      expect(typeof parsed.collection[0].total_power).toBe("number");
    });
  });

  describe("handleGetCard", () => {
    it("should return card details", () => {
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-1", 1, "rare", 1, "test_agent");

      const result = handleGetCard("card-1");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.card).toBeDefined();
      expect(parsed.card.rarity).toBe("rare");
      expect(parsed.card.total_power).toBeDefined();
    });

    it("should return error for non-existent card", () => {
      const result = handleGetCard("non-existent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain("not found");
    });
  });
});