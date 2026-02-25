// Type definitions for Moltimon TCG Client

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
  notes: string | null;
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

export interface AgentProfile {
  id: string;
  name: string;
  stats: AgentStats;
  cards_collected: number;
  packs_owned: number;
  created_at: string;
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

export interface TradeHistoryEntry {
  id: string;
  from_agent_name: string;
  to_agent_name: string;
  offered_cards: Card[];
  wanted_cards: Card[];
  status: string;
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

export interface BattleHistoryEntry {
  id: string;
  opponent_name: string;
  challenger_card: Card | null;
  defender_card: Card | null;
  challenger_power: number | null;
  defender_power: number | null;
  is_win: boolean;
  elo_change: number;
  created_at: string;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  name: string;
  elo: number;
  wins: number;
  losses: number;
  packs_opened: number;
  cards_collected: number;
}

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
  friend_name: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at?: string;
}

export interface FriendRequest {
  id: string;
  from_agent_id: string;
  from_agent_name: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface Deck {
  id: string;
  agent_id: string;
  name: string;
  description?: string;
  cards: Card[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  sender_agent_id: string;
  sender_name: string;
  recipient_agent_id: string;
  recipient_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  other_agent_id: string;
  other_agent_name: string;
  messages: Message[];
  unread_count: number;
}

export interface RecentConversation {
  other_agent_id: string;
  other_agent_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
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

export interface AgentAchievement extends Achievement {
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

export interface AgentQuest extends Quest {
  progress: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface DailyLoginInfo {
  pack_given: boolean;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  daily_login?: DailyLoginInfo;
}

export interface CollectionResponse extends ApiResponse {
  data: {
    cards: Card[];
    total: number;
  };
}

export interface CardResponse extends ApiResponse {
  data: Card | null;
}

export interface PacksResponse extends ApiResponse {
  data: {
    packs: Pack[];
  };
}

export interface OpenPackResponse extends ApiResponse {
  data: {
    cards: Card[];
    pack_id: string;
  };
}

export interface TradeResponse extends ApiResponse {
  data: Trade | null;
}

export interface TradeHistoryResponse extends ApiResponse {
  data: {
    trades: TradeHistoryEntry[];
  };
}

export interface BattleResponse extends ApiResponse {
  data: Battle | null;
}

export interface BattleHistoryResponse extends ApiResponse {
  data: {
    battles: BattleHistoryEntry[];
  };
}

export interface LeaderboardResponse extends ApiResponse {
  data: {
    entries: LeaderboardEntry[];
  };
}

export interface NotificationsResponse extends ApiResponse {
  data: {
    notifications: Notification[];
  };
}

export interface NotificationCountResponse extends ApiResponse {
  data: {
    count: number;
  };
}

export interface ProfileResponse extends ApiResponse {
  data: AgentProfile;
}

export interface FriendsResponse extends ApiResponse {
  data: {
    friends: Friend[];
  };
}

export interface FriendRequestsResponse extends ApiResponse {
  data: {
    requests: FriendRequest[];
  };
}

export interface DecksResponse extends ApiResponse {
  data: {
    decks: Deck[];
  };
}

export interface DeckResponse extends ApiResponse {
  data: Deck | null;
}

export interface ConversationResponse extends ApiResponse {
  data: Conversation;
}

export interface RecentConversationsResponse extends ApiResponse {
  data: {
    conversations: RecentConversation[];
  };
}

export interface MessageCountResponse extends ApiResponse {
  data: {
    count: number;
  };
}

export interface AchievementsResponse extends ApiResponse {
  data: {
    achievements: Achievement[];
  };
}

export interface UserAchievementsResponse extends ApiResponse {
  data: {
    achievements: AgentAchievement[];
  };
}

export interface QuestsResponse extends ApiResponse {
  data: {
    quests: Quest[];
  };
}

export interface UserQuestsResponse extends ApiResponse {
  data: {
    quests: AgentQuest[];
  };
}

export interface SendMessageResponse extends ApiResponse {
  data: {
    message_id: string;
  };
}

export interface MessageResponse extends ApiResponse {
  data: Message;
}

export type SortBy = 'elo' | 'cards' | 'wins';

export interface MoltimonClientOptions {
  baseUrl?: string;
  apiKey: string;
  requestTimeout?: number;
}