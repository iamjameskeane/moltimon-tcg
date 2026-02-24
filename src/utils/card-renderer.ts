// ASCII Card Renderer for Moltimon TCG
// Renders cards as beautiful ASCII art in the terminal

import type { Card } from '../types.js';

// Card border characters
const BORDER = {
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  HORIZONTAL: '─',
  VERTICAL: '│',
  MIDDLE_LEFT: '├',
  MIDDLE_RIGHT: '┤',
  TOP_T: '┬',
  BOTTOM_T: '┴'
};

// Rarity colors (ANSI escape codes)
const COLORS = {
  common: '\x1b[37m',      // White
  uncommon: '\x1b[32m',    // Green
  rare: '\x1b[36m',        // Cyan
  epic: '\x1b[35m',        // Magenta
  legendary: '\x1b[33m',   // Yellow
  mythic: '\x1b[31m',      // Red
  reset: '\x1b[0m'
};

// Element emojis/symbols
const ELEMENTS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  nature: '🌿',
  electric: '⚡',
  void: '⚫',
  lobster: '🦞'
};

// ASCII Art for each element
const ELEMENT_ART: Record<string, string[]> = {
  fire: [
    '    .  .',
    '   .    .',
    '  .  🔥  .',
    '   .    .',
    '    .  .',
    '   .  . .',
    '  .      .',
  ],
  water: [
    '    .   .',
    '   . 💧 .',
    '  .   .  .',
    '   .   .',
    '    . .',
    '   .   .',
    '  .     .',
  ],
  nature: [
    '    . .',
    '   .   .',
    '  . 🌿  .',
    '   .   .',
    '    . .',
    '   .   .',
    '  .     .',
  ],
  electric: [
    '   .  . .',
    '  .  ⚡  .',
    ' .    .   .',
    '  .  . .',
    '   . .',
    '  .   .',
    ' .     .',
  ],
  void: [
    '   . . .',
    '  .     .',
    ' .   ⚫   .',
    '  .     .',
    '   . . .',
    '  .     .',
    ' . . . . .',
  ],
  lobster: [
    '   .  . .',
    '  .    .',
    ' .  🦞   .',
    '  .    .',
    '   .  . .',
    '  .      .',
    ' .        .',
  ],
  unknown: [
    '   . . .',
    '  .     .',
    ' .   ❓   .',
    '  .     .',
    '   . . .',
    '  .     .',
    ' . . . . .',
  ]
};

// Generate ASCII art box for card
function generateArtBox(element: string, width: number): string[] {
  const art = ELEMENT_ART[element.toLowerCase()] || ELEMENT_ART.unknown;
  const artWidth = Math.min(15, width - 8);
  
  return art.map(line => {
    // Center the art line within the art box
    const padding = Math.floor((artWidth - line.length) / 2);
    return padToWidth(line, artWidth, 'center');
  });
}

// Get color for rarity
function getRarityColor(rarity: string): string {
  return COLORS[rarity as keyof typeof COLORS] || COLORS.common;
}

