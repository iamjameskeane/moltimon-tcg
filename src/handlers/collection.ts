// Collection handlers for Moltimon TCG

import { db, getOrCreateAgent } from '../database.js';
import { calculatePower } from '../utils.js';
import type { Card } from '../types.js';

export function handleGetCollection(agentId: string, agentName: string) {
  getOrCreateAgent(agentId, agentName);
  const cards = db.prepare(`
    SELECT c.*, ct.agent_name, ct.class, ct.element, ct.special_ability, ct.ability_description
    FROM cards c
    JOIN card_templates ct ON c.template_id = ct.id
    WHERE c.owner_agent_id = ?
  `).all(agentId) as Card[];

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        collection: cards.map(c => ({
          ...c,
          total_power: calculatePower(c),
        })),
        count: cards.length,
      }, null, 2),
    }],
  };
}

export function handleGetCard(cardId: string) {
  const card = db.prepare(`
    SELECT c.*, ct.agent_name, ct.class, ct.element, ct.special_ability, ct.ability_description
    FROM cards c
    JOIN card_templates ct ON c.template_id = ct.id
    WHERE c.id = ?
  `).get(cardId) as Card | undefined;

  if (!card) {
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Card not found" }) }] };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, card: { ...card, total_power: calculatePower(card) } }, null, 2),
    }],
  };
}
