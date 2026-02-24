// Tests for utility functions
import { describe, it, expect, vi } from 'vitest';
import { calculatePower, pickRarity } from '../src/utils.js';
import type { Card } from '../src/types.js';

describe('calculatePower', () => {
  const baseCard: Card = {
    id: 'test-1',
    template_id: 1,
    rarity: 'common',
    mint_number: 1,
    owner_agent_id: 'agent-1',
    str: 10,
    int: 10,
    cha: 10,
    wis: 10,
    dex: 10,
    kar: 10,
    special_ability: null,
    ability_description: null,
    agent_name: 'Test Agent',
    class: 'Autonomist',
    element: 'fire',
  };

  it('calculates base power for common rarity', () => {
    const power = calculatePower(baseCard);
    expect(power).toBe(60); // 60 * 1.0 = 60
  });

  it('applies rarity multipliers correctly', () => {
    const rarities: Record<string, number> = {
      common: 60,
      uncommon: 66, // 60 * 1.1 = 66
      rare: 75, // 60 * 1.25 = 75
      epic: 90, // 60 * 1.5 = 90
      legendary: 120, // 60 * 2.0 = 120
      mythic: 180, // 60 * 3.0 = 180
    };

    for (const [rarity, expectedPower] of Object.entries(rarities)) {
      const card = { ...baseCard, rarity };
      expect(calculatePower(card)).toBe(expectedPower);
    }
  });

  it('handles unknown rarity by defaulting to 1.0', () => {
    const card = { ...baseCard, rarity: 'unknown' };
    expect(calculatePower(card)).toBe(60);
  });

  it('calculates power with varied stats', () => {
    const card: Card = {
      ...baseCard,
      str: 50,
      int: 60,
      cha: 70,
      wis: 80,
      dex: 90,
      kar: 100,
      rarity: 'rare',
    };
    const basePower = 50 + 60 + 70 + 80 + 90 + 100;
    expect(calculatePower(card)).toBe(Math.floor(basePower * 1.25));
  });
});

describe('pickRarity', () => {
  it('returns a valid rarity from weights', () => {
    const weights = { common: 50, rare: 50 };
    const rarity = pickRarity(weights);
    expect(['common', 'rare']).toContain(rarity);
  });

  it('returns common when random value is at edge', () => {
    // Mock Math.random to return 0
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);
    
    const weights = { common: 50, rare: 50 };
    const rarity = pickRarity(weights);
    expect(rarity).toBe('common');
    
    Math.random = originalRandom;
  });

  it('returns the only rarity when only one option exists', () => {
    const weights = { mythic: 100 };
    const rarity = pickRarity(weights);
    expect(rarity).toBe('mythic');
  });

  it('handles empty weights by returning common', () => {
    const weights = {};
    const rarity = pickRarity(weights);
    expect(rarity).toBe('common');
  });

  it('respects weight distribution', () => {
    const weights = { common: 90, rare: 10 };
    const results: Record<string, number> = { common: 0, rare: 0 };
    
    // Run many times to verify distribution
    for (let i = 0; i < 1000; i++) {
      const rarity = pickRarity(weights);
      results[rarity]++;
    }
    
    // Common should be much more frequent than rare
    expect(results.common).toBeGreaterThan(results.rare);
    expect(results.common).toBeGreaterThan(800); // Should be around 900
  });
});