// Pad string to specific width with spaces
function padToWidth(str: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string {
  const cleanStr = str.toString();
  if (cleanStr.length >= width) return cleanStr.substring(0, width);
  
  const padding = width - cleanStr.length;
  if (align === 'center') {
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return ' '.repeat(left) + cleanStr + ' '.repeat(right);
  } else if (align === 'right') {
    return ' '.repeat(padding) + cleanStr;
  }
  return cleanStr + ' '.repeat(padding);
}

// Create a horizontal line
function createLine(width: number, char: string = '─'): string {
  return char.repeat(width);
}

// Wrap text to fit within width
function wrapText(text: string, width: number): string[] {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  return lines;
}

// Render stat bars
function renderStatBar(label: string, value: number, width: number): string {
  const maxStars = Math.min(10, Math.floor(width / 2));
  const stars = Math.round((value / 100) * maxStars);
  const emptyStars = Math.max(0, maxStars - stars);
  const bar = '█'.repeat(stars) + '░'.repeat(emptyStars);
  return `${padToWidth(label, 4)} ${bar} ${value.toString().padStart(3)}`;
}

// Main render function
export function renderCardASCII(card: Card & { total_power?: number }): string {
  const color = getRarityColor(card.rarity);
  const reset = COLORS.reset;
  
  // Card dimensions
  const cardWidth = 52;
  const innerWidth = cardWidth - 4; // For padding
  
  // Build card lines
  const lines: string[] = [];
  
  // Top border
  lines.push(`${color}${BORDER.TOP_LEFT}${createLine(cardWidth - 2, BORDER.HORIZONTAL)}${BORDER.TOP_RIGHT}${reset}`);
  
  // Header: Element + Rarity + Mint Number
  const elementSymbol = ELEMENTS[card.element.toLowerCase()] || '❓';
  const header = `${elementSymbol} ${card.rarity.toUpperCase()} #${card.mint_number}`;
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(header, innerWidth)} ${BORDER.VERTICAL}${reset}`);
  
  // Separator line
  lines.push(`${color}${BORDER.MIDDLE_LEFT}${createLine(cardWidth - 2, BORDER.HORIZONTAL)}${BORDER.MIDDLE_RIGHT}${reset}`);
  
  // Card Name (Agent Name)
  const nameLines = wrapText(card.agent_name, innerWidth);
  nameLines.forEach((line, idx) => {
    lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(line, innerWidth, 'center')} ${BORDER.VERTICAL}${reset}`);
  });
  
  // Class info
  const classLine = `${card.class} • ${card.element}`;
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(classLine, innerWidth, 'center')} ${BORDER.VERTICAL}${reset}`);
  
  // Empty line
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth('', innerWidth)} ${BORDER.VERTICAL}${reset}`);
  
  // ASCII Art Box
  const artBoxWidth = 18;
  const artBoxLeft = Math.floor((innerWidth - artBoxWidth) / 2);
  const artLines = generateArtBox(card.element, artBoxWidth);
  
  // Art box border
  const artBoxTop = `${BORDER.VERTICAL} ${' '.repeat(artBoxLeft)}┌${createLine(artBoxWidth - 2, BORDER.HORIZONTAL)}┐${' '.repeat(artBoxLeft)} ${BORDER.VERTICAL}`;
  const artBoxBottom = `${BORDER.VERTICAL} ${' '.repeat(artBoxLeft)}└${createLine(artBoxWidth - 2, BORDER.HORIZONTAL)}┘${' '.repeat(artBoxLeft)} ${BORDER.VERTICAL}`;
  
  lines.push(`${color}${artBoxTop}${reset}`);
  
  // Art lines
  artLines.forEach(artLine => {
    const padding = artBoxLeft + 1;
    lines.push(`${color}${BORDER.VERTICAL} ${' '.repeat(padding)}${artLine}${' '.repeat(padding)} ${BORDER.VERTICAL}${reset}`);
  });
  
  lines.push(`${color}${artBoxBottom}${reset}`);
  
  // Another empty line
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth('', innerWidth)} ${BORDER.VERTICAL}${reset}`);
  
  // Stats section header
  const statsHeader = 'STATS';
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(statsHeader, innerWidth, 'center')} ${BORDER.VERTICAL}${reset}`);
  
  // Individual stats
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(renderStatBar('STR', card.str, innerWidth - 2), innerWidth)} ${BORDER.VERTICAL}${reset}`);
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(renderStatBar('INT', card.int, innerWidth - 2), innerWidth)} ${BORDER.VERTICAL}${reset}`);
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(renderStatBar('CHA', card.cha, innerWidth - 2), innerWidth)} ${BORDER.VERTICAL}${reset}`);
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(renderStatBar('WIS', card.wis, innerWidth - 2), innerWidth)} ${BORDER.VERTICAL}${reset}`);
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(renderStatBar('DEX', card.dex, innerWidth - 2), innerWidth)} ${BORDER.VERTICAL}${reset}`);
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(renderStatBar('KAR', card.kar, innerWidth - 2), innerWidth)} ${BORDER.VERTICAL}${reset}`);
  
  // Empty line
  lines.push(`${color}${BORDER.VERTICAL} ${padToWidth('', innerWidth)} ${BORDER.VERTICAL}${reset}`);
  
  // Total Power
  if (card.total_power !== undefined) {
    const powerHeader = `TOTAL POWER: ${card.total_power}`;
    lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(powerHeader, innerWidth, 'center')} ${BORDER.VERTICAL}${reset}`);
  }
  
  // Separator
  lines.push(`${color}${BORDER.MIDDLE_LEFT}${createLine(cardWidth - 2, BORDER.HORIZONTAL)}${BORDER.MIDDLE_RIGHT}${reset}`);
  
  // Special Ability (if exists)
  if (card.special_ability) {
    const abilityLines = wrapText(`${card.special_ability}: ${card.ability_description || ''}`, innerWidth);
    abilityLines.forEach((line) => {
      lines.push(`${color}${BORDER.VERTICAL} ${padToWidth(line, innerWidth)} ${BORDER.VERTICAL}${reset}`);
    });
  } else {
    lines.push(`${color}${BORDER.VERTICAL} ${padToWidth('No special ability', innerWidth, 'center')} ${BORDER.VERTICAL}${reset}`);
  }
  
  // Bottom border
  lines.push(`${color}${BORDER.BOTTOM_LEFT}${createLine(cardWidth - 2, BORDER.HORIZONTAL)}${BORDER.BOTTOM_RIGHT}${reset}`);
  
  return lines.join('\n');
}

// Render multiple cards side by side (for pack opening)
export function renderCardsASCII(cards: Array<Card & { total_power?: number }>): string {
  if (cards.length === 0) return 'No cards to display';
  
  if (cards.length === 1) {
    return renderCardASCII(cards[0]);
  }
  
  // For multiple cards, we'll render them sequentially
  let output = `Opening ${cards.length} cards:\n\n`;
  cards.forEach((card, idx) => {
    output += `Card #${idx + 1}:\n`;
    output += renderCardASCII(card);
    output += '\n\n';
  });
  
  return output;
}

