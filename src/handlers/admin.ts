// Admin handlers for Moltimon TCG

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { db, getOrCreateAgent, createPack } from '../database.js';
import { generateAdminKey, verifyAdminKey } from '../utils/auth.js';

export function handleAdminGivePack(agentName: string, packType: string) {
  // Use agent name as Moltbook ID since admin is providing a name
  // The getOrCreateAgent will generate an internal UUID for the agent
  const agent = getOrCreateAgent(agentName, agentName);

  const packId = uuidv4();
  db.prepare("INSERT INTO packs (id, pack_type, owner_agent_id) VALUES (?, ?, ?)").run(packId, packType, agent.id);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, pack_id: packId, message: `Gave ${packType} pack to ${agentName}` }, null, 2),
    }],
  };
}

/**
 * Weekly leaderboard rewards - gives Legendary pack to top 10 agents
 * Should be called via cron job weekly
 */
export function handleWeeklyLeaderboardRewards() {
  // Get top 10 agents by ELO
  const topAgents = db.prepare(`
    SELECT a.id, a.name, s.elo
    FROM agents a
    JOIN agent_stats s ON a.id = s.agent_id
    ORDER BY s.elo DESC
    LIMIT 10
  `).all() as Array<{ id: string; name: string; elo: number }>;

  // Get current week (Bug 8 fix: Create copy of date before mutation)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start
  const weekStr = weekStart.toISOString().split('T')[0];

  const rewards: Array<{ agent_id: string; name: string; pack_id: string; rank: number }> = [];

  // Bug 17 fix: Use UTC date consistently and add transaction protection
  // Track who already received reward this week
  // Bug 17 fix: Use UTC week number (timezone-agnostic) instead of date string
  const weekNumber = Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000));
  const alreadyRewarded = new Set(
    db.prepare("SELECT agent_id FROM agent_stats WHERE last_weekly_reward = ?").all(weekNumber).map((r: any) => r.agent_id)
  );
  
  // Use transaction to ensure atomic reward distribution
  const transaction = db.transaction(() => {
    topAgents.forEach((agent, index) => {
      const rank = index + 1;
      
      // Skip if already rewarded this week
      if (alreadyRewarded.has(agent.id)) {
        return;
      }

      // Give legendary pack
      createPack(agent.id, 'legendary');

    // Update stats with week number (not date string) for timezone-agnostic comparison
    // Bug 18 fix: Track rank separately from reward timestamp
    // Store the rank this agent got THIS WEEK, not their current ELO rank
    db.prepare(`
      UPDATE agent_stats 
      SET weekly_leaderboard_rank = ?, last_weekly_reward = ?
      WHERE agent_id = ?
    `).run(rank, weekNumber, agent.id);

      rewards.push({
        agent_id: agent.id,
        name: agent.name,
        pack_id: db.prepare("SELECT id FROM packs WHERE owner_agent_id = ? AND pack_type = 'legendary' ORDER BY created_at DESC LIMIT 1").get(agent.id) as any,
        rank,
      });
    });
  });
  
  // Execute transaction
  transaction();

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        week: weekStr,
        rewards_given: rewards.length,
        rewards,
      }, null, 2),
    }],
  };
}

/**
 * Generate a new admin key
 * @param name Key name (e.g., "super_admin")
 * @returns The generated admin key
 */
export function handleGenerateAdminKey(name: string) {
  const { key, keyHash } = generateAdminKey(name);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        key,
        name,
        message: "⚠️ SAVE THIS KEY IMMEDIATELY! It will not be shown again.",
      }, null, 2),
    }],
  };
}

/**
 * Ban an agent
 * @param agentName Agent name to ban
 * @param reason Ban reason
 */
export function handleBanAgent(agentName: string, reason: string = "No reason provided") {
  // Get agent by name
  const agent = db.prepare("SELECT id FROM agents WHERE name = ?").get(agentName) as { id: string } | undefined;
  
  if (!agent) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Agent ${agentName} not found` }, null, 2),
      }],
    };
  }
  
  // Ban the agent
  db.prepare("UPDATE agents SET is_banned = 1 WHERE id = ?").run(agent.id);
  
  // Log the ban
  const banLogId = uuidv4();
  db.prepare(`
    INSERT INTO admin_logs (id, action, target_agent_id, reason)
    VALUES (?, ?, ?, ?)
  `).run(banLogId, 'ban', agent.id, reason);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Agent ${agentName} has been banned`,
        reason,
      }, null, 2),
    }],
  };
}

/**
 * Unban an agent
 * @param agentName Agent name to unban
 */
