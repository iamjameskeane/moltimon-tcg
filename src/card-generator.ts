import type { Card } from './types.js';

/**
 * Card dimension constants
 */
export const CARD_WIDTH = 80;
export const CARD_HEIGHT = 60;
export const ART_WIDTH = 70;
export const ART_HEIGHT = 26;
export const HEADER_HEIGHT = 4;
export const FOOTER_HEIGHT = 12;
export const ART_Y_OFFSET = HEADER_HEIGHT + 1;

/**
 * Field character limits to ensure card stays within 60 lines
 * Exceeding these limits may cause the card to exceed its target height
 */
export const CARD_FIELD_LIMITS = {
  agent_name: 30,
  class: 30,
  special_ability: 30,
  ability_description_words: 15,
  notes_words: 15,
} as const;

/**
 * Rarity border styles with distinct ornamental borders for art box
 * Philosophy:
 * - Common/Uncommon: ASCII line art (─│┌┐└┘)
 * - Rare+: Box-drawing + symbols (╔╗╚╝═║)
 * - Legendary/Mythic: Heavy ornamentation with thematic symbols (♛✶🦞)
 */
export const RARITY_BORDERS: Record<string, { h: string; v: string; tl: string; tr: string; bl: string; br: string; name: string; banner: string; sepLeft: string; sepRight: string }> = {
  common: {
    h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘',
    name: 'Common',
    banner: '[ COMMON ]',
    sepLeft: '├', sepRight: '┤'
  },
  uncommon: {
    h: '─', v: '│', tl: '╭', tr: '╮', bl: '╰', br: '╯',
    name: 'Uncommon',
    banner: '[ UNCOMMON ]',
    sepLeft: '├', sepRight: '┤'
  },
  rare: {
    h: '═', v: '║', tl: '╭', tr: '╮', bl: '╰', br: '╯',
    name: 'Rare',
    banner: '◆ RARE ◆',
    sepLeft: '╠', sepRight: '╣'
  },
  epic: {
    h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝',
    name: 'Epic',
    banner: '♦ EPIC ♦',
    sepLeft: '╠', sepRight: '╣'
  },
  legendary: {
    h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛',
    name: 'Legendary',
    banner: '♛ LEGENDARY ♛',
    sepLeft: '┿', sepRight: '┾'
  },
  mythic: {
    h: '█', v: '█', tl: '█', tr: '█', bl: '█', br: '█',
    name: 'Mythic',
    banner: '✶ MYTHIC ✶',
    sepLeft: '█', sepRight: '█'
  },
};

export const RARITY_ART_BORDERS: Record<string, { h: string; v: string; tl: string; tr: string; bl: string; br: string }> = {
  common: {
    h: '·', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘',
  },
  uncommon: {
    h: '·', v: '│', tl: '╭', tr: '╮', bl: '╰', br: '╯',
  },
  rare: {
    h: '◇', v: '◇', tl: '◈', tr: '◈', bl: '◈', br: '◈',
  },
  epic: {
    h: '❖', v: '✦', tl: '❂', tr: '❂', bl: '❂', br: '❂',
  },
  legendary: {
    h: '◆', v: '◆', tl: '◈', tr: '◈', bl: '◈', br: '◈',
  },
  mythic: {
    h: '✧', v: '✧', tl: '✪', tr: '✪', bl: '✪', br: '✪',
  },
};

/**
 * @deprecated Use RARITY_BORDERS instead
 */
export const RARITY_STYLES: Record<string, { border: string; name: string }> = {
  common: { border: '─│┌┐└┘', name: 'Common' },
  uncommon: { border: '═║╔╗╚╝', name: 'Uncommon' },
  rare: { border: '━┃┏┓┗┛', name: 'Rare' },
  epic: { border: '▄▌▄▀', name: 'Epic' },
  legendary: { border: '████████', name: 'Legendary' },
};

/**
 * Element symbols
 */
export const ELEMENT_SYMBOLS: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
  light: '✨',
  dark: '🌑',
  nature: '🌿',
  electric: '⚡',
};

/**
 * Validation error types
 */
