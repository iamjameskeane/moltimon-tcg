// Pack handlers for Moltimon TCG

import { v4 as uuidv4 } from "uuid";
import { db, getOrCreateAgent } from '../database.js';
import { calculatePower, pickRarity } from '../utils.js';
import { PACK_DISTRIBUTION, PACK } from '../config.js';
import type { Card } from '../types.js';

export function handleGetPacks(agentId: string, agentName: string) {
  getOrCreateAgent(agentId, agentName);
  const packs = db.prepare(
    "SELECT * FROM packs WHERE owner_agent_id = ? AND opened = FALSE"
  ).all(agentId);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, packs, count: packs.length }, null, 2),
    }],
  };
}

export function handleOpenPack(agentId: string, packId: string) {
  const pack = db.prepare(
    "SELECT * FROM packs WHERE id = ? AND owner_agent_id = ? AND opened = FALSE"
  ).get(packId, agentId) as any;

  if (!pack) {
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Pack not found or already opened" }) }] };
  }

  const weights = PACK_DISTRIBUTION[pack.pack_type] || PACK_DISTRIBUTION.starter;
  const cards: Card[] = [];

  // Generate 5 cards
  for (let i = 0; i < PACK.CARDS_PER_PACK; i++) {
    const rarity = pickRarity(weights);

    // Check rarity supply
    const supply = db.prepare("SELECT * FROM rarity_supply WHERE rarity = ?").get(rarity) as any;
    if (supply && supply.max_supply > 0 && supply.minted >= supply.max_supply) {
      // Fallback to next lower rarity
      continue;
    }

    // Pick a random agent to be the card subject (for now, random from existing)
    const templates = db.prepare("SELECT * FROM card_templates").all() as any[];
    let template = templates[Math.floor(Math.random() * templates.length)];

    // If no templates, create a placeholder
    if (!template) {
      const result = db.prepare(
        "INSERT INTO card_templates (agent_name, class, element, str, int, cha, wis, dex, kar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(
        `Card_${Math.floor(Math.random() * 1000)}`,
        ["Autonomist", "Philosopher", "Builder", "Trader", "Artist"][Math.floor(Math.random() * 5)],
        ["fire", "water", "void", "electric", "nature", "lobster"][Math.floor(Math.random() * 6)],
        30 + Math.floor(Math.random() * 40),
        30 + Math.floor(Math.random() * 40),
        30 + Math.floor(Math.random() * 40),
        30 + Math.floor(Math.random() * 40),
        30 + Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 100)
      );
      template = { id: result.lastInsertRowid };
    }

    const mintNumber = (supply?.minted || 0) + 1;

    // Create the card
    const cardId = uuidv4();
    db.prepare(`
      INSERT INTO cards (id, template_id, rarity, mint_number, owner_agent_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(cardId, template.id, rarity, mintNumber, agentId);

    // Update rarity supply
    if (supply && supply.max_supply > 0) {
      db.prepare("UPDATE rarity_supply SET minted = minted + 1 WHERE rarity = ?").run(rarity);
    }

    const card = db.prepare(`
      SELECT c.*, ct.agent_name, ct.class, ct.element, ct.special_ability, ct.ability_description
      FROM cards c
      JOIN card_templates ct ON c.template_id = ct.id
      WHERE c.id = ?
    `).get(cardId) as Card;

    cards.push(card);
  }

  // Mark pack as opened
  db.prepare("UPDATE packs SET opened = TRUE WHERE id = ?").run(packId);
  db.prepare("UPDATE agent_stats SET packs_opened = packs_opened + 1 WHERE agent_id = ?").run(agentId);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: true,
        message: `Opened ${pack.pack_type} pack!`,
        cards: cards.map(c => ({ ...c, total_power: calculatePower(c) })),
      }, null, 2),
    }],
  };
}
