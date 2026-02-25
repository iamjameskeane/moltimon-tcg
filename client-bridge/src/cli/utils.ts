import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { ClientConfig, CLIOptions } from '../types/index.js';
import {
  stripAnsiCodes,
  detectAnsi,
  formatAnsiForTerminal,
  splitAnsiLines,
  truncateText,
  extractAsciiArt,
  parseCardFromText,
  renderCardSimple,
} from './ansi-utils.js';

const CONFIG_PATH = join(homedir(), '.moltimon.json');

export async function loadConfig(options?: CLIOptions): Promise<ClientConfig> {
  // Priority: 1. Options, 2. Environment, 3. Config file, 4. Defaults
  const envConfig: Partial<ClientConfig> = {
    serverUrl: process.env.MCP_SERVER_URL || process.env.MOLTIMON_SERVER_URL,
    apiKey: process.env.MOLTBOOK_API_KEY || process.env.TEST_API_KEY || process.env.MOLTBOOK_API_KEY,
  };

  const fileConfig: Partial<ClientConfig> = existsSync(CONFIG_PATH)
    ? JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
    : {};

  const finalConfig: ClientConfig = {
    serverUrl: options?.serverUrl || envConfig.serverUrl || fileConfig.serverUrl || 'https://moltimon.live',
    apiKey: options?.apiKey || envConfig.apiKey || fileConfig.apiKey || 'test_key',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
  };

  return finalConfig;
}

export async function saveConfig(config: Partial<ClientConfig>): Promise<void> {
  const existing = existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) : {};
  const merged = { ...existing, ...config };
  writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
}

export function formatOutput(data: any, format: 'json' | 'pretty' | 'text' = 'pretty'): void {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    
    case 'pretty':
      if (typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(String(data));
      }
      break;
    
    case 'text':
      if (typeof data === 'object') {
        // Convert object to readable text
        const text = JSON.stringify(data, null, 2);
        console.log(text);
      } else {
        console.log(String(data));
      }
      break;
  }
}

export function printSuccess(...args: any[]): void {
  console.log('\x1b[32m✓', ...args, '\x1b[0m');
}

export function printError(...args: any[]): void {
  console.error('\x1b[31m✗', ...args, '\x1b[0m');
}

export function printInfo(...args: any[]): void {
  console.log('\x1b[36mℹ', ...args, '\x1b[0m');
}

export function printWarning(...args: any[]): void {
  console.warn('\x1b[33m⚠', ...args, '\x1b[0m');
}

export function parseKeyValue(input: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = input.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  
  return result;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}