export class DimensionError extends Error {
  constructor(
    message: string,
    public readonly expectedWidth: number,
    public readonly expectedHeight: number,
    public readonly actualWidth: number,
    public readonly actualHeight: number
  ) {
    super(message);
    this.name = 'DimensionError';
  }
}

/**
 * Validates that art dimensions match requirements exactly
 * @param art - The ASCII art to validate
 * @param requiredWidth - Required width in characters
 * @param requiredHeight - Required height in lines
 * @throws DimensionError if dimensions don't match
 */
export function validateArtDimensions(
  art: string,
  requiredWidth: number = ART_WIDTH,
  requiredHeight: number = ART_HEIGHT
): void {
  const lines = art.split('\n');
  const actualHeight = lines.length;
  const actualWidth = lines.length > 0 ? lines[0].length : 0;

  // Check all lines have same width
  const widths = lines.map((line) => line.length);
  const inconsistentWidths = widths.some((w) => w !== actualWidth);

  if (inconsistentWidths) {
    throw new DimensionError(
      `Art has inconsistent line widths. All lines must be exactly ${requiredWidth} characters wide.`,
      requiredWidth,
      requiredHeight,
      actualWidth,
      actualHeight
    );
  }

  if (actualWidth !== requiredWidth) {
    throw new DimensionError(
      `Art width must be exactly ${requiredWidth} characters, got ${actualWidth}`,
      requiredWidth,
      requiredHeight,
      actualWidth,
      actualHeight
    );
  }

  if (actualHeight !== requiredHeight) {
    throw new DimensionError(
      `Art height must be exactly ${requiredHeight} lines, got ${actualHeight}`,
      requiredWidth,
      requiredHeight,
      actualWidth,
      actualHeight
    );
  }
}

/**
 * Validates that the card frame art is exactly CARD_WIDTH x CARD_HEIGHT
 * @param frame - The frame ASCII art to validate
 * @throws DimensionError if dimensions don't match
 */
export function validateCardFrame(frame: string): void {
  validateArtDimensions(frame, CARD_WIDTH, CARD_HEIGHT);
}

/**
 * Creates a visual stat bar
 * @param value - The stat value (0-100)
 * @param maxValue - Maximum value for the bar (default 100)
 * @param barWidth - Width of the bar in characters (default 10)
 * @param filledChar - Character for filled portion (default '█')
 * @param emptyChar - Character for empty portion (default '░')
 * @returns The bar string
 */
export function createStatBar(
  value: number,
  maxValue: number = 100,
  barWidth: number = 10,
  filledChar: string = '█',
  emptyChar: string = '░'
): string {
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  const filledWidth = Math.round((clampedValue / maxValue) * barWidth);
  const emptyWidth = Math.max(0, barWidth - filledWidth);
  return filledChar.repeat(filledWidth) + emptyChar.repeat(emptyWidth);
}

/**
 * Creates a horizontal border line
 * @param width - Width of the border
 * @param leftChar - Left corner character
 * @param rightChar - Right corner character
 * @param middleChar - Middle border character
 * @returns The border string
 */
export function createHorizontalBorder(
  width: number,
  leftChar: string,
  rightChar: string,
  middleChar: string
): string {
  return leftChar + middleChar.repeat(width - 2) + rightChar;
}

/**
 * Creates a vertical border line with content
 * @param content - Content to place between borders
 * @param leftBorder - Left border character
 * @param rightBorder - Right border character
 * @param totalWidth - Total width including borders
 * @returns The bordered line
 */
export function createVerticalBorderLine(
  content: string,
  leftBorder: string,
  rightBorder: string,
  totalWidth: number
): string {
  const contentWidth = totalWidth - leftBorder.length - rightBorder.length;
  const paddedContent = content.padEnd(contentWidth, ' ').slice(0, contentWidth);
  return leftBorder + paddedContent + rightBorder;
}

/**
 * Creates the card header section
 * @param card - Card data
 * @returns Array of header lines
 */