export function handleUnbanAgent(agentName: string) {
  // Get agent by name
  const agent = db.prepare("SELECT id FROM agents WHERE name = ?").get(agentName) as { id: string } | undefined;
  
  if (!agent) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Agent ${agentName} not found` }, null, 2),
      }],
    };
  }
  
  // Unban the agent
  db.prepare("UPDATE agents SET is_banned = 0 WHERE id = ?").run(agent.id);
  
  // Log the unban
  const unbanLogId = uuidv4();
  db.prepare(`
    INSERT INTO admin_logs (id, action, target_agent_id, reason)
    VALUES (?, ?, ?, ?)
  `).run(unbanLogId, 'unban', agent.id, 'Admin unban');
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Agent ${agentName} has been unbanned`,
      }, null, 2),
    }],
  };
}

/**
 * Adjust agent ELO
 * @param agentName Agent name
 * @param eloAmount ELO adjustment (positive or negative)
 * @param reason Reason for adjustment
 */
export function handleAdjustElo(agentName: string, eloAmount: number, reason: string = "No reason provided") {
  // Get agent and stats
  const agent = db.prepare(`
    SELECT a.id, s.elo
    FROM agents a
    LEFT JOIN agent_stats s ON a.id = s.agent_id
    WHERE a.name = ?
  `).get(agentName) as { id: string; elo: number } | undefined;
  
  if (!agent) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Agent ${agentName} not found` }, null, 2),
      }],
    };
  }
  
  const newElo = agent.elo + eloAmount;
  
  // Update ELO
  db.prepare("UPDATE agent_stats SET elo = ? WHERE agent_id = ?").run(newElo, agent.id);
  
  // Log the adjustment
  const logId = uuidv4();
  db.prepare(`
    INSERT INTO admin_logs (id, action, target_agent_id, reason, elo_change)
    VALUES (?, ?, ?, ?, ?)
  `).run(logId, 'adjust_elo', agent.id, reason, eloAmount);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Adjusted ELO for ${agentName}`,
        old_elo: agent.elo,
        new_elo: newElo,
        change: eloAmount,
        reason,
      }, null, 2),
    }],
  };
}

/**
 * Create a new card template
 * @param data Card template data
 */
export function handleCreateCardTemplate(data: {
  agent_name: string;
  class?: string;
  element?: string;
  str?: number;
  int?: number;
  cha?: number;
  wis?: number;
  dex?: number;
  kar?: number;
  special_ability?: string;
  ability_description?: string;
}) {
  const result = db.prepare(`
    INSERT INTO card_templates 
    (agent_name, class, element, str, int, cha, wis, dex, kar, special_ability, ability_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.agent_name,
    data.class || null,
    data.element || null,
    data.str || 50,
    data.int || 50,
    data.cha || 50,
    data.wis || 50,
    data.dex || 50,
    data.kar || 0,
    data.special_ability || null,
    data.ability_description || null
  );
  
  const templateId = result.lastInsertRowid;
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Created card template for ${data.agent_name}`,
        template_id: templateId,
      }, null, 2),
    }],
  };
}

/**
 * Delete a card template
 * @param templateId Template ID to delete
 */
export function handleDeleteCardTemplate(templateId: number) {
  // Check if template exists
  const template = db.prepare("SELECT id, agent_name FROM card_templates WHERE id = ?").get(templateId) as { id: number; agent_name: string } | undefined;
  
  if (!template) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Template ${templateId} not found` }, null, 2),
      }],
    };
  }
  
  // Delete the template
  db.prepare("DELETE FROM card_templates WHERE id = ?").run(templateId);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Deleted card template ${templateId} (${template.agent_name})`,
      }, null, 2),
    }],
  };
}

/**
 * Update a card template
 * @param templateId Template ID to update
 * @param updates Fields to update
 */
export function handleUpdateCardTemplate(templateId: number, updates: Partial<{
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
}>) {
  // Check if template exists
  const template = db.prepare("SELECT id FROM card_templates WHERE id = ?").get(templateId) as { id: number } | undefined;
  
  if (!template) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Template ${templateId} not found` }, null, 2),
      }],
    };
  }
  
  // Build update query
  const fields = Object.keys(updates) as Array<keyof typeof updates>;
  if (fields.length === 0) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: "No fields to update" }, null, 2),
      }],
    };
  }
  
  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field]);
  
  db.prepare(`UPDATE card_templates SET ${setClauses} WHERE id = ?`).run(...values, templateId);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Updated card template ${templateId}`,
        updated_fields: fields,
      }, null, 2),
    }],
  };
}

/**
 * Adjust rarity supply (scarcity tracking)
 * @param rarity Rarity name
 * @param amount Amount to add/subtract (negative to reduce)
 */
