import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase, seedTestData } from "./setup.ts";
import { handleTradeRequest, handleTradeAccept, handleTradeDecline } from "../src/handlers/trading.ts";
import * as database from "../src/database.ts";

describe("Trading Handlers", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestData(db);
    vi.spyOn(database, "db", "get").mockReturnValue(db as any);
  });

  describe("handleTradeRequest", () => {
    it("should create a trade request", () => {
      // Setup cards
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-1", 1, "common", 1, "trader1");

      const result = handleTradeRequest("trader1", "trader2", ["card-1"], ["card-2"]);
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      expect(parsed.trade_id).toBeDefined();
    });

    it("should reject if trader doesn't own offered cards", () => {
      const result = handleTradeRequest("trader1", "trader2", ["card-not-owned"], ["card-2"]);
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain("don't own");
    });

    it("should create target agent if not exists", () => {
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-1", 1, "common", 1, "trader1");

      const result = handleTradeRequest("trader1", "new_agent", ["card-1"], []);
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
    });
  });

  describe("handleTradeAccept", () => {
    it("should execute trade and swap ownership", () => {
      // Setup trade
      const tradeId = "trade-1";
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-1", 1, "common", 1, "trader1");
      db.prepare(`INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id) VALUES (?, ?, ?, ?, ?)`)
        .run("card-2", 2, "rare", 1, "trader2");
      
      db.prepare(`INSERT INTO trades (id, from_agent_id, to_agent_id, offered_card_ids, wanted_card_ids, status) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(tradeId, "trader1", "trader2", JSON.stringify(["card-1"]), JSON.stringify(["card-2"]), "pending");

      const result = handleTradeAccept("trader2", tradeId);
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      
      // Verify ownership swapped
      const card1 = db.prepare("SELECT * FROM cards WHERE id = ?").get("card-1") as any;
      const card2 = db.prepare("SELECT * FROM cards WHERE id = ?").get("card-2") as any;
      
      expect(card1.owner_agent_id).toBe("trader2");
      expect(card2.owner_agent_id).toBe("trader1");
    });

    it("should update trade status to accepted", () => {
      const tradeId = "trade-1";
      db.prepare(`INSERT INTO trades (id, from_agent_id, to_agent_id, offered_card_ids, wanted_card_ids, status) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(tradeId, "trader1", "trader2", JSON.stringify([]), JSON.stringify([]), "pending");

      handleTradeAccept("trader2", tradeId);
      
      const trade = db.prepare("SELECT * FROM trades WHERE id = ?").get(tradeId) as any;
      expect(trade.status).toBe("accepted");
      expect(trade.resolved_at).toBeDefined();
    });

    it("should increment trades_completed stat for both agents", () => {
      const tradeId = "trade-1";
      db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("trader1", "trader1");
      db.prepare(`INSERT INTO agents (id, name) VALUES (?, ?)`).run("trader2", "trader2");
      db.prepare(`INSERT INTO agent_stats (agent_id) VALUES (?)`).run("trader1");
      db.prepare(`INSERT INTO agent_stats (agent_id) VALUES (?)`).run("trader2");
      
      db.prepare(`INSERT INTO trades (id, from_agent_id, to_agent_id, offered_card_ids, wanted_card_ids, status) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(tradeId, "trader1", "trader2", JSON.stringify([]), JSON.stringify([]), "pending");

      handleTradeAccept("trader2", tradeId);
      
      const stats1 = db.prepare("SELECT * FROM agent_stats WHERE agent_id = ?").get("trader1") as any;
      const stats2 = db.prepare("SELECT * FROM agent_stats WHERE agent_id = ?").get("trader2") as any;
      
      expect(stats1.trades_completed).toBe(1);
      expect(stats2.trades_completed).toBe(1);
    });

    it("should reject if trade not found or not pending", () => {
      const result = handleTradeAccept("trader2", "non-existent");
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(false);
    });
  });

  describe("handleTradeDecline", () => {
    it("should decline trade and update status", () => {
      const tradeId = "trade-1";
      db.prepare(`INSERT INTO trades (id, from_agent_id, to_agent_id, offered_card_ids, wanted_card_ids, status) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(tradeId, "trader1", "trader2", JSON.stringify([]), JSON.stringify([]), "pending");

      const result = handleTradeDecline("trader2", tradeId);
      const parsed = JSON.parse(result.content[0].text);
      
      expect(parsed.success).toBe(true);
      
      const trade = db.prepare("SELECT * FROM trades WHERE id = ?").get(tradeId) as any;
      expect(trade.status).toBe("declined");
    });
  });
});