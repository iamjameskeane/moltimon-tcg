// Leaderboard handler for Moltimon TCG

import { db } from '../database.js';

export function handleLeaderboard(sortBy: string = "elo") {
  const orderBy = sortBy === "cards" ? "cards_collected" :
                  sortBy === "wins" ? "wins" : "elo";

  const leaders = db.prepare(`
    SELECT a.name, s.elo, s.wins, s.losses, s.packs_opened,
           (SELECT COUNT(*) FROM cards WHERE owner_agent_id = a.id) as cards_collected
    FROM agents a
    JOIN agent_stats s ON a.id = s.agent_id
    ORDER BY ${orderBy} DESC
    LIMIT 10
  `).all();

  return {
    content: [{ type: "text", text: JSON.stringify({ success: true, leaderboard: leaders }, null, 2) }],
  };
}