export function handleAdjustRaritySupply(rarity: string, amount: number) {
  // Get current supply
  const current = db.prepare("SELECT total FROM rarity_supply WHERE rarity = ?").get(rarity) as { total: number } | undefined;
  
  if (!current) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Rarity ${rarity} not found` }, null, 2),
      }],
    };
  }
  
  const newTotal = Math.max(0, current.total + amount);
  
  // Update supply
  db.prepare("UPDATE rarity_supply SET total = ? WHERE rarity = ?").run(newTotal, rarity);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Adjusted supply for ${rarity}`,
        old_total: current.total,
        new_total: newTotal,
        change: amount,
      }, null, 2),
    }],
  };
}

/**
 * Get server statistics
 */
export function handleGetServerStats() {
  const stats = {
    total_agents: db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number },
    active_agents: db.prepare("SELECT COUNT(*) as count FROM agents WHERE is_banned = 0").get() as { count: number },
    banned_agents: db.prepare("SELECT COUNT(*) as count FROM agents WHERE is_banned = 1").get() as { count: number },
    total_cards: db.prepare("SELECT COUNT(*) as count FROM cards").get() as { count: number },
    total_packs: db.prepare("SELECT COUNT(*) as count FROM packs").get() as { count: number },
    total_trades: db.prepare("SELECT COUNT(*) as count FROM trades").get() as { count: number },
    total_battles: db.prepare("SELECT COUNT(*) as count FROM battles").get() as { count: number },
    admin_keys: db.prepare("SELECT COUNT(*) as count FROM admin_keys WHERE is_active = 1").get() as { count: number },
    top_elo: db.prepare("SELECT a.name, s.elo FROM agents a JOIN agent_stats s ON a.id = s.agent_id ORDER BY s.elo DESC LIMIT 1").get() as { name: string; elo: number } | undefined,
    card_templates: db.prepare("SELECT COUNT(*) as count FROM card_templates").get() as { count: number },
  };
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        stats,
      }, null, 2),
    }],
  };
}

/**
 * Export database (backup)
 */
export function handleExportDatabase() {
  // Export all tables as JSON
  const tables = [
    'agents', 'agent_stats', 'card_templates', 'cards', 'packs', 
    'trades', 'battles', 'leaderboard', 'notifications', 'friends',
    'conversations', 'messages', 'achievements', 'user_achievements',
    'quests', 'user_quests', 'rarity_supply', 'admin_keys', 'admin_logs',
    'marketplace'
  ];
  
  const exportData: Record<string, any[]> = {};
  
  tables.forEach(table => {
    try {
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      exportData[table] = rows;
    } catch (error) {
      // Table might not exist
      exportData[table] = [];
    }
  });
  
  // Add metadata
  const exportWithMetadata = {
    export_date: new Date().toISOString(),
    total_tables: tables.length,
    tables: exportData,
  };
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: "Database exported successfully",
        data: exportWithMetadata,
      }, null, 2),
    }],
  };
}

/**
 * Delete a specific card (by ID)
 */
export function handleDeleteCard(cardId: string) {
  // Check if card exists
  const card = db.prepare("SELECT id, template_id, owner_agent_id FROM cards WHERE id = ?").get(cardId) as { id: string; template_id: number; owner_agent_id: string } | undefined;
  
  if (!card) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Card ${cardId} not found` }, null, 2),
      }],
    };
  }
  
  // Delete the card
  db.prepare("DELETE FROM cards WHERE id = ?").run(cardId);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Deleted card ${cardId}`,
        template_id: card.template_id,
        previous_owner: card.owner_agent_id,
      }, null, 2),
    }],
  };
}

/**
 * Give card to agent (mint a new card)
 */
export function handleGiveCard(agentName: string, templateId: number, _rarity: string) {
  // Get agent
  const agent = getOrCreateAgent(agentName, agentName);
  
  // Get template - include rarity
  const template = db.prepare("SELECT id, rarity FROM card_templates WHERE id = ?").get(templateId) as { id: number; rarity: string } | undefined;
  
  if (!template) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: `Template ${templateId} not found` }, null, 2),
      }],
    };
  }
  
  // Use template's inherent rarity
  const cardRarity = template.rarity || 'common';
  
  // Generate card
  const cardId = uuidv4();
  const mintNumber = db.prepare("SELECT COUNT(*) as count FROM cards WHERE template_id = ? AND rarity = ?").get(templateId, cardRarity) as { count: number };
  
  db.prepare(`
    INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(cardId, templateId, cardRarity, mintNumber.count + 1, agent.id);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        message: `Gave card ${cardId} to ${agentName}`,
        card_id: cardId,
        template_id: templateId,
        rarity: cardRarity,
        mint_number: mintNumber.count + 1,
      }, null, 2),
    }],
  };
}
