// UX - Quest System handlers for Moltimon TCG

import { v4 as uuidv4 } from "uuid";
import { db, createPack } from '../../database.js';
import { createNotification } from './notifications.js';
import type { Quest, AgentQuest } from '../../types.js';

// Pre-defined quests
const QUESTS: Omit<Quest, 'id' | 'created_at'>[] = [
  {
    name: 'Daily Practice',
    description: 'Complete 3 battles today',
    type: 'daily',
    requirement: '{"battles_needed": 3, "reset_interval": "daily"}',
    reward: '{"type": "pack", "pack_type": "standard"}',
    required_level: 1,
  },
  {
    name: 'Daily Trading',
    description: 'Complete 2 trades today',
    type: 'daily',
    requirement: '{"trades_needed": 2, "reset_interval": "daily"}',
    reward: '{"type": "pack", "pack_type": "standard"}',
    required_level: 1,
  },
  {
    name: 'Weekly Champion',
    description: 'Win 10 battles this week',
    type: 'weekly',
    requirement: '{"wins_needed": 10, "reset_interval": "weekly"}',
    reward: '{"type": "pack", "pack_type": "premium"}',
    required_level: 1,
  },
  {
    name: 'Weekly Collector',
    description: 'Collect 25 new cards this week',
    type: 'weekly',
    requirement: '{"cards_needed": 25, "reset_interval": "weekly"}',
    reward: '{"type": "pack", "pack_type": "legendary"}',
    required_level: 2,
  },
];

/**
 * Initialize quests table (one-time setup)
 */
