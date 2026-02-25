import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawn, execSync } from 'child_process';

/**
 * Beautiful Card Display Format
 */
export class CardFormatter {
  private card: Record<string, any>;
  private asciiArt: string;
  private data: Record<string, any>;

  constructor(responseData: any) {
    this.data = responseData;
    this.card = responseData.card || {};
    this.asciiArt = responseData.ascii_card || '';
  }

  /**
   * Display card with ANSI formatting
   */
  display(): void {
    this.displayHeader();
    this.displayAsciiArt();
    this.displayDetails();
    this.displayFooter();
  }

  private displayHeader(): void {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           CARD INSPECTION                                    ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
  }

  private displayAsciiArt(): void {
    if (!this.asciiArt) return;

    // Create temporary file with the ASCII art
    const tempDir = tmpdir();
    const timestamp = Date.now();
    const tempFile = join(tempDir, `card_${timestamp}.txt`);

    try {
      writeFileSync(tempFile, this.asciiArt, 'utf-8');
      
      // Display using less with color support
      execSync(`less -R "${tempFile}"`, { stdio: 'inherit' });
      
      // Clean up
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    } catch (error) {
      // Fallback: show just the header
      console.log('  [Card Visual - ANSI formatted] (displayed in less)');
    }
  }

  private displayDetails(): void {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                          CARD INFORMATION                                    ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    const c = this.card;
    
    // Basic info
    console.log('  ┌─ CARD DETAILS');
    console.log('  │');
    console.log(`  │ Name:       ${c.agent_name || 'Unknown'}`);
    console.log(`  │ Class:      ${c.class || 'Unknown'}`);
    console.log(`  │ Element:    ${c.element || 'Unknown'}`);
    console.log(`  │ Rarity:     ${c.rarity || 'Unknown'}`);
    console.log(`  │ Power:      ${c.total_power || 'N/A'}`);
    console.log(`  │ Mint #:     ${c.mint_number || 'N/A'}`);
    console.log(`  │ Created:    ${c.created_at || 'N/A'}`);
    console.log('  │');
    
    // Stats
    console.log('  ├─ STATISTICS');
    console.log('  │');
    console.log(`  │ STR: ${this.pad(c.str, 4)}    INT: ${this.pad(c.int, 4)}    CHA: ${this.pad(c.cha, 4)}`);
    console.log(`  │ WIS: ${this.pad(c.wis, 4)}    DEX: ${this.pad(c.dex, 4)}    KAR: ${this.pad(c.kar, 4)}`);
    console.log('  │');
    
    // Modifiers
    console.log('  ├─ MODIFIERS');
    console.log('  │');
    console.log(`  │ STR: +${this.pad(c.str_mod, 2)}    INT: +${this.pad(c.int_mod, 2)}    CHA: +${this.pad(c.cha_mod, 2)}`);
    console.log(`  │ WIS: +${this.pad(c.wis_mod, 2)}    DEX: +${this.pad(c.dex_mod, 2)}`);
    console.log('  │');
    
    // Ability
    console.log('  ├─ ABILITY');
    console.log('  │');
    console.log(`  │ ${c.special_ability || 'Unknown'}`);
    console.log('  │');
    console.log(`  │ ${c.ability_description || 'Unknown'}`);
    console.log('  │');
    
    // Notes
    if (c.notes) {
      console.log('  ├─ NOTES');
      console.log('  │');
      console.log(`  │ ${c.notes}`);
      console.log('  │');
    }
    
    // Technical data
    console.log('  ├─ SYSTEM DATA');
    console.log('  │');
    console.log(`  │ ID: ${c.id || 'N/A'}`);
    console.log(`  │ Template ID: ${c.template_id || 'N/A'}`);
    console.log(`  │ Owner: ${c.owner_agent_id || 'N/A'}`);
    console.log('  │');
  }

  private displayFooter(): void {
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  }

  private pad(value: any, length: number): string {
    const str = String(value || 'N/A');
    return str.padStart(length);
  }

  /**
   * Get formatted JSON output
   */
  toJson(): string {
    return JSON.stringify({
      success: this.data.success,
      card: this.card,
    }, null, 2);
  }

  /**
   * Get simplified text output
   */
  toText(): string {
    const c = this.card;
    return `
Card: ${c.agent_name || 'Unknown'}
Class: ${c.class || 'Unknown'}
Element: ${c.element || 'Unknown'}
Rarity: ${c.rarity || 'Unknown'}
Power: ${c.total_power || 'N/A'}

Stats:
  STR: ${c.str || 'N/A'} | INT: ${c.int || 'N/A'} | CHA: ${c.cha || 'N/A'}
  WIS: ${c.wis || 'N/A'} | DEX: ${c.dex || 'N/A'} | KAR: ${c.kar || 'N/A'}

Ability: ${c.special_ability || 'Unknown'}
  ${c.ability_description || 'Unknown'}

${c.notes ? `Notes: ${c.notes}` : ''}
`.trim();
  }
}

/**
 * Main display function
 */
export function displayCard(responseData: any, format: 'pretty' | 'json' | 'text' = 'pretty'): void {
  const formatter = new CardFormatter(responseData);

  if (format === 'pretty') {
    formatter.display();
  } else if (format === 'json') {
    console.log(formatter.toJson());
  } else {
    console.log(formatter.toText());
  }
}