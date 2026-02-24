import { composeCard, generateDefaultLandscapeArt, CARD_WIDTH, CARD_HEIGHT } from '../src/card-generator.js';
import type { Card } from '../src/types.js';

const art = generateDefaultLandscapeArt();

function createTestCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test-123',
    template_id: 1,
    rarity: 'common',
    mint_number: 999,
    owner_agent_id: 'agent-1',
    str: 50,
    int: 50,
    cha: 50,
    wis: 50,
    dex: 50,
    kar: 50,
    special_ability: 'Test Ability',
    ability_description: 'Test description',
    agent_name: 'TestBot',
    class: 'Warrior',
    element: 'fire',
    notes: 'Test notes',
    ...overrides,
  };
}

function cardWorks(card: Card): boolean {
  try {
    const result = composeCard(card, art);
    const lines = result.split('\n');
    return lines.length === CARD_HEIGHT;
  } catch {
    return false;
  }
}

console.log('=== Testing Maximum Field Lengths ===\n');
console.log(`Card dimensions: ${CARD_WIDTH}x${CARD_HEIGHT}`);
console.log(`Content width (inside borders): ${CARD_WIDTH - 2} chars\n`);

// Test agent_name
console.log('1. agent_name (left side of header line):');
for (let len = 30; len >= 1; len--) {
  if (cardWorks(createTestCard({ agent_name: 'A'.repeat(len) }))) {
    console.log(`   Max: ${len} chars`);
    break;
  }
}

// Test class  
console.log('\n2. class (header line):');
for (let len = 30; len >= 1; len--) {
  if (cardWorks(createTestCard({ class: 'A'.repeat(len) }))) {
    console.log(`   Max: ${len} chars`);
    break;
  }
}

// Test special_ability
console.log('\n3. special_ability (footer section):');
for (let len = 40; len >= 1; len--) {
  if (cardWorks(createTestCard({ special_ability: 'A'.repeat(len) }))) {
    console.log(`   Max: ${len} chars (single line before wrap)`);
    break;
  }
}

// Test ability_description
console.log('\n4. ability_description (wraps to multiple lines):');
for (let len = 75; len >= 1; len--) {
  try {
    composeCard(createTestCard({ ability_description: 'A'.repeat(len) }), art);
    console.log(`   Max single line: ${len} chars (longer text will wrap)`);
    break;
  } catch {
    // Continue
  }
}

// Test notes
console.log('\n5. notes (wraps to multiple lines):');
for (let len = 75; len >= 1; len--) {
  try {
    composeCard(createTestCard({ notes: 'A'.repeat(len) }), art);
    console.log(`   Max single line: ${len} chars (longer text will wrap)`);
    break;
  } catch {
    // Continue
  }
}

// Test mint_number
console.log('\n6. mint_number (top right):');
for (let num = 9999; num >= 1; num--) {
  if (cardWorks(createTestCard({ mint_number: num }))) {
    console.log(`   Max digits: ${num.toString().length} (value ${num})`);
    break;
  }
}

// Show actual card to verify
console.log('\n=== Test Card ===');
const testCard = createTestCard({
  agent_name: 'AgentNameTest12345',
  class: 'TestClassName123',
  special_ability: 'Special Ability Name Test',
  ability_description: 'This is a test ability description that should fit on one line without wrapping to a second line.',
  notes: 'This is a test note that should also fit on one line without wrapping.',
});
const result = composeCard(testCard, art);
console.log(result);
console.log(`\nTotal lines: ${result.split('\n').length}`);