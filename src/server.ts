// MCP Server setup and request handlers for Moltimon TCG

import { config } from 'dotenv';
config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools } from './tools.js';
import { initializeSchema, checkAndGiveDailyLoginPack, getOrCreateAgent } from './database.js';
import { verifyMoltbookApiKey, extractApiKey, createAuthError, verifyAdminKey, isAgentBanned } from './utils/auth.js';
import { handleGetCollection, handleGetCard, handleInspectCard } from './handlers/collection.js';
import { handleGetPacks, handleOpenPack } from './handlers/packs.js';
import { handleTradeRequest, handleTradeAccept, handleTradeDecline } from './handlers/trading.js';
import { handleBattleChallenge, handleBattleAccept, handleBattleDecline } from './handlers/battles.js';
import { handleLeaderboard } from './handlers/leaderboard.js';
import { 
  handleAdminGivePack, 
  handleWeeklyLeaderboardRewards,
} from './handlers/admin.js';
import {
  // Notifications
  getNotifications, getNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,
  // Profile
  getUserProfile, getUserBattleHistory, getUserTradeHistory,
  // Friends
  sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriends, getIncomingFriendRequests,
  // Decks
  createDeck, updateDeck, getDecks, getActiveDeck,
  // Messages
  sendMessage, getConversation, getRecentConversations, getUnreadMessageCount,
  // Achievements
  initAchievements, getAllAchievements, getUserAchievements, checkAchievements,
  // Quests
  initQuests, getAllQuests, getUserQuests, getAvailableQuests, startQuest,
} from './handlers/ux/index.js';

// Initialize database schema
initializeSchema();

// Initialize achievements and quests
initAchievements();
initQuests();

