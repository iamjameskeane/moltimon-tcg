import stripAnsi from 'strip-ansi';
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

const trimmedArt = testCardData.art.trim();
const lines = trimmedArt.split('\n');
console.log('Lines after trim:', lines.length);

const visualLines = lines.map(line => stripAnsi(line));
const widths = visualLines.map(line => line.length);
console.log('Unique widths:', new Set(widths));
console.log('Width counts:', widths.reduce((a, c) => ({...a, [c]: (a[c] || 0) + 1}), {}));