export function initQuests() {
  for (const quest of QUESTS) {
    const existing = db.prepare("SELECT id FROM quests WHERE name = ?").get(quest.name);
    if (!existing) {
      const questId = uuidv4();
      db.prepare(`
        INSERT INTO quests (id, name, description, type, requirement, reward, required_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(questId, quest.name, quest.description, quest.type, quest.requirement, quest.reward, quest.required_level);
    }
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: `Initialized ${QUESTS.length} quests`,
      }, null, 2),
    }],
  };
}

/**
 * Get all quests
 */
export function getAllQuests() {
  const quests = db.prepare(`
    SELECT * FROM quests ORDER BY type, name
  `).all();
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        quests: quests,
        count: quests.length,
      }, null, 2),
    }],
  };
}

/**
 * Get user's active quests
 */
export function getUserQuests(agentId: string) {
  const quests = db.prepare(`
    SELECT q.*, aq.progress, aq.is_completed, aq.started_at, aq.completed_at
    FROM quests q
    JOIN agent_quests aq ON q.id = aq.quest_id
    WHERE aq.agent_id = ? AND aq.is_completed = FALSE
    ORDER BY q.type, q.name
  `).all(agentId);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        quests: quests,
        count: quests.length,
      }, null, 2),
    }],
  };
}

/**
 * Get user's completed quests
 */
export function getUserCompletedQuests(agentId: string) {
  const quests = db.prepare(`
    SELECT q.*, aq.progress, aq.completed_at
    FROM quests q
    JOIN agent_quests aq ON q.id = aq.quest_id
    WHERE aq.agent_id = ? AND aq.is_completed = TRUE
    ORDER BY aq.completed_at DESC
  `).all(agentId);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        quests: quests,
        count: quests.length,
      }, null, 2),
    }],
  };
}

/**
 * Get available quests (not yet started)
 */
export function getAvailableQuests(agentId: string) {
  const agentLevel = 1; // Could be based on stats later
  
  const quests = db.prepare(`
    SELECT * FROM quests 
    WHERE id NOT IN (
      SELECT quest_id FROM agent_quests WHERE agent_id = ?
    ) AND required_level <= ?
    ORDER BY type, name
  `).all(agentId, agentLevel);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        quests: quests,
        count: quests.length,
      }, null, 2),
    }],
  };
}

/**
 * Start a quest
 */
export function startQuest(agentId: string, questId: string) {
  // Check if already started
  const existing = db.prepare(`
    SELECT * FROM agent_quests WHERE agent_id = ? AND quest_id = ?
  `).get(agentId, questId) as AgentQuest | undefined;
  
  if (existing) {
    if (existing.is_completed) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: false, error: "Quest already completed" }, null, 2),
        }],
      };
    }
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: "Quest already started" }, null, 2),
      }],
    };
  }
  
  const agentQuestId = uuidv4();
  db.prepare(`
    INSERT INTO agent_quests (id, agent_id, quest_id, progress)
    VALUES (?, ?, ?, 0)
  `).run(agentQuestId, agentId, questId);
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: "Quest started",
        agentQuestId,
      }, null, 2),
    }],
  };
}

/**
 * Update quest progress
 */
export function updateQuestProgress(agentId: string, questId: string, increment: number = 1) {
  // Validation: Prevent negative or zero increments
  if (increment <= 0) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: "Increment must be greater than 0" }, null, 2),
      }],
    };
  }

  // Validation: Prevent extremely large increments (cheat protection)
  if (increment > 100) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: "Increment too large (max 100)" }, null, 2),
      }],
    };
  }

  const result = db.prepare(`
    UPDATE agent_quests 
    SET progress = progress + ?
    WHERE agent_id = ? AND quest_id = ? AND is_completed = FALSE
  `).run(increment, agentId, questId);
  
  if (result.changes === 0) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: "Quest not found or already completed" }, null, 2),
      }],
    };
  }
  
  // Get the updated progress after the increment
  const quest = db.prepare(`
    SELECT q.requirement, aq.progress
    FROM quests q
    JOIN agent_quests aq ON q.id = aq.quest_id
    WHERE aq.agent_id = ? AND aq.quest_id = ?
  `).get(agentId, questId) as { requirement: string; progress: number };
  
  if (quest) {
    const req = JSON.parse(quest.requirement);
    if (req.battles_needed && quest.progress >= req.battles_needed) {
      completeQuest(agentId, questId);
    } else if (req.trades_needed && quest.progress >= req.trades_needed) {
      completeQuest(agentId, questId);
    } else if (req.wins_needed && quest.progress >= req.wins_needed) {
      completeQuest(agentId, questId);
    } else if (req.cards_needed && quest.progress >= req.cards_needed) {
      completeQuest(agentId, questId);
    }
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: "Progress updated",
        new_progress: quest ? quest.progress : 0,
      }, null, 2),
    }],
  };
}

/**
 * Complete a quest
 */
export function completeQuest(agentId: string, questId: string) {
  const result = db.prepare(`
    UPDATE agent_quests 
    SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
    WHERE agent_id = ? AND quest_id = ? AND is_completed = FALSE
  `).run(agentId, questId);
  
  if (result.changes === 0) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ success: false, error: "Quest not found or already completed" }, null, 2),
      }],
    };
  }
  
  // Get quest details for notification
  const quest = db.prepare(`
    SELECT q.name, q.reward
    FROM quests q
    WHERE q.id = ?
  `).get(questId) as { name: string; reward: string };
  
  // Send notification
  createNotification(
    agentId,
    'quest',
    'Quest Completed!',
    `You completed: ${quest.name}`,
    JSON.stringify({ quest: quest.name, reward: quest.reward })
  );
  
  // Award reward
  if (quest.reward) {
    const reward = JSON.parse(quest.reward);
    if (reward.type === 'pack' && reward.pack_type) {
      // Award pack using createPack from database.ts
      createPack(agentId, reward.pack_type);
    } else if (reward.type === 'stat' && reward.stat) {
      // Update stat in agent_stats
      db.prepare(`UPDATE agent_stats SET ${reward.stat} = ${reward.stat} + ? WHERE agent_id = ?`)
        .run(reward.amount, agentId);
    }
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: "Quest completed!",
        quest: quest.name,
        reward: quest.reward,
      }, null, 2),
    }],
  };
}

/**
 * Reset daily/weekly quests (called by cron job)
 */
export function resetQuests(type: 'daily' | 'weekly') {
  // Get quests of this type that are completed
  const completedQuests = db.prepare(`
    SELECT aq.id, aq.agent_id
    FROM agent_quests aq
    JOIN quests q ON aq.quest_id = q.id
    WHERE q.type = ? AND aq.is_completed = TRUE
  `).all(type);
  
  // Delete completed quests to allow starting again
  for (const quest of completedQuests as Array<{ id: string }>) {
    db.prepare("DELETE FROM agent_quests WHERE id = ?").run(quest.id);
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: `Reset ${type} quests`,
        count: completedQuests.length,
      }, null, 2),
    }],
  };
}