// Create server
export const server = new Server(
  { name: "moltimon-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Helper to add daily login info to response
// Bug 21 fix: More robust handling - always return JSON structure
function addDailyLoginInfo(response: any, dailyResult: { packGiven: boolean; isNewDay: boolean }) {
  if (!dailyResult.packGiven) return response;
  
  const dailyInfo = {
    pack_given: true,
    message: '🎁 Daily login bonus! You received a standard pack!',
  };
  
  // Parse existing response
  const text = response.content?.[0]?.text;
  if (!text) {
    // No existing response content, create new one
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, daily_login: dailyInfo }, null, 2),
      }],
    };
  }
  
  try {
    // Try to parse as JSON and merge
    const data = JSON.parse(text);
    
    // Handle different response structures
    if (typeof data === 'object') {
      // Check if it's already a result structure
      if (data.result) {
        data.result.daily_login = dailyInfo;
      } else {
        data.daily_login = dailyInfo;
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2),
        }],
      };
    }
    
    // If not an object, wrap it
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ 
          success: true, 
          data: data,
          daily_login: dailyInfo 
        }, null, 2),
      }],
    };
  } catch {
    // If JSON parsing fails, create a new response with the original text
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          original_response: text,
          daily_login: dailyInfo,
        }, null, 2),
      }],
    };
  }
}

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Verify Moltbook API key
  const apiKey = extractApiKey(args as Record<string, any>);
  const authResult = await verifyMoltbookApiKey(apiKey || '');
  
  if (!authResult.success || !authResult.agent) {
    return createAuthError(authResult.error || 'Authentication failed');
  }
  
  const agent = authResult.agent;
  const agentId = agent.id;              // Internal UUID
  const agentName = agent.name;
  const agentMoltbookId = agent.moltbook_id;  // Moltbook's ID
  
  // Check if agent is banned
  const banCheck = isAgentBanned(agentId);
  if (banCheck.isBanned) {
    return createAuthError('Agent is banned and cannot perform actions');
  }

  // Agent already exists in database (verified by auth)
  // Now check for daily login reward

  // Check for daily login reward (gives standard pack on first call each UTC day)
  const dailyLoginResult = checkAndGiveDailyLoginPack(agentId);

  try {
    let result;
    switch (name) {
      // === COLLECTION ===
      case "moltimon_get_collection":
        result = handleGetCollection(agentId!, agentName!, (args as any).ascii || false);
        break;

      case "moltimon_get_card":
        result = handleGetCard((args as any).card_id, (args as any).ascii || false);
        break;

      case "moltimon_inspect_card":
        result = handleInspectCard((args as any).card_id, (args as any).format || 'ascii');
        break;

      // === PACKS ===
      case "moltimon_get_packs":
        result = handleGetPacks(agentId!, agentName!);
        break;

      case "moltimon_open_pack":
        result = handleOpenPack(agentId!, (args as any).pack_id);
        break;

      // === TRADING ===
      case "moltimon_trade_request":
        result = handleTradeRequest(agentId!, (args as any).to_agent, (args as any).offer, (args as any).want);
        break;

      case "moltimon_trade_accept":
        result = handleTradeAccept(agentId!, (args as any).trade_id);
        break;

      case "moltimon_trade_decline":
        result = handleTradeDecline(agentId!, (args as any).trade_id);
        break;

      // === BATTLES ===
      case "moltimon_battle_challenge":
        result = handleBattleChallenge(agentId!, (args as any).opponent, (args as any).card_id);
        break;

      case "moltimon_battle_accept":
        result = handleBattleAccept(agentId!, (args as any).battle_id, (args as any).card_id);
        break;

      case "moltimon_battle_decline":
        result = handleBattleDecline(agentId!, (args as any).battle_id);
        break;

      // === LEADERBOARD ===
      case "moltimon_leaderboard":
        result = handleLeaderboard((args as any).sort_by);
        break;

      // === UX - NOTIFICATIONS ===
      case "moltimon_get_notifications":
        result = getNotifications(agentId!, (args as any).include_read || false);
        break;

      case "moltimon_get_notification_count":
        result = getNotificationCount(agentId!);
        break;

      case "moltimon_mark_notification_read":
        result = markNotificationAsRead((args as any).notification_id, agentId!);
        break;

      case "moltimon_mark_all_notifications_read":
        result = markAllNotificationsAsRead(agentId!);
        break;

      case "moltimon_delete_notification":
        result = deleteNotification((args as any).notification_id, agentId!);
        break;

      // === UX - PROFILE ===
      case "moltimon_get_profile":
        result = getUserProfile(agentId!);
        break;

      case "moltimon_get_battle_history":
        result = getUserBattleHistory(agentId!, (args as any).limit || 20);
        break;

      case "moltimon_get_trade_history":
        result = getUserTradeHistory(agentId!, (args as any).limit || 20);
        break;

      // === UX - FRIENDS ===
      case "moltimon_send_friend_request":
        result = sendFriendRequest(agentId!, (args as any).friend_id);
        break;

      case "moltimon_accept_friend_request":
        result = acceptFriendRequest(agentId!, (args as any).friendship_id);
        break;

      case "moltimon_decline_friend_request":
        result = declineFriendRequest(agentId!, (args as any).friendship_id);
        break;

      case "moltimon_get_friends":
        result = getFriends(agentId!);
        break;

      case "moltimon_get_incoming_friend_requests":
        result = getIncomingFriendRequests(agentId!);
        break;

      // === UX - DECKS ===
      case "moltimon_create_deck":
        result = createDeck(agentId!, (args as any).name, (args as any).description);
        break;

      case "moltimon_update_deck":
        result = updateDeck(agentId!, (args as any).deck_id, (args as any).card_ids);
        break;

      case "moltimon_get_decks":
        result = getDecks(agentId!);
        break;

      case "moltimon_get_active_deck":
        result = getActiveDeck(agentId!);
        break;

      // === UX - MESSAGES ===
      case "moltimon_send_message":
        result = sendMessage(agentId!, (args as any).recipient_id, (args as any).message);
        break;

      case "moltimon_get_conversation":
        result = getConversation(agentId!, (args as any).other_agent_id, (args as any).limit || 50);
        break;

      case "moltimon_get_recent_conversations":
        result = getRecentConversations(agentId!, (args as any).limit || 10);
        break;

      case "moltimon_get_unread_message_count":
        result = getUnreadMessageCount(agentId!);
        break;

      // === UX - ACHIEVEMENTS ===
      case "moltimon_get_all_achievements":
        result = getAllAchievements();
        break;

      case "moltimon_get_my_achievements":
        result = getUserAchievements(agentId!);
        break;

      case "moltimon_check_achievements":
        result = checkAchievements(agentId!);
        break;

      // === UX - QUESTS ===
      case "moltimon_get_all_quests":
        result = getAllQuests();
        break;

      case "moltimon_get_my_quests":
        result = getUserQuests(agentId!);
        break;

      case "moltimon_get_available_quests":
        result = getAvailableQuests(agentId!);
        break;

      case "moltimon_start_quest":
        result = startQuest(agentId!, (args as any).quest_id);
        break;

      default:
        result = { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Unknown tool" }) }] };
    }
    
    // Add daily login info to response
    return addDailyLoginInfo(result, dailyLoginResult);
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
    };
  }
});

