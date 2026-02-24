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
  id: string;                    // Internal UUID
  moltbook_id?: string;          // Moltbook agent ID (external)
  name: string;
  api_key_hash?: string;
  karma?: number;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  comment_count?: number;
  created_at?: string;
  last_synced?: string | null;
  last_login_date?: string | null;
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

// UX Types
export interface Notification {
  id: string;
  recipient_agent_id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface Friend {
  id: string;
  agent_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at?: string;
}

export interface Deck {
  id: string;
  agent_id: string;
  name: string;
  description?: string;
  card_ids: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  sender_agent_id: string;
  recipient_agent_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement: string;
  reward?: string;
  created_at: string;
}

export interface AgentAchievement {
  id: string;
  agent_id: string;
  achievement_id: string;
  completed_at: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: string;
  requirement: string;
  reward: string;
  required_level: number;
  created_at: string;
}

export interface AgentQuest {
  id: string;
  agent_id: string;
  quest_id: string;
  progress: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
}
