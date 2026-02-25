import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawn } from 'child_process';

/**
 * Save ANSI formatted text to temporary file and display it
 * @param text - ANSI formatted text
 * @param title - Optional title for the file
 */
export function displayAnsiText(text: string, title: string = 'card-preview'): void {
  // Create temporary file
  const timestamp = Date.now();
  const tempDir = tmpdir();
  const tempFile = join(tempDir, `${title}_${timestamp}.txt`);
  
  try {
    // Write text to temporary file
    writeFileSync(tempFile, text, 'utf-8');
    
    // Try to display with different tools
    displayWithPager(tempFile);
    
    // Clean up after display
    setTimeout(() => {
      try {
        unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }, 5000);
  } catch (error) {
    console.error('Failed to display text:', error);
    // Fallback: print truncated text
    console.log(text.substring(0, 2000));
  }
}

/**
 * Try to display file with different pagers
 */
function displayWithPager(tempFile: string): void {
  const pagers = [
    { cmd: 'less', args: ['-R', tempFile], name: 'less' },
    { cmd: 'cat', args: [tempFile], name: 'cat' },
    { cmd: 'more', args: [tempFile], name: 'more' },
  ];
  
  for (const pager of pagers) {
    try {
      const proc = spawn(pager.cmd, pager.args, {
        stdio: 'inherit',
        shell: true,
      });
      
      proc.on('error', (err) => {
        if (pager.name === 'cat') {
          // Last resort: read and print manually
          const content = readFileSync(tempFile, 'utf-8');
          console.log(content);
        }
      });
      
      return; // Stop after first successful pager
    } catch (error) {
      // Try next pager
    }
  }
}

/**
 * Display card information with ANSI formatting
 */
export function displayCardAnsi(text: string): void {
  console.log('\n' + '='.repeat(60));
  console.log('CARD INSPECTION (with ANSI formatting)');
  console.log('='.repeat(60));
  
  // Display with temporary file
  displayAnsiText(text, 'card-inspection');
}

/**
 * Extract and display just the ASCII art from card
 */
export function displayCardAsciiArt(text: string): void {
  const asciiArtPattern = /([\u2500-\u257F]+[\s\S]*?[\u2500-\u257F]+)/g;
  const matches = text.match(asciiArtPattern);
  
  if (matches) {
    console.log('\n' + '='.repeat(40));
    console.log('CARD VISUAL');
    console.log('='.repeat(40));
    
    // Save ASCII art to temp file
    const asciiText = matches.join('\n\n');
    displayAnsiText(asciiText, 'card-visual');
  }
}

/**
 * Parse and display card data as structured text
 */
export function displayCardStructure(text: string): void {
  const cleanText = text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  const lines = cleanText.split('\n');
  
  console.log('\n' + '='.repeat(60));
  console.log('CARD DETAILS');
  console.log('='.repeat(60));
  
  let inCardSection = false;
  let cardData: Record<string, string> = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('Card Details') || trimmed.includes('CARD DETAILS')) {
      inCardSection = true;
      continue;
    }
    
    if (trimmed === '' && inCardSection) {
      inCardSection = false;
      continue;
    }
    
    if (inCardSection) {
      const match = trimmed.match(/^([A-Z][\w\s]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        cardData[key] = value;
      }
    }
  }
  
  // Display structured data
  if (Object.keys(cardData).length > 0) {
    for (const [key, value] of Object.entries(cardData)) {
      console.log(`${key}: ${value}`);
    }
  } else {
    // Fallback: show first few lines
    console.log('Raw output (first 20 lines):');
    console.log('-'.repeat(40));
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      console.log(lines[i]);
    }
  }
  
  console.log('='.repeat(60));
}

/**
 * Main function to handle card inspection output
 */
export function handleCardOutput(text: string, format: 'ansi' | 'simple' | 'both' = 'both'): void {
  try {
    // Try to parse as JSON first
    const data = JSON.parse(text);
    
    // Check for errors
    if (data.success === false) {
      console.error('❌ Error:', data.error);
      return;
    }
    
    if (data.ascii_card) {
      // Has ASCII card art - show it beautifully
      displayAsciiCard(data.ascii_card);
    }
    
    if (data.card) {
      // Display card information elegantly
      displayCardInfo(data.card);
    }
  } catch (e) {
    // If not valid JSON, treat as raw text
    if (format === 'ansi' || format === 'both') {
      displayCardAnsi(text);
      
      if (format === 'both') {
        console.log('\n');
        displayCardStructure(text);
      }
    } else {
      displayCardStructure(text);
    }
  }
}

/**
 * Display ASCII card art elegantly
 */
function displayAsciiCard(asciiArt: string): void {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              CARD VISUAL                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Directly output the ANSI formatted text to stdout
  // This preserves all ANSI color codes and formatting
  process.stdout.write(asciiArt);
  console.log(''); // Add newline at the end
  
  // Ensure terminal is reset
  process.stdout.write('\x1b[0m');
}

/**
 * Display card information elegantly
 */
function displayCardInfo(card: Record<string, any>): void {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                             CARD DETAILS                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  
  // Basic Info
  console.log(`\n┌─ CARD INFORMATION ${'─'.repeat(55)}`);
  console.log(`│`);
  console.log(`│ Name:      ${card.agent_name || 'Unknown'}`);
  console.log(`│ Class:     ${card.class || 'Unknown'}`);
  console.log(`│ Element:   ${card.element || 'Unknown'}`);
  console.log(`│ Rarity:    ${card.rarity || 'Unknown'}`);
  console.log(`│ Power:     ${card.total_power || 'N/A'}`);
  console.log(`│ Mint #:    ${card.mint_number || 'N/A'}`);
  console.log(`│ Created:   ${card.created_at || 'N/A'}`);
  console.log(`│`);
  
  // Stats
  console.log(`├─ STATS ${'─'.repeat(62)}`);
  console.log(`│`);
  console.log(`│ STR: ${String(card.str || 'N/A').padStart(4)}    INT: ${String(card.int || 'N/A').padStart(4)}    CHA: ${String(card.cha || 'N/A').padStart(4)}`);
  console.log(`│ WIS: ${String(card.wis || 'N/A').padStart(4)}    DEX: ${String(card.dex || 'N/A').padStart(4)}    KAR: ${String(card.kar || 'N/A').padStart(4)}`);
  
  // Total Power
  if (card.total_power) {
    console.log(`│`);
    console.log(`│ Total Power: ${card.total_power}`);
  }
  console.log(`│`);
  
  // Ability
  console.log(`├─ ABILITY ${'─'.repeat(61)}`);
  console.log(`│`);
  console.log(`│ ${card.special_ability || 'Unknown'}`);
  console.log(`│`);
  console.log(`│ ${card.ability_description || 'Unknown'}`);
  
  // Notes
  if (card.notes) {
    console.log(`│`);
    console.log(`├─ NOTES ${'─'.repeat(63)}`);
    console.log(`│`);
    console.log(`│ ${card.notes}`);
  }
  
  // Card ID
  console.log(`│`);
  console.log(`├─ CARD DATA ${'─'.repeat(58)}`);
  console.log(`│`);
  console.log(`│ ID: ${card.id || 'N/A'}`);
  console.log(`│ Template ID: ${card.template_id || 'N/A'}`);
  console.log(`│ Owner: ${card.owner_agent_id || 'N/A'}`);
  console.log(`│`);
  console.log(`╚${'═'.repeat(78)}╝`);
}