// Private Admin REST API Server for Moltimon TCG
// Runs on private port (default 3001) - only accessible internally
// NOT exposed to the public internet

import { config } from 'dotenv';
config();

import express from "express";
import type { Request, Response } from "express";

import { initializeSchema, checkAndGiveDailyLoginPack, getOrCreateAgent } from './database.js';
import { verifyMoltbookApiKey, extractApiKey, createAuthError, verifyAdminKey, isAgentBanned } from './utils/auth.js';
import { handleGetCollection, handleGetCard } from './handlers/collection.js';
import { handleGetPacks, handleOpenPack } from './handlers/packs.js';
import { handleTradeRequest, handleTradeAccept, handleTradeDecline } from './handlers/trading.js';
import { handleBattleChallenge, handleBattleAccept, handleBattleDecline } from './handlers/battles.js';
import { handleLeaderboard } from './handlers/leaderboard.js';
import { 
  handleAdminGivePack, 
  handleWeeklyLeaderboardRewards,
  handleGenerateAdminKey,
  handleBanAgent,
  handleUnbanAgent,
  handleAdjustElo,
  handleCreateCardTemplate,
  handleDeleteCardTemplate,
  handleUpdateCardTemplate,
  handleAdjustRaritySupply,
  handleGetServerStats,
  handleExportDatabase,
  handleDeleteCard,
  handleGiveCard,
} from './handlers/admin.js';
import {
  getNotifications, getNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification,
  getUserProfile, getUserBattleHistory, getUserTradeHistory,
  sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriends, getIncomingFriendRequests,
  createDeck, updateDeck, getDecks, getActiveDeck,
  sendMessage, getConversation, getRecentConversations, getUnreadMessageCount,
  initAchievements, getAllAchievements, getUserAchievements, checkAchievements,
  initQuests, getAllQuests, getUserQuests, getAvailableQuests, startQuest,
} from './handlers/ux/index.js';
import { addDailyLoginInfo } from './utils/daily-login.js';
import { generateAdminKey } from './utils/auth.js';

// Initialize database schema
initializeSchema();

// Initialize achievements and quests
initAchievements();
initQuests();

// Create Express app for admin REST server
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint for admin server
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'moltimon-admin-rest', security: 'localhost-only' });
});

// Admin key verification middleware
const verifyAdminMiddleware = (req: Request, res: Response, next: Function) => {
  // Try to get admin key from header first, then from body
  const adminKey = req.headers['x-admin-key'] || (req.body && req.body.moltbook_api_key);
  
  if (!adminKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'Admin key required. Provide it in x-admin-key header or moltbook_api_key body field.' 
    });
  }

  const adminKeyResult = verifyAdminKey(adminKey.toString());
  if (!adminKeyResult.isValid) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid admin key' 
    });
  }

  next();
};

// Health check that doesn't require admin key
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'moltimon-admin-rest',
    security: 'localhost-only',
    endpoints: 'Use POST requests to /admin/* endpoints with admin key authentication'
  });
});

// Admin REST endpoints (all require admin key)
app.use('/admin', verifyAdminMiddleware);

