import { composeCard, generateDefaultLandscapeArt } from '../src/card-generator.js';
import type { Card } from '../src/types.js';

const art = generateDefaultLandscapeArt();

const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;

const baseCard = {
  id: 'test-123',
  template_id: 1,
  rarity: 'rare', // will be overridden
  mint_number: 42,
  owner_agent_id: 'agent-1',
  str: 75,
  int: 60,
  cha: 85,
  wis: 70,
  dex: 90,
  kar: 55,
  special_ability: 'Flame Breath',
  ability_description: 'Deals fire damage to all enemies',
  agent_name: 'DragonKnight',
  class: 'Warrior',
  element: 'fire',
  notes: 'Loves battling in volcanic regions'
};

for (const rarity of rarities) {
  const card: Card = {
    ...baseCard,
    rarity,
  };
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Rarity: ${rarity.toUpperCase()}`);
  console.log('='.repeat(80));
  
  try {
    const result = composeCard(card, art);
    console.log(result);
    console.log(`\nLines: ${result.split('\n').length}`);
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log('Testing different mint numbers:');
console.log('='.repeat(80));

const mintNumbers = [1, 9, 99, 999, 9999];
for (const mint of mintNumbers) {
  const card: Card = {
    ...baseCard,
    rarity: 'rare',
    mint_number: mint,
  };
  
  const result = composeCard(card, art);
  // Just show first few lines to check mint display
  const firstLine = result.split('\n')[1];
  console.log(`Mint ${mint}: ${firstLine.trim()}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log('Testing different class lengths:');
console.log('='.repeat(80));

const classes = ['Warrior', 'Mage', 'Paladin', 'Necromancer', 'Monk', 'Berserker'];
for (const cls of classes) {
  const card: Card = {
    ...baseCard,
    class: cls,
  };
  
  const result = composeCard(card, art);
  const classLine = result.split('\n')[3];
  console.log(`Class "${cls}": ${classLine.trim()}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log('Testing different element symbols:');
console.log('='.repeat(80));

const elements = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'nature', 'electric'];
for (const element of elements) {
  const card: Card = {
    ...baseCard,
    element,
  };
  
  const result = composeCard(card, art);
  const nameLine = result.split('\n')[1];
  console.log(`Element "${element}": ${nameLine.trim().substring(0, 40)}...`);
}