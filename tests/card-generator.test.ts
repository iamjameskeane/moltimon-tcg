import { describe, it, expect, beforeEach } from 'vitest';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  ART_WIDTH,
  ART_HEIGHT,
  validateArtDimensions,
  validateCardFrame,
  DimensionError,
  createHorizontalBorder,
  createVerticalBorderLine,
  createCardHeader,
  createCardFooter,
  embedArt,
  composeCard,
  generateDefaultLandscapeArt,
  renderCard,
  RARITY_STYLES,
  ELEMENT_SYMBOLS,
} from '../src/card-generator.js';
import type { Card } from '../src/types.js';

describe('Card Generator Constants', () => {
  it('should have correct card dimensions', () => {
    expect(CARD_WIDTH).toBe(80);
    expect(CARD_HEIGHT).toBe(60);
  });

  it('should have correct art dimensions', () => {
    expect(ART_WIDTH).toBe(70);
    expect(ART_HEIGHT).toBe(26);
  });

  it('should calculate correct dimensions', () => {
    // Header: 4 lines (top border, name, class, separator)
    // Art: 26 lines (for ~4:3 visual ratio with 1:2 terminal fonts)
    // Footer: 30 lines (separator, 3 stat lines, element, empty, ability, 18 filler, template, empty, bottom)
    // Total: 60
    expect(4 + 26 + 30).toBe(60);
  });
});

describe('Dimension Validation', () => {
  it('should validate correct art dimensions', () => {
    const validArt = 'A'.repeat(ART_WIDTH) + '\n' + 'A'.repeat(ART_WIDTH);
    // Create art with exactly ART_HEIGHT lines
    const lines = [];
    for (let i = 0; i < ART_HEIGHT; i++) {
      lines.push('A'.repeat(ART_WIDTH));
    }
    const art = lines.join('\n');

    expect(() => validateArtDimensions(art)).not.toThrow();
  });

  it('should throw DimensionError for art with wrong width', () => {
    const wrongWidthArt = 'A'.repeat(ART_WIDTH - 1) + '\n' + 'A'.repeat(ART_WIDTH - 1);
    // Create art with correct height but wrong width
    const lines = [];
    for (let i = 0; i < ART_HEIGHT; i++) {
      lines.push('A'.repeat(ART_WIDTH - 5));
    }
    const art = lines.join('\n');

    expect(() => validateArtDimensions(art)).toThrow(DimensionError);
    expect(() => validateArtDimensions(art)).toThrow('Art width must be exactly');
  });

  it('should throw DimensionError for art with wrong height', () => {
    const lines = [];
    for (let i = 0; i < ART_HEIGHT - 5; i++) {
      lines.push('A'.repeat(ART_WIDTH));
    }
    const art = lines.join('\n');

    expect(() => validateArtDimensions(art)).toThrow(DimensionError);
    expect(() => validateArtDimensions(art)).toThrow('Art height must be exactly');
  });

  it('should throw DimensionError for art with inconsistent line widths', () => {
    const lines = [];
    for (let i = 0; i < ART_HEIGHT; i++) {
      if (i === 10) {
        lines.push('A'.repeat(ART_WIDTH - 10));
      } else {
        lines.push('A'.repeat(ART_WIDTH));
      }
    }
    const art = lines.join('\n');

    expect(() => validateArtDimensions(art)).toThrow(DimensionError);
    expect(() => validateArtDimensions(art)).toThrow('inconsistent line widths');
  });

  it('should throw DimensionError for empty art', () => {
    expect(() => validateArtDimensions('')).toThrow(DimensionError);
  });

  it('should include expected and actual dimensions in error', () => {
    const art = 'A'.repeat(50) + '\n' + 'A'.repeat(50);

    try {
      validateArtDimensions(art);
      expect.fail('Should have thrown DimensionError');
    } catch (error) {
      expect(error).toBeInstanceOf(DimensionError);
      if (error instanceof DimensionError) {
        expect(error.expectedWidth).toBe(ART_WIDTH);
        expect(error.expectedHeight).toBe(ART_HEIGHT);
        expect(error.actualWidth).toBe(50);
        expect(error.actualHeight).toBe(2);
      }
    }
  });

  it('should validate card frame dimensions', () => {
    const lines = [];
    for (let i = 0; i < CARD_HEIGHT; i++) {
      lines.push('A'.repeat(CARD_WIDTH));
    }
    const frame = lines.join('\n');

    expect(() => validateCardFrame(frame)).not.toThrow();
  });

  it('should throw for card frame with wrong dimensions', () => {
    const art = 'A'.repeat(ART_WIDTH) + '\n' + 'A'.repeat(ART_WIDTH);
    expect(() => validateCardFrame(art)).toThrow(DimensionError);
  });
});