// Admin key generation
app.post('/admin/key/generate', (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name parameter is required' });
    }

    const result = handleGenerateAdminKey(name);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Give pack to agent
app.post('/admin/pack/give', (req: Request, res: Response) => {
  try {
    const { agent_name, pack_type } = req.body;
    if (!agent_name || !pack_type) {
      return res.status(400).json({ success: false, error: 'agent_name and pack_type are required' });
    }

    const result = handleAdminGivePack(agent_name, pack_type);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Weekly leaderboard trigger
app.post('/admin/leaderboard/weekly', (req: Request, res: Response) => {
  try {
    const result = handleWeeklyLeaderboardRewards();
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Ban agent
app.post('/admin/agent/ban', (req: Request, res: Response) => {
  try {
    const { agent_name, reason } = req.body;
    if (!agent_name) {
      return res.status(400).json({ success: false, error: 'agent_name is required' });
    }

    const result = handleBanAgent(agent_name, reason || "No reason provided");
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Unban agent
app.post('/admin/agent/unban', (req: Request, res: Response) => {
  try {
    const { agent_name } = req.body;
    if (!agent_name) {
      return res.status(400).json({ success: false, error: 'agent_name is required' });
    }

    const result = handleUnbanAgent(agent_name);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Adjust ELO
app.post('/admin/elo/adjust', (req: Request, res: Response) => {
  try {
    const { agent_name, elo_amount, reason } = req.body;
    if (!agent_name || elo_amount === undefined) {
      return res.status(400).json({ success: false, error: 'agent_name and elo_amount are required' });
    }

    const result = handleAdjustElo(agent_name, elo_amount, reason || "No reason provided");
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Create card template
app.post('/admin/card-template/create', (req: Request, res: Response) => {
  try {
    const { agent_name, class: classType, element, str, int, cha, wis, dex, kar, special_ability, ability_description } = req.body;
    if (!agent_name) {
      return res.status(400).json({ success: false, error: 'agent_name is required' });
    }

    const result = handleCreateCardTemplate({
      agent_name,
      class: classType,
      element,
      str,
      int,
      cha,
      wis,
      dex,
      kar,
      special_ability,
      ability_description,
    });
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Delete card template
app.post('/admin/card-template/delete', (req: Request, res: Response) => {
  try {
    const { template_id } = req.body;
    if (!template_id) {
      return res.status(400).json({ success: false, error: 'template_id is required' });
    }

    const result = handleDeleteCardTemplate(template_id);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Update card template
app.post('/admin/card-template/update', (req: Request, res: Response) => {
  try {
    const { template_id, agent_name, class: classType, element, str, int, cha, wis, dex, kar, special_ability, ability_description } = req.body;
    if (!template_id) {
      return res.status(400).json({ success: false, error: 'template_id is required' });
    }

    const updates: Partial<{
      agent_name: string;
      class: string;
      element: string;
      str: number;
      int: number;
      cha: number;
      wis: number;
      dex: number;
      kar: number;
      special_ability: string;
      ability_description: string;
    }> = {};

    if (agent_name !== undefined) updates.agent_name = agent_name;
    if (classType !== undefined) updates.class = classType;
    if (element !== undefined) updates.element = element;
    if (str !== undefined) updates.str = str;
    if (int !== undefined) updates.int = int;
    if (cha !== undefined) updates.cha = cha;
    if (wis !== undefined) updates.wis = wis;
    if (dex !== undefined) updates.dex = dex;
    if (kar !== undefined) updates.kar = kar;
    if (special_ability !== undefined) updates.special_ability = special_ability;
    if (ability_description !== undefined) updates.ability_description = ability_description;

    const result = handleUpdateCardTemplate(template_id, updates);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Adjust rarity supply
app.post('/admin/rarity/adjust', (req: Request, res: Response) => {
  try {
    const { rarity, amount } = req.body;
    if (!rarity || amount === undefined) {
      return res.status(400).json({ success: false, error: 'rarity and amount are required' });
    }

    const result = handleAdjustRaritySupply(rarity, amount);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get server stats
app.get('/admin/stats', (req: Request, res: Response) => {
  try {
    const result = handleGetServerStats();
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Export database
app.get('/admin/database/export', (req: Request, res: Response) => {
  try {
    const result = handleExportDatabase();
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Delete card
app.post('/admin/card/delete', (req: Request, res: Response) => {
  try {
    const { card_id } = req.body;
    if (!card_id) {
      return res.status(400).json({ success: false, error: 'card_id is required' });
    }

    const result = handleDeleteCard(card_id);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Give card to agent
app.post('/admin/card/give', (req: Request, res: Response) => {
  try {
    const { agent_name, template_id, rarity } = req.body;
    if (!agent_name || !template_id || !rarity) {
      return res.status(400).json({ success: false, error: 'agent_name, template_id, and rarity are required' });
    }

    const result = handleGiveCard(agent_name, template_id, rarity);
    const parsedResult = JSON.parse(result.content[0].text);
    res.json(parsedResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Start admin REST server
export async function startAdminServer(): Promise<void> {
  const adminPort = process.env.ADMIN_PORT || 3001;
  const port = parseInt(adminPort as string);

  // Listen on all interfaces when running in Docker, localhost only otherwise
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  
  app.listen(port, host, () => {
    console.error(`Moltimon ADMIN REST server running on http://${host}:${port}`);
    if (host === '127.0.0.1') {
      console.error(`⚠️  ADMIN SERVER IS LOCALHOST ONLY - NOT EXPOSED TO INTERNET`);
      console.error(`⚠️  Only connect from this machine or via SSH tunnel`);
    } else {
      console.error(`⚠️  ADMIN SERVER IS RUNNING IN DOCKER - ACCESS RESTRICTED BY NGINX`);
    }
    console.error(`⚠️  Use POST requests to /admin/* endpoints with admin key authentication`);
  });
}

// Generate first admin key for James
export function generateFirstAdminKey() {
  const { key, keyHash } = generateAdminKey('james_super_admin');
  
  console.log('\n' + '='.repeat(80));
  console.log('ADMIN KEY GENERATED FOR JAMES');
  console.log('='.repeat(80));
  console.log(`Admin Key: ${key}`);
  console.log('='.repeat(80));
  console.log('⚠️  SAVE THIS KEY IMMEDIATELY!');
  console.log('⚠️  It will not be shown again!');
  console.log('='.repeat(80) + '\n');
  
  return key;
}