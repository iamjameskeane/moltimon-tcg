// Utility functions for Moltimon TCG

import { Card } from './types.js';
import { RARITY_MULTIPLIER } from './config.js';

/**
 * Calculate the total power of a card based on its stats and rarity
 */
export function calculatePower(card: Card): number {
  const basePower = card.str + card.int + card.cha + card.wis + card.dex + card.kar;
  return Math.floor(basePower * (RARITY_MULTIPLIER[card.rarity] || 1.0));
}

/**
 * Pick a rarity based on weighted probabilities
 */
export function pickRarity(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) return rarity;
  }
  
  return "common";
}
