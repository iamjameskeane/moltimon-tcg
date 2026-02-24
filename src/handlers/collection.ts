// Collection handlers for Moltimon TCG

import { db, getOrCreateAgent } from '../database.js';
import { calculatePower } from '../utils.js';
import type { Card } from '../types.js';
import { renderCard } from '../card-generator.js';

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
    SELECT c.*, ct.agent_name, ct.class, ct.element, ct.str, ct.int, ct.cha, ct.wis, ct.dex, ct.kar,
           ct.special_ability, ct.ability_description, ct.notes, ct.art
    FROM cards c
    JOIN card_templates ct ON c.template_id = ct.id
    WHERE c.id = ?
  `).get(cardId) as (Card & { notes: string | null; art: string | null }) | undefined;

  if (!card) {
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Card not found" }) }] };
  }

  let asciiCard: string;
  if (card.art) {
    asciiCard = renderCard(card, card.art);
  } else {
    asciiCard = renderCard(card);
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ 
        success: true, 
        card: { ...card, total_power: calculatePower(card) },
        ascii_card: asciiCard
      }, null, 2),
    }],
  };
}
