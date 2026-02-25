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
    return this.client.getNotificationCount(this.apiKey);
  }

  async markNotificationRead(notificationId: string): Promise<any> {
    return this.client.markNotificationRead(this.apiKey, notificationId);
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.client.markAllNotificationsRead(this.apiKey);
  }

  async deleteNotification(notificationId: string): Promise<any> {
    return this.client.deleteNotification(this.apiKey, notificationId);
  }

  // Friend operations
  async sendFriendRequest(friendId: string): Promise<any> {
    return this.client.sendFriendRequest(this.apiKey, friendId);
  }

  async acceptFriendRequest(friendshipId: string): Promise<any> {
    return this.client.acceptFriendRequest(this.apiKey, friendshipId);
  }

  async declineFriendRequest(friendshipId: string): Promise<any> {
    return this.client.declineFriendRequest(this.apiKey, friendshipId);
  }

  async getFriends(): Promise<any> {
    return this.client.getFriends(this.apiKey);
  }

  async getIncomingFriendRequests(): Promise<any> {
    return this.client.getIncomingFriendRequests(this.apiKey);
  }

  // Deck operations
  async createDeck(name: string, description?: string): Promise<any> {
    return this.client.createDeck(this.apiKey, name, description);
  }

  async updateDeck(deckId: string, cardIds: string[]): Promise<any> {
    return this.client.updateDeck(this.apiKey, deckId, cardIds);
  }

  async getDecks(): Promise<any> {
    return this.client.getDecks(this.apiKey);
  }

  async getActiveDeck(): Promise<any> {
    return this.client.getActiveDeck(this.apiKey);
  }

  // Message operations
  async sendMessage(recipientId: string, message: string): Promise<any> {
    return this.client.sendMessage(this.apiKey, recipientId, message);
  }

  async getConversation(otherAgentId: string): Promise<any> {
    return this.client.getConversation(this.apiKey, otherAgentId);
  }

  async getRecentConversations(): Promise<any> {
    return this.client.getRecentConversations(this.apiKey);
  }

  async getUnreadMessageCount(): Promise<any> {
    return this.client.getUnreadMessageCount(this.apiKey);
  }

  // Achievement operations
  async getAllAchievements(): Promise<any> {
    return this.client.getAllAchievements(this.apiKey);
  }

  async getMyAchievements(): Promise<any> {
    return this.client.getMyAchievements(this.apiKey);
  }

  async checkAchievements(): Promise<any> {
    return this.client.checkAchievements(this.apiKey);
  }

  async getAvailableAchievements(): Promise<any> {
    return this.client.getAvailableAchievements(this.apiKey);
  }

  // Quest operations
  async getAllQuests(): Promise<any> {
    return this.client.getAllQuests(this.apiKey);
  }

  async getMyQuests(): Promise<any> {
    return this.client.getMyQuests(this.apiKey);
  }

  async getAvailableQuests(): Promise<any> {
    return this.client.getAvailableQuests(this.apiKey);
  }

  async startQuest(questId: string): Promise<any> {
    return this.client.startQuest(this.apiKey, questId);
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