// Admin handlers for Moltimon TCG

import { v4 as uuidv4 } from "uuid";
import { db, getOrCreateAgent } from '../database.js';

export function handleAdminGivePack(agentName: string, packType: string) {
  getOrCreateAgent(agentName, agentName);

  const packId = uuidv4();
  db.prepare("INSERT INTO packs (id, pack_type, owner_agent_id) VALUES (?, ?, ?)").run(packId, packType, agentName);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ success: true, pack_id: packId, message: `Gave ${packType} pack to ${agentName}` }, null, 2),
    }],
  };
}