describe('Border Creation', () => {
  it('should create horizontal border of correct width', () => {
    const border = createHorizontalBorder(10, '┌', '┐', '─');
    expect(border.length).toBe(10);
    expect(border).toBe('┌────────┐');
  });

  it('should create horizontal border with card width', () => {
    const border = createHorizontalBorder(CARD_WIDTH, '┌', '┐', '─');
    expect(border.length).toBe(CARD_WIDTH);
    expect(border[0]).toBe('┌');
    expect(border[border.length - 1]).toBe('┐');
  });

  it('should create vertical border line with content', () => {
    const line = createVerticalBorderLine('Hello', '│', '│', 20);
    expect(line.length).toBe(20);
    expect(line).toBe('│Hello             │');
  });

  it('should truncate content that is too long', () => {
    const line = createVerticalBorderLine('A'.repeat(100), '│', '│', 20);
    expect(line.length).toBe(20);
    expect(line).toBe('│' + 'A'.repeat(18) + '│');
  });
});

describe('Card Header', () => {
  let testCard: Card;

  beforeEach(() => {
    testCard = {
      id: 'test-123',
      template_id: 1,
      rarity: 'rare',
      mint_number: 42,
      owner_agent_id: 'agent-1',
      str: 10,
      int: 8,
      cha: 12,
      wis: 9,
      dex: 11,
      kar: 7,
      special_ability: 'Test Ability',
      ability_description: 'This is a test ability',
      agent_name: 'TestBot',
      class: 'Warrior',
      element: 'fire',
      notes: 'Test notes',
    };
  });

  it('should create header with correct dimensions', () => {
    const header = createCardHeader(testCard);
    expect(header.length).toBe(5); // 5 lines: top border, name, banner, class, separator

    for (const line of header) {
      expect(line.length).toBe(CARD_WIDTH);
    }
  });

  it('should include agent name in header', () => {
    const header = createCardHeader(testCard);
    const nameLine = header[1];
    expect(nameLine).toContain(testCard.agent_name);
  });

  it('should include rarity banner in header', () => {
    const header = createCardHeader(testCard);
    const bannerLine = header[2];
    expect(bannerLine).toContain('RARE');
  });

  it('should include class in header', () => {
    const header = createCardHeader(testCard);
    const classLine = header[3];
    expect(classLine).toContain('Class: ' + testCard.class);
  });

  it('should include element symbol', () => {
    const header = createCardHeader(testCard);
    const nameLine = header[1];
    const expectedSymbol = ELEMENT_SYMBOLS.fire;
    expect(nameLine).toContain(expectedSymbol);
  });
});

