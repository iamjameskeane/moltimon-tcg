/**
 * ANSI utilities for handling formatted text output
 */

export function stripAnsiCodes(text: string): string {
  // Remove ANSI escape codes
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

export function detectAnsi(text: string): boolean {
  // Check if text contains ANSI escape codes
  return /\x1b\[[0-9;]*[a-zA-Z]/.test(text);
}

export function formatAnsiForTerminal(text: string): string {
  // Ensure text is properly formatted for terminal output
  // Remove any potential control characters that might break terminal
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function splitAnsiLines(text: string): string[] {
  // Split text into lines while preserving ANSI codes
  const lines = text.split(/\r?\n/);
  return lines.map(line => formatAnsiForTerminal(line));
}

export function truncateText(text: string, maxLength: number = 2000): string {
  // Truncate text to avoid overwhelming terminal
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const remaining = text.length - maxLength;
  
  return `${truncated}\n\n... (truncated ${remaining} characters)`;
}

export function extractAsciiArt(text: string): string | null {
  // Try to extract ASCII art from text
  const lines = text.split('\n');
  const asciiArtLines: string[] = [];
  let inAsciiArt = false;
  
  for (const line of lines) {
    const stripped = stripAnsiCodes(line);
    
    // Look for ASCII art patterns (lines with special characters)
    if (stripped.match(/^[|#+*-=]+[\s\S]*[|#+*-=]+$/) || 
        stripped.match(/^[╔╚═╗╝]+[\s\S]*[╔╚═╗╝]+$/) ||
        stripped.match(/^\s*[\w\s]+\s*$/)) {
      asciiArtLines.push(line);
      inAsciiArt = true;
    } else if (inAsciiArt && stripped.trim() === '') {
      asciiArtLines.push(line);
    } else if (inAsciiArt) {
      break;
    }
  }
  
  return asciiArtLines.length > 0 ? asciiArtLines.join('\n') : null;
}

export function parseCardFromText(text: string): any | null {
  // Try to parse card information from ANSI formatted text
  try {
    // Remove ANSI codes first
    const cleanText = stripAnsiCodes(text);
    
    // Try to find JSON data
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Try to extract key-value pairs
    const cardData: Record<string, any> = {};
    const lines = cleanText.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\s*([A-Z][\w\s]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        const value = match[2].trim();
        cardData[key] = value;
      }
    }
    
    return Object.keys(cardData).length > 0 ? cardData : null;
  } catch (error) {
    return null;
  }
}

export function renderCardSimple(text: string): string {
  // Extract and render card information in a simple format
  const cleanText = stripAnsiCodes(text);
  const lines = cleanText.split('\n');
  
  const result: string[] = [];
  let inCardSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('Card Details') || trimmed.includes('Card Information')) {
      result.push('=== CARD DETAILS ===');
      inCardSection = true;
      continue;
    }
    
    if (inCardSection) {
      if (trimmed === '') {
        result.push('');
        inCardSection = false;
        continue;
      }
      
      // Parse key-value pairs
      const match = trimmed.match(/^([A-Z][\w\s]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        result.push(`${key}: ${value}`);
      }
    }
  }
  
  return result.join('\n');
}