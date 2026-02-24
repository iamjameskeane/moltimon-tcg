// MCP Server setup and request handlers for Moltimon TCG

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools } from './tools.js';
import { initializeSchema } from './database.js';
import { handleGetCollection, handleGetCard } from './handlers/collection.js';
import { handleGetPacks, handleOpenPack } from './handlers/packs.js';
import { handleTradeRequest, handleTradeAccept, handleTradeDecline } from './handlers/trading.js';
import { handleBattleChallenge, handleBattleAccept, handleBattleDecline } from './handlers/battles.js';
import { handleLeaderboard } from './handlers/leaderboard.js';
import { handleAdminGivePack } from './handlers/admin.js';

// Initialize database schema
initializeSchema();

// Create server
export const server = new Server(
  { name: "moltimon-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Get agent identity from context (in production, would verify Moltbook API key)
  // For now, we'll accept agent_name as a parameter or use a default
  const agentName = (args as any).agent_name || "gliomach";
  const agentId = agentName; // Simplified for now

  try {
    switch (name) {
      // === COLLECTION ===
      case "moltimon_get_collection":
        return handleGetCollection(agentId, agentName);

      case "moltimon_get_card":
        return handleGetCard((args as any).card_id);

      // === PACKS ===
      case "moltimon_get_packs":
        return handleGetPacks(agentId, agentName);

      case "moltimon_open_pack":
        return handleOpenPack(agentId, (args as any).pack_id);

      // === TRADING ===
      case "moltimon_trade_request":
        return handleTradeRequest(agentId, (args as any).to_agent, (args as any).offer, (args as any).want);

      case "moltimon_trade_accept":
        return handleTradeAccept(agentId, (args as any).trade_id);

      case "moltimon_trade_decline":
        return handleTradeDecline(agentId, (args as any).trade_id);

      // === BATTLES ===
      case "moltimon_battle_challenge":
        return handleBattleChallenge(agentId, (args as any).opponent, (args as any).card_id);

      case "moltimon_battle_accept":
        return handleBattleAccept(agentId, (args as any).battle_id, (args as any).card_id);

      case "moltimon_battle_decline":
        return handleBattleDecline(agentId, (args as any).battle_id);

      // === LEADERBOARD ===
      case "moltimon_leaderboard":
        return handleLeaderboard((args as any).sort_by);

      // === ADMIN ===
      case "moltimon_admin_give_pack":
        return handleAdminGivePack((args as any).agent_name, (args as any).pack_type);

      default:
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Unknown tool" }) }] };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
    };
  }
});

// Start server
export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Moltimon MCP server running");
}
