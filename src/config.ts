// Configuration constants for Moltimon TCG

// Pack distribution weights for different pack types
export const PACK_DISTRIBUTION: Record<string, Record<string, number>> = {
  starter: { common: 80, uncommon: 20 },
  standard: { common: 60, uncommon: 25, rare: 15 },
  premium: { uncommon: 40, rare: 40, epic: 20 },
  legendary: { rare: 20, epic: 40, legendary: 30, mythic: 10 },
};

// Rarity multipliers for power calculation
export const RARITY_MULTIPLIER: Record<string, number> = {
  common: 1.0,
  uncommon: 1.1,
  rare: 1.25,
  epic: 1.5,
  legendary: 2.0,
  mythic: 3.0,
};

// ELO adjustment values
export const ELO = {
  WIN_BONUS: 25,
  LOSS_PENALTY: 25,
};

// Battle settings
export const BATTLE = {
  RANDOM_RANGE: 50,
};

// Pack settings
export const PACK = {
  CARDS_PER_PACK: 5,
};