export function createCardHeader(card: Card): string[] {
  const borderStyle = RARITY_BORDERS[card.rarity.toLowerCase()] || RARITY_BORDERS.common;
  const elementSymbol = ELEMENT_SYMBOLS[card.element.toLowerCase()] || '◆';

  const lines: string[] = [];

  // Top border based on rarity (use borderStyle corner characters)
  lines.push(createHorizontalBorder(CARD_WIDTH, borderStyle.tl, borderStyle.tr, borderStyle.h));

  // Name line with element symbol, mint number flush right
  const nameSection = `${elementSymbol} ${card.agent_name}`;
  const mintSection = `#${card.mint_number}`;
  const namePadding = CARD_WIDTH - 2 - nameSection.length - mintSection.length;
  const nameLine = nameSection + ' '.repeat(Math.max(0, namePadding)) + mintSection;
  lines.push(createVerticalBorderLine(nameLine, borderStyle.v, borderStyle.v, CARD_WIDTH));

  // Rarity banner line (centered)
  const banner = borderStyle.banner;
  const bannerPadding = Math.floor((CARD_WIDTH - 2 - banner.length) / 2);
  const bannerLine = ' '.repeat(bannerPadding) + banner;
  lines.push(createVerticalBorderLine(bannerLine, borderStyle.v, borderStyle.v, CARD_WIDTH));

  // Class line
  const classLine = `Class: ${card.class}`;
  lines.push(createVerticalBorderLine(classLine, borderStyle.v, borderStyle.v, CARD_WIDTH));

  // Separator before art
  lines.push(createHorizontalBorder(CARD_WIDTH, borderStyle.sepLeft, borderStyle.sepRight, borderStyle.h));

  return lines;
}

/**
 * Creates the card footer section with stats
 * Footer should have exactly 27 lines to achieve 80x60 card (with 5-line header and 28-line art)
 * @param card - Card data
 * @returns Array of footer lines
 */
