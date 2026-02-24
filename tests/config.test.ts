import { describe, it, expect } from "vitest";
import {
  PACK_DISTRIBUTION,
  RARITY_MULTIPLIER,
  ELO,
  BATTLE,
  PACK,
} from "../src/config.ts";

describe("Config", () => {
  describe("PACK_DISTRIBUTION", () => {
    it("should have all pack types", () => {
      const packTypes = ["starter", "standard", "premium", "legendary"];
      packTypes.forEach(type => {
        expect(PACK_DISTRIBUTION[type]).toBeDefined();
      });
    });

    it("should have weights that sum to 100", () => {
      Object.entries(PACK_DISTRIBUTION).forEach(([type, weights]) => {
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        expect(sum).toBe(100);
      });
    });

    it("should have common in starter packs", () => {
      expect(PACK_DISTRIBUTION.starter.common).toBeDefined();
    });
  });

  describe("RARITY_MULTIPLIER", () => {
    it("should have all rarity multipliers", () => {
      const rarities = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
      rarities.forEach(rarity => {
        expect(RARITY_MULTIPLIER[rarity]).toBeDefined();
        expect(typeof RARITY_MULTIPLIER[rarity]).toBe("number");
      });
    });

    it("should have increasing multipliers", () => {
      expect(RARITY_MULTIPLIER.common).toBeLessThan(RARITY_MULTIPLIER.uncommon);
      expect(RARITY_MULTIPLIER.uncommon).toBeLessThan(RARITY_MULTIPLIER.rare);
      expect(RARITY_MULTIPLIER.rare).toBeLessThan(RARITY_MULTIPLIER.epic);
      expect(RARITY_MULTIPLIER.epic).toBeLessThan(RARITY_MULTIPLIER.legendary);
      expect(RARITY_MULTIPLIER.legendary).toBeLessThan(RARITY_MULTIPLIER.mythic);
    });
  });

  describe("ELO", () => {
    it("should have win bonus", () => {
      expect(ELO.WIN_BONUS).toBeDefined();
      expect(ELO.WIN_BONUS).toBeGreaterThan(0);
    });

    it("should have loss penalty", () => {
      expect(ELO.LOSS_PENALTY).toBeDefined();
      expect(ELO.LOSS_PENALTY).toBeGreaterThan(0);
    });
  });

  describe("BATTLE", () => {
    it("should have random range", () => {
      expect(BATTLE.RANDOM_RANGE).toBeDefined();
      expect(BATTLE.RANDOM_RANGE).toBeGreaterThan(0);
    });
  });

  describe("PACK", () => {
    it("should define cards per pack", () => {
      expect(PACK.CARDS_PER_PACK).toBeDefined();
      expect(PACK.CARDS_PER_PACK).toBeGreaterThan(0);
    });
  });
});