// Trading handlers for Moltimon TCG

import { v4 as uuidv4 } from "uuid";
import { db, getOrCreateAgent } from '../database.js';

export function handleTradeRequest(agentId: string, toAgent: string, offer: string[], want: string[]) {
  // Verify ownership of offered cards
  for (const cardId of offer) {
    const card = db.prepare("SELECT * FROM cards WHERE id = ? AND owner_agent_id = ?").get(cardId, agentId);
    if (!card) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, error: `You don't own card ${cardId}` }) }] };
    }
  }

  // Verify target agent exists
  getOrCreateAgent(toAgent, toAgent);

  const tradeId = uuidv4();
  db.prepare(`
    INSERT INTO trades (id, from_agent_id, to_agent_id, offered_card_ids, wanted_card_ids)
    VALUES (?, ?, ?, ?, ?)
  `).run(tradeId, agentId, toAgent, JSON.stringify(offer), JSON.stringify(want));

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, trade_id: tradeId, message: `Trade request sent to ${toAgent}` }, null, 2),
    }],
  };
}

export function handleTradeAccept(agentId: string, tradeId: string) {
  const trade = db.prepare("SELECT * FROM trades WHERE id = ? AND to_agent_id = ? AND status = 'pending'").get(tradeId, agentId) as any;

  if (!trade) {
    return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Trade not found or not pending" }) }] };
  }

  const offeredCards = JSON.parse(trade.offered_card_ids);
  const wantedCards = JSON.parse(trade.wanted_card_ids);

  // Swap ownership
  for (const cardId of offeredCards) {
    db.prepare("UPDATE cards SET owner_agent_id = ? WHERE id = ?").run(agentId, cardId);
  }
  for (const cardId of wantedCards) {
    db.prepare("UPDATE cards SET owner_agent_id = ? WHERE id = ?").run(trade.from_agent_id, cardId);
  }

  db.prepare("UPDATE trades SET status = 'accepted', resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(tradeId);
  db.prepare("UPDATE agent_stats SET trades_completed = trades_completed + 1 WHERE agent_id = ?").run(agentId);
  db.prepare("UPDATE agent_stats SET trades_completed = trades_completed + 1 WHERE agent_id = ?").run(trade.from_agent_id);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, message: "Trade completed!" }, null, 2),
    }],
  };
}

export function handleTradeDecline(agentId: string, tradeId: string) {
  db.prepare("UPDATE trades SET status = 'declined', resolved_at = CURRENT_TIMESTAMP WHERE id = ? AND to_agent_id = ?").run(tradeId, agentId);

  return {
    content: [{ type: "text", text: JSON.stringify({ success: true, message: "Trade declined" }, null, 2) }],
  };
}
