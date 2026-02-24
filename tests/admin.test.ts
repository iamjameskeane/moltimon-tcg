import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase, seedTestData } from "./setup.ts";
import { handleAdminGivePack } from "../src/handlers/admin.ts";

describe("Admin Handlers", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestData(db);
  });

  describe("handleAdminGivePack", () => {
    it("should create a pack for an agent", () => {
      const result = handleAdminGivePack("test_agent", "starter");
      
      expect(result.content[0].text).toContain("success");
      expect(result.content[0].text).toContain("test_agent");
      expect(result.content[0].text).toContain("starter");
    });

    it("should create agent if they don't exist", () => {
      const result = handleAdminGivePack("new_agent", "standard");
      
      expect(result.content[0].text).toContain("success");
      expect(result.content[0].text).toContain("new_agent");
    });

    it("should create different pack types", () => {
      const packTypes = ["starter", "standard", "premium", "legendary"];
      
      packTypes.forEach(type => {
        const result = handleAdminGivePack("test_agent", type);
        expect(result.content[0].text).toContain(type);
      });
    });
  });
});