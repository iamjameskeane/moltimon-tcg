// Type definitions for Moltimon TCG

export interface Card {
  id: string;
  template_id: number;
  rarity: string;
  mint_number: number;
  owner_agent_id: string | null;
  str: number;
  int: number;
  cha: number;
  wis: number;
  dex: number;
  kar: number;
  special_ability: string | null;
  ability_description: string | null;
  agent_name: string;
  class: string;
  element: string;
}

export interface Agent {
  id: string;
  name: string;
}

export interface AgentStats {
  agent_id: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  packs_opened: number;
  trades_completed: number;
}

export interface Pack {
  id: string;
  pack_type: string;
  owner_agent_id: string;
  opened: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  offered_card_ids: string;
  wanted_card_ids: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  resolved_at: string | null;
}

export interface Battle {
  id: string;
  challenger_id: string;
  defender_id: string;
  challenger_card_id: string;
  defender_card_id: string | null;
  challenger_power: number | null;
  defender_power: number | null;
  winner_id: string | null;
  status: 'pending' | 'completed' | 'declined';
  created_at: string;
  completed_at: string | null;
}

export interface CardTemplate {
  id: number;
  agent_name: string;
  class: string;
  element: string;
  str: number;
  int: number;
  cha: number;
  wis: number;
  dex: number;
  kar: number;
  special_ability: string | null;
  ability_description: string | null;
}

export interface RaritySupply {
  rarity: string;
  max_supply: number;
  minted: number;
}

export interface LeaderboardEntry {
  name: string;
  elo: number;
  wins: number;
  losses: number;
  packs_opened: number;
  cards_collected: number;
}
