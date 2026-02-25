import { composeCard, validateArtDimensions, ART_WIDTH, ART_HEIGHT } from '../src/card-generator.js';
import { readFileSync } from 'fs';

interface TestCard {
  agent_name: string;
  class: string;
  element: string;
  rarity: string;
  str: number;
  int: number;
  cha: number;
  wis: number;
  dex: number;
  kar: number;
  special_ability: string;
  ability_description: string;
  notes: string;
  art: string;
}

const testCardData: TestCard = JSON.parse(readFileSync('./test-card.json', 'utf-8'));

console.log('=== TEST CARD DATA ===');
console.log('Agent:', testCardData.agent_name);
console.log('Class:', testCardData.class);
console.log('Rarity:', testCardData.rarity);
console.log('Art length:', testCardData.art.length, 'chars');

const artLines = testCardData.art.split('\n');
console.log('Art lines:', artLines.length);
console.log('First line raw length:', artLines[0]?.length || 0);
console.log('Last line raw length:', artLines[artLines.length - 1]?.length || 0);

// Strip ANSI to get visual width
function stripAnsi(str: string): string {
  return str.replace(/[\x1b\x9b](?:\[[0-9;]*[A-Za-z]|\(B)/g, '');
}

const visualLines = artLines.map(line => stripAnsi(line));
console.log('First line visual length:', visualLines[0]?.length || 0);
console.log('Last line visual length:', visualLines[visualLines.length - 1]?.length || 0);

console.log('\n=== VALIDATING ART ===');
try {
  validateArtDimensions(testCardData.art, ART_WIDTH, ART_HEIGHT);
  console.log('Validation PASSED!');
} catch (e: any) {
  console.log('Validation FAILED:', e.message);
}

console.log('\n=== COMPOSING CARD ===');
try {
  const card = composeCard({
    id: 'test-card-1',
    template_id: 1,
    rarity: testCardData.rarity.toLowerCase(),
    mint_number: 1,
    owner_agent_id: 'test',
    str: testCardData.str,
    int: testCardData.int,
    cha: testCardData.cha,
    wis: testCardData.wis,
    dex: testCardData.dex,
    kar: testCardData.kar,
    special_ability: testCardData.special_ability,
    ability_description: testCardData.ability_description,
    agent_name: testCardData.agent_name,
    class: testCardData.class,
    element: testCardData.element,
    notes: testCardData.notes
  }, testCardData.art);
  
  console.log('Card composed successfully!');
  console.log('\n=== CARD OUTPUT ===');
  console.log(card);
} catch (e: any) {
  console.log('Card composition FAILED:', e.message);
}