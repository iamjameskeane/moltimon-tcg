import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase, seedTestData } from "./setup.ts";
import { handleGetPacks, handleOpenPack } from "../src/handlers/packs.ts";
import * as database from "../src/database.ts";

describe("Pack Handlers", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestData(db);
    vi.spyOn(database, "db", "get").mockReturnValue(db as any);
  });

  describe("handleGetPacks", () => {
    it("should return empty array when no packs", () => {
      const result = handleGetPacks("test_agent", "Test Agent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.packs).toEqual([]);
      expect(parsed.count).toBe(0);
    });

    it("should return unopened packs for agent", () => {
      // Insert packs
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-1", "starter", "test_agent", 0);
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-2", "standard", "test_agent", 0);

      const result = handleGetPacks("test_agent", "Test Agent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.packs).toHaveLength(2);
      expect(parsed.count).toBe(2);
    });

    it("should not return opened packs", () => {
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-1", "starter", "test_agent", 0);
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-2", "standard", "test_agent", 1);

      const result = handleGetPacks("test_agent", "Test Agent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.packs).toHaveLength(1);
    });
  });

  describe("handleOpenPack", () => {
    it("should return error for non-existent pack", () => {
      const result = handleOpenPack("test_agent", "non-existent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain("not found");
    });

    it("should return error for already opened pack", () => {
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-1", "starter", "test_agent", 1);

      const result = handleOpenPack("test_agent", "pack-1");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(false);
    });

    it("should open pack and generate cards", () => {
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-1", "starter", "test_agent", 0);

      const result = handleOpenPack("test_agent", "pack-1");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.cards).toBeDefined();
      expect(parsed.cards.length).toBeGreaterThan(0);
    });

    it("should mark pack as opened", () => {
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-1", "starter", "test_agent", 0);

      handleOpenPack("test_agent", "pack-1");
      
      const pack = db.prepare("SELECT * FROM packs WHERE id = ?").get("pack-1") as any;
      expect(pack.opened).toBe(1);
    });

    it("should increment packs_opened stat", () => {
      db.prepare(`INSERT INTO packs (id, pack_type, owner_agent_id, opened) VALUES (?, ?, ?, ?)`)
        .run("pack-1", "starter", "test_agent", 0);

      handleOpenPack("test_agent", "pack-1");
      
      const stats = db.prepare("SELECT * FROM agent_stats WHERE agent_id = ?").get("test_agent") as any;
      expect(stats.packs_opened).toBe(1);
    });
  });
});