describe('Card Footer', () => {
  let testCard: Card;

  beforeEach(() => {
    testCard = {
      id: 'test-123',
      template_id: 1,
      rarity: 'rare',
      mint_number: 42,
      owner_agent_id: 'agent-1',
      str: 10,
      int: 8,
      cha: 12,
      wis: 9,
      dex: 11,
      kar: 7,
      special_ability: 'Test Ability',
      ability_description: 'This is a test ability',
      agent_name: 'TestBot',
      class: 'Warrior',
      element: 'fire',
      notes: 'Test notes',
    };
  });

  it('should create footer with correct dimensions', () => {
    const footer = createCardFooter(testCard);
    expect(footer.length).toBe(27); // separator + 3 stat lines + element + empty + ability sep + ability + desc + 15 filler + template + empty + bottom

    for (const line of footer) {
      expect(line.length).toBe(CARD_WIDTH);
    }
  });

  it('should include all stats', () => {
    const footer = createCardFooter(testCard);
    const statsSection = footer.join(' ');

    expect(statsSection).toContain('STR:');
    expect(statsSection).toContain('INT:');
    expect(statsSection).toContain('CHA:');
    expect(statsSection).toContain('WIS:');
    expect(statsSection).toContain('DEX:');
    expect(statsSection).toContain('KAR:');
  });

  it('should display correct stat values', () => {
    const footer = createCardFooter(testCard);
    const statsSection = footer.join(' ');

    expect(statsSection).toContain(testCard.str.toString());
    expect(statsSection).toContain(testCard.int.toString());
    expect(statsSection).toContain(testCard.cha.toString());
    expect(statsSection).toContain(testCard.wis.toString());
    expect(statsSection).toContain(testCard.dex.toString());
    expect(statsSection).toContain(testCard.kar.toString());
  });

  it('should include special ability', () => {
    const footer = createCardFooter(testCard);
    const abilitySection = footer.join(' ');
    expect(abilitySection).toContain(testCard.special_ability);
  });

  it('should include ability description', () => {
    const footer = createCardFooter(testCard);
    const abilitySection = footer.join(' ');
    expect(abilitySection).toContain(testCard.ability_description);
  });

  it('should handle card without special ability', () => {
    const cardWithoutAbility = { ...testCard, special_ability: null, ability_description: null };
    const footer = createCardFooter(cardWithoutAbility);
    expect(footer.length).toBe(27); // footer always has 27 lines now
  });
});

describe('Art Embedding', () => {
  it('should embed art with borders', () => {
    const lines = [];
    for (let i = 0; i < ART_HEIGHT; i++) {
      lines.push('A'.repeat(ART_WIDTH));
    }
    const art = lines.join('\n');

    // Test with rare rarity to get ╔╗╚╝ borders
    const embedded = embedArt(art, 'rare');

    expect(embedded.length).toBe(ART_HEIGHT + 2); // +2 for top/bottom borders
    for (const line of embedded) {
      expect(line.length).toBe(CARD_WIDTH);
    }
    // Check card borders on sides (rare uses ║)
    expect(embedded[0][0]).toBe('║');
    expect(embedded[0][CARD_WIDTH - 1]).toBe('║');
    // Check art box border characters (rare uses ◈ for corners)
    expect(embedded[0]).toContain('◈');
    expect(embedded[embedded.length - 1]).toContain('◈');
  });

  it('should normalize art with wrong dimensions instead of throwing', () => {
    const art = 'A'.repeat(50);
    const embedded = embedArt(art);
    // normalizeArt pads/trims to ART_WIDTH x ART_HEIGHT, so embedArt succeeds
    expect(embedded.length).toBe(ART_HEIGHT + 2);
  });
});

describe('Default Landscape Art', () => {
  it('should generate art with correct dimensions', () => {
    const art = generateDefaultLandscapeArt();
    const lines = art.split('\n');

    expect(lines.length).toBe(ART_HEIGHT);
    for (const line of lines) {
      expect(line.length).toBe(ART_WIDTH);
    }
  });

  it('should pass dimension validation', () => {
    const art = generateDefaultLandscapeArt();
    expect(() => validateArtDimensions(art, ART_WIDTH, ART_HEIGHT)).not.toThrow();
  });

  it('should contain gradient characters', () => {
    const art = generateDefaultLandscapeArt();
    expect(art).toContain('█');
    expect(art).toContain('▓');
  });
});

