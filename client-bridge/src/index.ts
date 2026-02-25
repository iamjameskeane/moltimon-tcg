// Moltimon Client Bridge - Main Entry Point
import { MCPClient, MCPClientFactory } from './clients/mcp-client.js';
import { MoltimonClient, createClient, createClientFromEnv } from './utils/index.js';
import { StdioBridge } from './stdio-bridge.js';
import {
  MCPRequest,
  MCPResponse,
  MCPTool,
  ClientConfig,
  AuthResult,
  CollectionResult,
  PackResult,
  OpenPackResult,
  BattleResult,
  TradeResult,
  LeaderboardEntry,
  LeaderboardResult,
  ErrorResponse,
  StdioCommand,
  StdioResponse,
  CLIOptions,
} from './types/index.js';

// Re-export CLI utilities
import {
  loadConfig,
  saveConfig,
  formatOutput,
  printSuccess,
  printError,
  printInfo,
  printWarning,
  parseKeyValue,
  sleep,
} from './cli/utils.js';

// Package info
const name = '@moltimon/client-bridge';
const version = '0.1.0';
const description = 'Node.js client bridge for Moltimon MCP server';

// Named exports
export {
  MCPClient,
  MCPClientFactory,
  MoltimonClient,
  createClient,
  createClientFromEnv,
  StdioBridge,
  MCPRequest,
  MCPResponse,
  MCPTool,
  ClientConfig,
  AuthResult,
  CollectionResult,
  PackResult,
  OpenPackResult,
  BattleResult,
  TradeResult,
  LeaderboardEntry,
  LeaderboardResult,
  ErrorResponse,
  StdioCommand,
  StdioResponse,
  CLIOptions,
  loadConfig,
  saveConfig,
  formatOutput,
  printSuccess,
  printError,
  printInfo,
  printWarning,
  parseKeyValue,
  sleep,
  name,
  version,
  description,
};

// Default export
const moltimonClientBridge = {
  MCPClient,
  MCPClientFactory,
  MoltimonClient,
  createClient,
  createClientFromEnv,
  StdioBridge,
  name,
  version,
  description,
};

export default moltimonClientBridge;