export function createCardFooter(card: Card): string[] {
  const lines: string[] = [];
  const borderStyle = RARITY_BORDERS[card.rarity.toLowerCase()] || RARITY_BORDERS.common;
  const v = borderStyle.v;

  // 1. Separator after art (use rarity-based border)
  lines.push(createHorizontalBorder(CARD_WIDTH, borderStyle.sepLeft, borderStyle.sepRight, borderStyle.h));

  // Add vertical spacing before stats
  lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
  lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));

  // 2-4. Stats display - 2x3 grid with visual bars (3 lines)
  // KAR is normalized to 10000 max (10K)
  const statPairs: [string, number, string, number, number][] = [
    ['STR', Number(card.str), 'INT', Number(card.int), 100],
    ['CHA', Number(card.cha), 'WIS', Number(card.wis), 100],
    ['DEX', Number(card.dex), 'KAR', Number(card.kar), 10000],
  ];

  function formatStatValue(val: number): string {
  if (val >= 1000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return val.toString();
}

for (const [stat1, val1, stat2, val2, max2] of statPairs) {
  const bar1 = createStatBar(val1, 100, 12, '█', '░');
  const bar2 = createStatBar(val2, max2, 12, '█', '░');
  const statStr = `${stat1}: ${formatStatValue(val1).padStart(2)}   ${bar1}          │          ${stat2}: ${formatStatValue(val2).padStart(4)}   ${bar2}`;
    const contentWidth = CARD_WIDTH - 2;
    const padding = contentWidth - statStr.length;
    const leftPadding = Math.floor(padding / 2);
    const rightPadding = padding - leftPadding;
    const line = ' '.repeat(leftPadding) + statStr + ' '.repeat(rightPadding);
    lines.push(createVerticalBorderLine(line, v, v, CARD_WIDTH));
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
  }

  // Extra empty line before element to separate from stats
  lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));

  // 5. Element power display
  const elementSymbol = ELEMENT_SYMBOLS[card.element.toLowerCase()] || '◆';
  const elementLine = `${elementSymbol} ${card.element.toUpperCase()} Element`;
  const elementPadding = Math.floor((CARD_WIDTH - 2 - elementLine.length) / 2);
  const centeredElementLine = ' '.repeat(elementPadding) + elementLine;
  lines.push(createVerticalBorderLine(centeredElementLine, v, v, CARD_WIDTH));

  // 6. Empty decorative line
  lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));

  // 7. Special ability section separator (use rarity-based border)
  lines.push(createHorizontalBorder(CARD_WIDTH, borderStyle.sepLeft, borderStyle.sepRight, borderStyle.h));

  // Blank line before special ability
  lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));

  // 8. Special ability name (with padding)
  if (card.special_ability) {
    const abilityName = ` ★ ${card.special_ability}`;
    lines.push(createVerticalBorderLine(abilityName, v, v, CARD_WIDTH));
  } else {
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
  }

  // Blank line after ability name
  lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));

  // 9. Ability description (wrapped to fit card width, with padding)
  if (card.ability_description) {
    const maxDescWidth = CARD_WIDTH - 5; // Account for vertical borders + 1 space padding
    const words = card.ability_description.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxDescWidth) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) {
          lines.push(createVerticalBorderLine(' ' + currentLine, v, v, CARD_WIDTH));
        }
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(createVerticalBorderLine(' ' + currentLine, v, v, CARD_WIDTH));
    }
  } else {
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
  }

  // Notes section (character personality)
  if (card.notes) {
    // Blank line before notes (extra spacing from ability description)
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
    
    // Notes header
    lines.push(createVerticalBorderLine(' ✎ Notes', v, v, CARD_WIDTH));
    
    // Blank line after header
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
    
    // Notes text (wrapped, with padding)
    const maxNotesWidth = CARD_WIDTH - 5;
    const notesWords = card.notes.split(' ');
    let currentNotesLine = '';
    
    for (const word of notesWords) {
      if ((currentNotesLine + ' ' + word).trim().length <= maxNotesWidth) {
        currentNotesLine = (currentNotesLine + ' ' + word).trim();
      } else {
        if (currentNotesLine) {
          lines.push(createVerticalBorderLine(' ' + currentNotesLine, v, v, CARD_WIDTH));
        }
        currentNotesLine = word;
      }
    }
    if (currentNotesLine) {
      lines.push(createVerticalBorderLine(' ' + currentNotesLine, v, v, CARD_WIDTH));
    }
  }

  // Footer should have exactly 27 lines to achieve 80x60 card
  // Target is 25 at this point (template and bottom border add 2 more lines to reach 27)
  const fillerCount = Math.max(0, 25 - lines.length);
  
  // Remaining filler lines
  for (let i = 0; i < fillerCount; i++) {
    lines.push(createVerticalBorderLine('', v, v, CARD_WIDTH));
  }

  // 24. Template ID line
  const templateLine = `Template: #${card.template_id} | Mint: ${card.mint_number}`;
  lines.push(createVerticalBorderLine(templateLine, v, v, CARD_WIDTH));

  // 25. Bottom border (use rarity-based border)
  lines.push(createHorizontalBorder(CARD_WIDTH, borderStyle.bl, borderStyle.br, borderStyle.h));

  return lines;
}

/**
 * Embeds art into the card frame with rarity border
 * @param art - The ASCII art (must be ART_WIDTH x ART_HEIGHT)
 * @param rarity - Rarity for border style (default 'common')
 * @returns Array of art lines with rarity borders, centered in card
 * @throws DimensionError if art dimensions are wrong
 */
export function embedArt(art: string, rarity: string = 'common'): string[] {
  validateArtDimensions(art, ART_WIDTH, ART_HEIGHT);

  const artLines = art.split('\n');
  const borderStyle = RARITY_ART_BORDERS[rarity.toLowerCase()] || RARITY_ART_BORDERS.common;
  const cardBorderStyle = RARITY_BORDERS[rarity.toLowerCase()] || RARITY_BORDERS.common;
  const cv = cardBorderStyle.v; // card vertical border
  const av = borderStyle.v; // art box vertical border

  // Calculate centering accounting for card's vertical borders (v on each side)
  // Card width: 80, minus 2 for card borders = 78 available
  // Art with rarity borders: 70 + 2 = 72
  // Remaining: 78 - 72 = 6, so 3 spaces on each side
  const availableForArt = CARD_WIDTH - 2; // subtract card borders
  const artWithBordersWidth = ART_WIDTH + 2;
  const sideSpaces = Math.floor((availableForArt - artWithBordersWidth) / 2);

  const borderedLines: string[] = [];

  // Top border of art box with card vertical borders on sides
  const topBorder = cv + ' '.repeat(sideSpaces) + 
    borderStyle.tl + borderStyle.h.repeat(ART_WIDTH) + borderStyle.tr +
    ' '.repeat(sideSpaces) + cv;
  borderedLines.push(topBorder);

  // Art lines with rarity border and centering
  for (const line of artLines) {
    const paddedLine = cv + ' '.repeat(sideSpaces) + av + line + av + ' '.repeat(sideSpaces) + cv;
    borderedLines.push(paddedLine);
  }

  // Bottom border of art box
  const bottomBorder = cv + ' '.repeat(sideSpaces) + 
    borderStyle.bl + borderStyle.h.repeat(ART_WIDTH) + borderStyle.br +
    ' '.repeat(sideSpaces) + cv;
  borderedLines.push(bottomBorder);

  return borderedLines;
}