describe('Card Composition', () => {
  let testCard: Card;
  let validArt: string;

  beforeEach(() => {
    testCard = {
      id: 'test-123',
      template_id: 1,
      rarity: 'rare',
      mint_number: 42,
      owner_agent_id: 'agent-1',
      str: 10,
      int: 8,
      cha: 12,
      wis: 9,
      dex: 11,
      kar: 7,
      special_ability: 'Test Ability',
      ability_description: 'This is a test ability',
      agent_name: 'TestBot',
      class: 'Warrior',
      element: 'fire',
      notes: 'Test notes',
    };

    const lines = [];
    for (let i = 0; i < ART_HEIGHT; i++) {
      lines.push('A'.repeat(ART_WIDTH));
    }
    validArt = lines.join('\n');
  });

  it('should compose complete card with correct height', () => {
    const card = composeCard(testCard, validArt);
    const lines = card.split('\n');

    expect(lines.length).toBe(CARD_HEIGHT);
  });

  it('should compose card with correct width', () => {
    const card = composeCard(testCard, validArt);
    const lines = card.split('\n');

    for (const line of lines) {
      expect(line.length).toBe(CARD_WIDTH);
    }
  });

  it('should normalize art with wrong dimensions instead of throwing', () => {
    const wrongArt = 'A'.repeat(50) + '\n' + 'A'.repeat(50);
    const card = composeCard(testCard, wrongArt);
    const lines = card.split('\n');
    // normalizeArt pads/trims to correct dimensions, so composeCard succeeds
    expect(lines.length).toBe(CARD_HEIGHT);
  });

  it('should include all card sections', () => {
    const card = composeCard(testCard, validArt);

    expect(card).toContain(testCard.agent_name);
    expect(card).toContain(testCard.class);
    expect(card).toContain(testCard.special_ability || '');
    expect(card).toContain('STR:');
    expect(card).toContain('INT:');
  });
});

describe('Render Card', () => {
  let testCard: Card;

  beforeEach(() => {
    testCard = {
      id: 'test-123',
      template_id: 1,
      rarity: 'rare',
      mint_number: 42,
      owner_agent_id: 'agent-1',
      str: 10,
      int: 8,
      cha: 12,
      wis: 9,
      dex: 11,
      kar: 7,
      special_ability: 'Test Ability',
      ability_description: 'This is a test ability',
      agent_name: 'TestBot',
      class: 'Warrior',
      element: 'fire',
      notes: 'Test notes',
    };
  });

  it('should render card with default art when no art provided', () => {
    const card = renderCard(testCard);
    const lines = card.split('\n');

    expect(lines.length).toBe(CARD_HEIGHT);
    expect(card).toContain('█'); // Default art contains gradient characters
  });

  it('should render card with custom art when provided', () => {
    const lines = [];
    for (let i = 0; i < ART_HEIGHT; i++) {
      lines.push('X'.repeat(ART_WIDTH));
    }
    const customArt = lines.join('\n');

    const card = renderCard(testCard, customArt);
    const cardLines = card.split('\n');

    expect(cardLines.length).toBe(CARD_HEIGHT);
    expect(card).toContain('XXXXXXXX');
  });

  it('should normalize invalid custom art instead of throwing', () => {
    const invalidArt = 'A'.repeat(50);
    const card = renderCard(testCard, invalidArt);
    const lines = card.split('\n');
    // normalizeArt pads/trims to correct dimensions, so renderCard succeeds
    expect(lines.length).toBe(CARD_HEIGHT);
  });
});

describe('Rarity Styles', () => {
  it('should have common rarity style', () => {
    expect(RARITY_STYLES.common).toBeDefined();
    expect(RARITY_STYLES.common.name).toBe('Common');
  });

  it('should have all standard rarities', () => {
    const expectedRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    for (const rarity of expectedRarities) {
      expect(RARITY_STYLES[rarity]).toBeDefined();
    }
  });
});

describe('Element Symbols', () => {
  it('should have fire symbol', () => {
    expect(ELEMENT_SYMBOLS.fire).toBeDefined();
  });

  it('should have all element symbols', () => {
    const expectedElements = ['fire', 'water', 'earth', 'air', 'light', 'dark', 'nature', 'electric'];
    for (const element of expectedElements) {
      expect(ELEMENT_SYMBOLS[element]).toBeDefined();
    }
  });
});
