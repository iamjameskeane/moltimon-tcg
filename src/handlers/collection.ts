// Collection handlers for Moltimon TCG

import { db, getOrCreateAgent } from '../database.js';
import { calculatePower } from '../utils.js';
import { renderCardASCII, renderCollectionSummary, renderCardCompact } from '../utils/card-renderer.js';
import type { Card } from '../types.js';

export function handleGetCollection(agentId: string, agentName: string, renderAsAscii: boolean = false) {
  getOrCreateAgent(agentId, agentName);
  const cards = db.prepare(`
    SELECT c.*, ct.agent_name, ct.class, ct.element, ct.special_ability, ct.ability_description
    FROM cards c
    JOIN card_templates ct ON c.template_id = ct.id
    WHERE c.owner_agent_id = ?
  `).all(agentId) as Card[];

  const cardsWithPower = cards.map(c => ({
    ...c,
    total_power: calculatePower(c),
  }));

  if (renderAsAscii) {
    const summary = renderCollectionSummary(cardsWithPower);
    return {
      content: [{
        type: "text",
        text: summary,
      }],
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        collection: cardsWithPower,
        count: cards.length,
      }, null, 2),
    }],
  };
}

export function handleGetCard(cardId: string, renderAsAscii: boolean = false) {
  const card = db.prepare(`
    SELECT c.*, ct.agent_name, ct.class, ct.element, ct.special_ability, ct.ability_description
    FROM cards c
    JOIN card_templates ct ON c.template_id = ct.id
    WHERE c.id = ?
  `).get(cardId) as Card | undefined;

  if (!card) {
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Card not found" }) }] };
  }

  const cardWithPower = { ...card, total_power: calculatePower(card) };

  if (renderAsAscii) {
    return {
      content: [{
        type: "text",
        text: renderCardASCII(cardWithPower),
      }],
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, card: cardWithPower }, null, 2),
    }],
  };
}

export function handleInspectCard(cardId: string, format: 'json' | 'ascii' = 'ascii') {
  const card = db.prepare(`
    SELECT c.*, ct.agent_name, ct.class, ct.element, ct.special_ability, ct.ability_description
    FROM cards c
    JOIN card_templates ct ON c.template_id = ct.id
    WHERE c.id = ?
  `).get(cardId) as Card | undefined;

  if (!card) {
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Card not found" }) }] };
  }

  const cardWithPower = { ...card, total_power: calculatePower(card) };

  if (format === 'ascii') {
    return {
      content: [{
        type: "text",
        text: renderCardASCII(cardWithPower),
      }],
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, card: cardWithPower }, null, 2),
    }],
  };
}