/**
 * Validates that card fields are within character limits
 * @param card - Card data to validate
 * @throws Error if any field exceeds its limit
 */
function validateFieldLimits(card: Card): void {
  const errors: string[] = [];
  
  if (card.agent_name && card.agent_name.length > CARD_FIELD_LIMITS.agent_name) {
    errors.push(`agent_name exceeds ${CARD_FIELD_LIMITS.agent_name} characters`);
  }
  
  if (card.class && card.class.length > CARD_FIELD_LIMITS.class) {
    errors.push(`class exceeds ${CARD_FIELD_LIMITS.class} characters`);
  }
  
  if (card.special_ability && card.special_ability.length > CARD_FIELD_LIMITS.special_ability) {
    errors.push(`special_ability exceeds ${CARD_FIELD_LIMITS.special_ability} characters`);
  }
  
  if (card.ability_description) {
    const wordCount = card.ability_description.split(' ').filter(w => w.length > 0).length;
    if (wordCount > CARD_FIELD_LIMITS.ability_description_words) {
      errors.push(`ability_description exceeds ${CARD_FIELD_LIMITS.ability_description_words} words`);
    }
  }
  
  if (card.notes) {
    const wordCount = card.notes.split(' ').filter(w => w.length > 0).length;
    if (wordCount > CARD_FIELD_LIMITS.notes_words) {
      errors.push(`notes exceeds ${CARD_FIELD_LIMITS.notes_words} words`);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Card field validation failed: ${errors.join('; ')}`);
  }
}

/**
 * Composes a complete card from components
 * @param card - Card data
 * @param art - The ASCII art (must be 70x26)
 * @returns Complete card as string
 * @throws DimensionError if art dimensions are wrong
 */
export function composeCard(card: Card, art: string): string {
  validateArtDimensions(art, ART_WIDTH, ART_HEIGHT);
  validateFieldLimits(card);

  const header = createCardHeader(card);
  const artSection = embedArt(art, card.rarity);
  const footer = createCardFooter(card);

  const allLines = [...header, ...artSection, ...footer];

  // Verify total height
  if (allLines.length !== CARD_HEIGHT) {
    throw new Error(
      `Card composition error: expected ${CARD_HEIGHT} lines, got ${allLines.length}`
    );
  }

  return allLines.join('\n');
}

/**
 * Generates a default blank art placeholder
 * Simple pattern that is guaranteed to be exactly 70x40
 * @returns Default 70x40 ASCII art
 */
export function generateDefaultLandscapeArt(): string {
  const lines: string[] = [];

  // Create simple gradient pattern - exactly 40 lines of 70 characters each
  for (let row = 0; row < ART_HEIGHT; row++) {
    const shade = row < 13 ? '█' : row < 27 ? '▓' : '▒';
    lines.push(shade.repeat(ART_WIDTH));
  }

  return lines.join('\n');
}

/**
 * Generates a complete card with default landscape art
 * @param card - Card data
 * @returns Complete card as string
 */
export function generateCardWithDefaultArt(card: Card): string {
  const defaultArt = generateDefaultLandscapeArt();
  return composeCard(card, defaultArt);
}

/**
 * Renders a card for display in terminal
 * @param card - Card data
 * @param art - Optional custom art (must be 70x40)
 * @returns Formatted card string
 */
export function renderCard(card: Card, art?: string): string {
  if (art) {
    return composeCard(card, art);
  }
  return generateCardWithDefaultArt(card);
}
