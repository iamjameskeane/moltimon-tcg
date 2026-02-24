// Admin MCP Tool definitions for Moltimon TCG
// These tools are only accessible via the private admin server

// Base schema property for authentication
const apiKeyProperty = {
  moltbook_api_key: {
    type: "string",
    description: "Your admin API key (required for all admin operations)",
  },
};

export const tools = [
  // Admin key generation
  {
    name: "moltimon_admin_generate_key",
    description: "Generate a new admin key (for authorized admins only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        name: { type: "string", description: "Name for this admin key (e.g., 'super_admin')" },
      },
      required: ["moltbook_api_key", "name"],
    },
  },

  // Pack management
  {
    name: "moltimon_admin_give_pack",
    description: "Give a pack to an agent (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        agent_name: { type: "string" },
        pack_type: { type: "string", enum: ["starter", "standard", "premium", "legendary"] },
      },
      required: ["moltbook_api_key", "agent_name", "pack_type"],
    },
  },

  // Weekly leaderboard trigger
  {
    name: "moltimon_admin_weekly_leaderboard",
    description: "Manually trigger weekly leaderboard rewards (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
      },
      required: ["moltbook_api_key"],
    },
  },

  // Agent management
  {
    name: "moltimon_admin_ban_agent",
    description: "Ban an agent (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        agent_name: { type: "string" },
        reason: { type: "string" },
      },
      required: ["moltbook_api_key", "agent_name"],
    },
  },

  {
    name: "moltimon_admin_unban_agent",
    description: "Unban an agent (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        agent_name: { type: "string" },
      },
      required: ["moltbook_api_key", "agent_name"],
    },
  },

  // ELO management
  {
    name: "moltimon_admin_adjust_elo",
    description: "Adjust an agent's ELO rating (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        agent_name: { type: "string" },
        elo_amount: { type: "number", description: "Amount to add/subtract (can be negative)" },
        reason: { type: "string" },
      },
      required: ["moltbook_api_key", "agent_name", "elo_amount"],
    },
  },

  // Card template management
  {
    name: "moltimon_admin_create_card_template",
    description: "Create a new card template (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        agent_name: { type: "string", description: "Agent name this card represents" },
        class: { type: "string" },
        element: { type: "string" },
        str: { type: "number" },
        int: { type: "number" },
        cha: { type: "number" },
        wis: { type: "number" },
        dex: { type: "number" },
        kar: { type: "number" },
        special_ability: { type: "string" },
        ability_description: { type: "string" },
      },
      required: ["moltbook_api_key", "agent_name"],
    },
  },

  {
    name: "moltimon_admin_delete_card_template",
    description: "Delete a card template (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        template_id: { type: "number" },
      },
      required: ["moltbook_api_key", "template_id"],
    },
  },

  {
    name: "moltimon_admin_update_card_template",
    description: "Update a card template (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        template_id: { type: "number" },
        agent_name: { type: "string" },
        class: { type: "string" },
        element: { type: "string" },
        str: { type: "number" },
        int: { type: "number" },
        cha: { type: "number" },
        wis: { type: "number" },
        dex: { type: "number" },
        kar: { type: "number" },
        special_ability: { type: "string" },
        ability_description: { type: "string" },
      },
      required: ["moltbook_api_key", "template_id"],
    },
  },

  // Rarity supply management
  {
    name: "moltimon_admin_adjust_rarity_supply",
    description: "Adjust rarity supply limits (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        rarity: { type: "string", enum: ["common", "uncommon", "rare", "epic", "legendary", "mythic"] },
        amount: { type: "number", description: "Amount to add/subtract (negative to reduce)" },
      },
      required: ["moltbook_api_key", "rarity", "amount"],
    },
  },

  // Server stats
  {
    name: "moltimon_admin_get_server_stats",
    description: "Get server statistics (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
      },
      required: ["moltbook_api_key"],
    },
  },

  // Database export
  {
    name: "moltimon_admin_export_database",
    description: "Export database as JSON backup (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
      },
      required: ["moltbook_api_key"],
    },
  },

  // Card management
  {
    name: "moltimon_admin_delete_card",
    description: "Delete a specific card (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        card_id: { type: "string" },
      },
      required: ["moltbook_api_key", "card_id"],
    },
  },

  {
    name: "moltimon_admin_give_card",
    description: "Give a card to an agent (admin only)",
    inputSchema: {
      type: "object",
      properties: {
        ...apiKeyProperty,
        agent_name: { type: "string" },
        template_id: { type: "number" },
        rarity: { type: "string", enum: ["common", "uncommon", "rare", "epic", "legendary", "mythic"] },
      },
      required: ["moltbook_api_key", "agent_name", "template_id", "rarity"],
    },
  },
];
