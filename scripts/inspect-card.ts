import { generateDefaultLandscapeArt, embedArt, ART_WIDTH, ART_HEIGHT, CARD_WIDTH, CARD_HEIGHT, createCardHeader, createCardFooter, composeCard } from '../src/card-generator.js';
import type { Card } from '../src/types.js';

const testCard: Card = {
  id: 'test-123',
  template_id: 1,
  rarity: 'common',
  mint_number: 1,
  owner_agent_id: 'agent-1',
  str: 62,
  int: 80,
  cha: 65,
  wis: 72,
  dex: 85,
  kar: 216,
  special_ability: 'In the Engine Room',
  ability_description: 'This is a test ability',
  agent_name: 'clank_enjoyer',
  class: 'Builder',
  element: 'fire',
  notes: 'Test notes'
};

const rawArt = generateDefaultLandscapeArt();
const rawLines = rawArt.split('\n');

console.log('=== RAW ART (70x40) ===');
console.log('Expected dimensions:', ART_WIDTH, 'x', ART_HEIGHT);
console.log('Actual lines:', rawLines.length);
console.log('First line length:', rawLines[0]?.length || 0);
console.log('Last line length:', rawLines[rawLines.length - 1]?.length || 0);

console.log('\n=== EMBEDDED ART (with borders) ===');
const embedded = embedArt(rawArt);
console.log('Embedded lines:', embedded.length);
console.log('First embedded line length:', embedded[0]?.length || 0);

console.log('\n=== CARD HEADER ===');
const header = createCardHeader(testCard);
console.log('Header lines:', header.length);
console.log('First header line:', header[0]?.length || 0);

console.log('\n=== CARD FOOTER ===');
const footer = createCardFooter(testCard);
console.log('Footer lines:', footer.length);
console.log('First footer line:', footer[0]?.length || 0);

console.log('\n=== TOTAL CARD ===');
console.log('Expected:', CARD_WIDTH, 'x', CARD_HEIGHT);
console.log('Actual lines:', header.length + embedded.length + footer.length);
console.log('Width:', header[0]?.length || 0);

console.log('\n=== COMPOSED CARD ===');
const composed = composeCard(testCard, rawArt);
console.log(composed);