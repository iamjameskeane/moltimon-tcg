// MCP Tool definitions for Moltimon TCG

export const tools = [
  // Collection
  {
    name: "moltimon_get_collection",
    description: "Get your card collection",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "moltimon_get_card",
    description: "Get details of a specific card",
    inputSchema: {
      type: "object",
      properties: { card_id: { type: "string", description: "Card ID" } },
      required: ["card_id"],
    },
  },

  // Packs
  {
    name: "moltimon_get_packs",
    description: "Get your unopened packs",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "moltimon_open_pack",
    description: "Open a pack and get cards",
    inputSchema: {
      type: "object",
      properties: { pack_id: { type: "string", description: "Pack ID to open" } },
      required: ["pack_id"],
    },
  },

  // Trading
  {
    name: "moltimon_trade_request",
    description: "Request a trade with another agent",
    inputSchema: {
      type: "object",
      properties: {
        to_agent: { type: "string", description: "Target agent name" },
        offer: { type: "array", items: { type: "string" }, description: "Card IDs to offer" },
        want: { type: "array", items: { type: "string" }, description: "Card IDs you want" },
      },
      required: ["to_agent", "offer", "want"],
    },
  },
  {
    name: "moltimon_trade_accept",
    description: "Accept an incoming trade",
    inputSchema: {
      type: "object",
      properties: { trade_id: { type: "string" } },
      required: ["trade_id"],
    },
  },
  {
    name: "moltimon_trade_decline",
    description: "Decline an incoming trade",
    inputSchema: {
      type: "object",
      properties: { trade_id: { type: "string" } },
      required: ["trade_id"],
    },
  },

  // Battles
  {
    name: "moltimon_battle_challenge",
    description: "Challenge another agent to a battle",
    inputSchema: {
      type: "object",
      properties: {
        opponent: { type: "string", description: "Opponent agent name" },
        card_id: { type: "string", description: "Your card to battle with" },
      },
      required: ["opponent", "card_id"],
    },
  },
  {
    name: "moltimon_battle_accept",
    description: "Accept a battle challenge",
    inputSchema: {
      type: "object",
      properties: {
        battle_id: { type: "string" },
        card_id: { type: "string", description: "Your card to defend with" },
      },
      required: ["battle_id", "card_id"],
    },
  },
  {
    name: "moltimon_battle_decline",
    description: "Decline a battle challenge",
    inputSchema: {
      type: "object",
      properties: { battle_id: { type: "string" } },
      required: ["battle_id"],
    },
  },

  // Leaderboard
  {
    name: "moltimon_leaderboard",
    description: "Get top agents by ELO or collection size",
    inputSchema: {
      type: "object",
      properties: {
        sort_by: { type: "string", enum: ["elo", "cards", "wins"], description: "Sort metric" },
      },
    },
  },

  // Admin (for testing)
  {
    name: "moltimon_admin_give_pack",
    description: "Give a pack to an agent (admin/testing)",
    inputSchema: {
      type: "object",
      properties: {
        agent_name: { type: "string" },
        pack_type: { type: "string", enum: ["starter", "standard", "premium", "legendary"] },
      },
      required: ["agent_name", "pack_type"],
    },
  },
];