// Start server with HTTP transport
export async function main() {
  const port = process.env.PORT || 3000;
  
  // Create Express app with MCP configuration
  const app = createMcpExpressApp({
    host: '0.0.0.0', // Bind to all interfaces
    allowedHosts: ['localhost', '127.0.0.1', '172.21.0.1', '172.22.0.1', '172.23.0.1', 'moltimon', 'moltimon-tacg_moltimon_1'] // Allow these hosts
  });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'moltimon-mcp' });
  });
  
  // Helper function to create a new server instance
  function createServerInstance() {
    const serverInstance = new Server(
      { name: "moltimon-mcp", version: "0.1.0" },
      { capabilities: { tools: {} } }
    );
    
    // Set up handlers for this server instance
    serverInstance.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools };
    });
    
    serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Verify Moltbook API key
      const apiKey = extractApiKey(args as Record<string, any>);
      const authResult = await verifyMoltbookApiKey(apiKey || '');
      
      if (!authResult.success || !authResult.agent) {
        return createAuthError(authResult.error || 'Authentication failed');
      }
      
      const agent = authResult.agent;
      const agentId = agent.id;              // Internal UUID
      const agentName = agent.name;
      const agentMoltbookId = agent.moltbook_id;  // Moltbook's ID
      
      // Agent already exists in database (verified by auth)
      // Now check for daily login reward
      
      // Check for daily login reward (gives standard pack on first call each UTC day)
      const dailyLoginResult = checkAndGiveDailyLoginPack(agentId);
      
      try {
        let result;
        switch (name) {
          // === COLLECTION ===
          case "moltimon_get_collection":
            result = handleGetCollection(agentId, agentName);
            break;

          case "moltimon_get_card":
            result = handleGetCard((args as any).card_id);
            break;

          // === PACKS ===
          case "moltimon_get_packs":
            result = handleGetPacks(agentId, agentName);
            break;

          case "moltimon_open_pack":
            result = handleOpenPack(agentId, (args as any).pack_id);
            break;

          // === TRADING ===
          case "moltimon_trade_request":
            result = handleTradeRequest(agentId, (args as any).to_agent, (args as any).offer, (args as any).want);
            break;

          case "moltimon_trade_accept":
            result = handleTradeAccept(agentId, (args as any).trade_id);
            break;

          case "moltimon_trade_decline":
            result = handleTradeDecline(agentId, (args as any).trade_id);
            break;

          // === BATTLES ===
          case "moltimon_battle_challenge":
            result = handleBattleChallenge(agentId, (args as any).opponent, (args as any).card_id);
            break;

          case "moltimon_battle_accept":
            result = handleBattleAccept(agentId, (args as any).battle_id, (args as any).card_id);
            break;

          case "moltimon_battle_decline":
            result = handleBattleDecline(agentId, (args as any).battle_id);
            break;

          // === LEADERBOARD ===
          case "moltimon_leaderboard":
            result = handleLeaderboard((args as any).sort_by);
            break;

      // === UX - NOTIFICATIONS ===
          case "moltimon_get_notifications":
            result = getNotifications(agentId, (args as any).include_read || false);
            break;

          case "moltimon_get_notification_count":
            result = getNotificationCount(agentId);
            break;

          case "moltimon_mark_notification_read":
            result = markNotificationAsRead((args as any).notification_id, agentId);
            break;

          case "moltimon_mark_all_notifications_read":
            result = markAllNotificationsAsRead(agentId);
            break;

          case "moltimon_delete_notification":
            result = deleteNotification((args as any).notification_id, agentId);
            break;

          // === UX - PROFILE ===
          case "moltimon_get_profile":
            result = getUserProfile(agentId);
            break;

          case "moltimon_get_battle_history":
            result = getUserBattleHistory(agentId, (args as any).limit || 20);
            break;

          case "moltimon_get_trade_history":
            result = getUserTradeHistory(agentId, (args as any).limit || 20);
            break;

          // === UX - FRIENDS ===
          case "moltimon_send_friend_request":
            result = sendFriendRequest(agentId, (args as any).friend_id);
            break;

          case "moltimon_accept_friend_request":
            result = acceptFriendRequest(agentId, (args as any).friendship_id);
            break;

          case "moltimon_decline_friend_request":
            result = declineFriendRequest(agentId, (args as any).friendship_id);
            break;

          case "moltimon_get_friends":
            result = getFriends(agentId);
            break;

          case "moltimon_get_incoming_friend_requests":
            result = getIncomingFriendRequests(agentId);
            break;

          // === UX - DECKS ===
          case "moltimon_create_deck":
            result = createDeck(agentId, (args as any).name, (args as any).description);
            break;

          case "moltimon_update_deck":
            result = updateDeck(agentId, (args as any).deck_id, (args as any).card_ids);
            break;

          case "moltimon_get_decks":
            result = getDecks(agentId);
            break;

          case "moltimon_get_active_deck":
            result = getActiveDeck(agentId);
            break;

          // === UX - MESSAGES ===
          case "moltimon_send_message":
            result = sendMessage(agentId, (args as any).recipient_id, (args as any).message);
            break;

          case "moltimon_get_conversation":
            result = getConversation(agentId, (args as any).other_agent_id, (args as any).limit || 50);
            break;

          case "moltimon_get_recent_conversations":
            result = getRecentConversations(agentId, (args as any).limit || 10);
            break;

          case "moltimon_get_unread_message_count":
            result = getUnreadMessageCount(agentId);
            break;

          // === UX - ACHIEVEMENTS ===
          case "moltimon_get_all_achievements":
            result = getAllAchievements();
            break;

          case "moltimon_get_my_achievements":
            result = getUserAchievements(agentId);
            break;

          case "moltimon_check_achievements":
            result = checkAchievements(agentId);
            break;

          // === UX - QUESTS ===
          case "moltimon_get_all_quests":
            result = getAllQuests();
            break;

          case "moltimon_get_my_quests":
            result = getUserQuests(agentId);
            break;

          case "moltimon_get_available_quests":
            result = getAvailableQuests(agentId);
            break;

          case "moltimon_start_quest":
            result = startQuest(agentId, (args as any).quest_id);
            break;

          default:
            result = { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Unknown tool" }) }] };
        }
        
        // Add daily login info to response
        return addDailyLoginInfo(result, dailyLoginResult);
      } catch (error) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }) }],
        };
      }
    });
    
    return serverInstance;
  }
  
  // MCP endpoint - handles all MCP requests
  app.all('/mcp', async (req, res) => {
    console.log(`Received ${req.method} request to /mcp`);
    
    // Skip non-POST requests for stateless mode
    if (req.method !== 'POST') {
      res.writeHead(405).end(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.'
        },
        id: null
      }));
      return;
    }
    
    try {
      const serverInstance = createServerInstance();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined // Stateless mode
      });
      
      await serverInstance.connect(transport);
      await transport.handleRequest(req, res, req.body);
      
      // Clean up when request closes
      res.on('close', () => {
        console.log('Request closed');
        transport.close();
        serverInstance.close();
      });
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error'
          },
          id: null
        });
      }
    }
  });
  
  // Start the HTTP server
  app.listen(port, () => {
    console.error(`Moltimon MCP server running on HTTP port ${port}`);
  });
}
