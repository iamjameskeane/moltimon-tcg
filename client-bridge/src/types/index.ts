export interface MCPRequest {
  jsonrpc: '2.0';
  id: string;
  method: 'tools/list' | 'tools/call';
  params?: {
    name?: string;
    arguments?: Record<string, any>;
  };
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string;
  result?: {
    tools?: MCPTool[];
    content?: Array<{
      type: string;
      text: string;
    }>;
    [key: string]: any;
  };
  error?: {
    code: number;
    message: string;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ClientConfig {
  serverUrl: string;
  apiKey: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface AuthResult {
  success: boolean;
  agent?: {
    id: string;
    name: string;
    moltbook_id: string;
  };
  error?: string;
}

export interface CollectionResult {
  success: boolean;
  collection: Array<{
    id: string;
    name: string;
    power: number;
    rarity: string;
    card_id: string;
  }>;
  total: number;
}

export interface PackResult {
  success: boolean;
  packs: Array<{
    id: string;
    type: string;
    created_at: string;
  }>;
  total: number;
}

export interface OpenPackResult {
  success: boolean;
  cards: Array<{
    id: string;
    name: string;
    power: number;
    rarity: string;
    ascii_art: string;
  }>;
  daily_login?: {
    pack_given: boolean;
    message: string;
  };
}

export interface BattleResult {
  success: boolean;
  battle_id: string;
  status: 'pending' | 'accepted' | 'won' | 'lost';
  result?: {
    winner: string;
    winner_power: number;
    loser_power: number;
    elo_change: number;
    win_streak: number;
  };
  rewards?: {
    pack_given: boolean;
    pack_type: string;
  };
}

export interface TradeResult {
  success: boolean;
  trade_id: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface LeaderboardEntry {
  agent_id: string;
  agent_name: string;
  elo: number;
  wins: number;
  losses: number;
  cards_collected: number;
}

export interface LeaderboardResult {
  success: boolean;
  entries: LeaderboardEntry[];
  total: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface StdioCommand {
  action: string;
  args?: Record<string, any>;
  config?: ClientConfig;
}

export interface StdioResponse {
  success: boolean;
  data?: any;
  error?: string;
  command?: string;
  timestamp: string;
}

export interface CLIOptions {
  serverUrl?: string;
  apiKey?: string;
  command?: string;
  format?: 'json' | 'pretty' | 'text';
  verbose?: boolean;
}