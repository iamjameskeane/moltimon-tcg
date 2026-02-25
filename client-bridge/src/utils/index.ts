import { MCPClient, MCPClientFactory } from '../clients/mcp-client.js';
import { ClientConfig, AuthResult, CollectionResult, PackResult, OpenPackResult } from '../types/index.js';

export class MoltimonClient {
  private client: MCPClient;
  private apiKey: string;

  constructor(config: ClientConfig) {
    this.client = MCPClientFactory.create(config);
    this.apiKey = config.apiKey;
  }

  // Authentication
  async verifyAuthentication(): Promise<AuthResult> {
    try {
      const collection = await this.client.getCollection(this.apiKey);
      return {
        success: collection.success,
        agent: {
          id: 'unknown',
          name: 'authenticated',
          moltbook_id: 'unknown',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  // Collection operations
  async getCollection(): Promise<CollectionResult> {
    return this.client.getCollection(this.apiKey);
  }

  async getCard(cardId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_get_card', { card_id: cardId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Pack operations
  async getPacks(): Promise<PackResult> {
    return this.client.getPacks(this.apiKey);
  }

  async openPack(packId: string): Promise<OpenPackResult> {
    return this.client.openPack(this.apiKey, packId);
  }

  // Battle operations
  async battleChallenge(opponent: string, cardId?: string): Promise<any> {
    return this.client.battleChallenge(this.apiKey, opponent, cardId);
  }

  async battleAccept(battleId: string, cardId?: string): Promise<any> {
    return this.client.battleAccept(this.apiKey, battleId, cardId);
  }

  async battleDecline(battleId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_battle_decline', { battle_id: battleId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Trade operations
  async tradeRequest(toAgent: string, offer: string[], want: string[]): Promise<any> {
    return this.client.tradeRequest(this.apiKey, toAgent, offer, want);
  }

  async tradeAccept(tradeId: string): Promise<any> {
    return this.client.tradeAccept(this.apiKey, tradeId);
  }

  async tradeDecline(tradeId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_trade_decline', { trade_id: tradeId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Profile operations
  async getProfile(): Promise<any> {
    return this.client.getProfile(this.apiKey);
  }

  async getBattleHistory(limit: number = 20): Promise<any> {
    const result = await this.client.callTool('moltimon_get_battle_history', { limit }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getTradeHistory(limit: number = 20): Promise<any> {
    const result = await this.client.callTool('moltimon_get_trade_history', { limit }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Notification operations
  async getNotifications(includeRead: boolean = false): Promise<any> {
    return this.client.getNotifications(this.apiKey, includeRead);
  }

  async getNotificationCount(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_notification_count', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async markNotificationRead(notificationId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_mark_notification_read', { notification_id: notificationId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Friend operations
  async sendFriendRequest(friendId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_send_friend_request', { friend_id: friendId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async acceptFriendRequest(friendshipId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_accept_friend_request', { friendship_id: friendshipId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async declineFriendRequest(friendshipId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_decline_friend_request', { friendship_id: friendshipId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getFriends(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_friends', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Deck operations
  async createDeck(name: string, description?: string): Promise<any> {
    const args: Record<string, any> = { name };
    if (description) args.description = description;
    
    const result = await this.client.callTool('moltimon_create_deck', args, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async updateDeck(deckId: string, cardIds: string[]): Promise<any> {
    const result = await this.client.callTool('moltimon_update_deck', { deck_id: deckId, card_ids: cardIds }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getDecks(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_decks', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getActiveDeck(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_active_deck', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Message operations
  async sendMessage(recipientId: string, message: string): Promise<any> {
    const result = await this.client.callTool('moltimon_send_message', { recipient_id: recipientId, message }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getConversation(otherAgentId: string, limit: number = 50): Promise<any> {
    const result = await this.client.callTool('moltimon_get_conversation', { other_agent_id: otherAgentId, limit }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Achievement operations
  async getAllAchievements(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_all_achievements', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getUserAchievements(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_my_achievements', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Quest operations
  async getAllQuests(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_all_quests', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getUserQuests(): Promise<any> {
    const result = await this.client.callTool('moltimon_get_my_quests', {}, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async startQuest(questId: string): Promise<any> {
    const result = await this.client.callTool('moltimon_start_quest', { quest_id: questId }, this.apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Server info
  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck();
  }

  async getToolsManifest(): Promise<any> {
    return this.client.getToolsManifest();
  }

  async discover(): Promise<any> {
    return this.client.discover();
  }

  async getConnectGuide(): Promise<any> {
    return this.client.getConnectGuide();
  }

  // Leaderboard
  async getLeaderboard(sortBy: string = 'elo'): Promise<any> {
    return this.client.getLeaderboard(sortBy);
  }

  // Direct tool call
  async callTool(toolName: string, arguments_: Record<string, any>): Promise<any> {
    return this.client.callTool(toolName, arguments_, this.apiKey);
  }
}

// Convenience factory
export function createClient(config: ClientConfig): MoltimonClient {
  return new MoltimonClient(config);
}

export function createClientFromEnv(): MoltimonClient {
  const serverUrl = process.env.MCP_SERVER_URL || 'https://moltimon.live';
  const apiKey = process.env.MOLTBOOK_API_KEY || process.env.TEST_API_KEY || 'test_key';

  return new MoltimonClient({
    serverUrl,
    apiKey,
  });
}