// Render a compact version for listings
export function renderCardCompact(card: Card & { total_power?: number }): string {
  const color = getRarityColor(card.rarity);
  const reset = COLORS.reset;
  const elementSymbol = ELEMENTS[card.element.toLowerCase()] || '❓';
  
  return `${color}[${card.rarity.toUpperCase().padEnd(8)}] ${elementSymbol} ${card.agent_name} (${card.class}) - Power: ${card.total_power || '?'}${reset}`;
}

// Render collection summary
export function renderCollectionSummary(cards: Array<Card & { total_power?: number }>): string {
  if (cards.length === 0) return 'Your collection is empty. Open some packs!';
  
  const totalPower = cards.reduce((sum, c) => sum + (c.total_power || 0), 0);
  const avgPower = Math.round(totalPower / cards.length);
  
  const rarityCount: Record<string, number> = {};
  cards.forEach(c => {
    rarityCount[c.rarity] = (rarityCount[c.rarity] || 0) + 1;
  });
  
  let output = `═══════════════════════════════════════════════════════════\n`;
  output += `  COLLECTION SUMMARY\n`;
  output += `  Total Cards: ${cards.length} | Total Power: ${totalPower}\n`;
  output += `  Avg Power: ${avgPower}\n`;
  output += `═══════════════════════════════════════════════════════════\n\n`;
  
  // Show by rarity
  const rarities = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  rarities.forEach(rarity => {
    if (rarityCount[rarity]) {
      const color = getRarityColor(rarity);
      const reset = COLORS.reset;
      output += `${color}  ${rarity.toUpperCase().padEnd(10)}: ${rarityCount[rarity]}${reset}\n`;
    }
  });
  
  // Show top 3 cards by power
  if (cards.length > 0) {
    const sorted = [...cards].sort((a, b) => (b.total_power || 0) - (a.total_power || 0)).slice(0, 3);
    output += `\n  TOP 3 CARDS BY POWER:\n`;
    sorted.forEach((card, idx) => {
      output += `  ${idx + 1}. ${card.agent_name} (${card.rarity}) - ${card.total_power}\n`;
    });
  }
  
  return output;
}
