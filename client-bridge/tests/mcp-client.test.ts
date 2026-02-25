import { describe, it, expect, beforeEach } from 'vitest';
import { MCPClient, MCPClientFactory } from '../src/clients/mcp-client.js';
import { ClientConfig } from '../src/types/index.js';

describe('MCPClient', () => {
  let client: MCPClient;
  let config: ClientConfig;

  beforeEach(() => {
    config = {
      serverUrl: 'http://localhost:3000',
      apiKey: 'test_key',
      timeout: 5000,
    };
    client = MCPClientFactory.create(config);
  });

  describe('Constructor', () => {
    it('should create a client with valid config', () => {
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(MCPClient);
    });

    it('should use default timeout if not provided', () => {
      const clientWithDefaultTimeout = MCPClientFactory.create({
        serverUrl: 'http://localhost:3000',
        apiKey: 'test_key',
      });
      expect(clientWithDefaultTimeout).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should have a healthCheck method', () => {
      expect(typeof client.healthCheck).toBe('function');
    });
  });

  describe('Tool Operations', () => {
    it('should have a listTools method', () => {
      expect(typeof client.listTools).toBe('function');
    });

    it('should have a callTool method', () => {
      expect(typeof client.callTool).toBe('function');
    });
  });

  describe('Collection Operations', () => {
    it('should have a getCollection method', () => {
      expect(typeof client.getCollection).toBe('function');
    });
  });

  describe('Pack Operations', () => {
    it('should have getPacks and openPack methods', () => {
      expect(typeof client.getPacks).toBe('function');
      expect(typeof client.openPack).toBe('function');
    });
  });

  describe('Battle Operations', () => {
    it('should have battleChallenge and battleAccept methods', () => {
      expect(typeof client.battleChallenge).toBe('function');
      expect(typeof client.battleAccept).toBe('function');
    });
  });

  describe('Trade Operations', () => {
    it('should have tradeRequest and tradeAccept methods', () => {
      expect(typeof client.tradeRequest).toBe('function');
      expect(typeof client.tradeAccept).toBe('function');
    });
  });

  describe('Leaderboard Operations', () => {
    it('should have a getLeaderboard method', () => {
      expect(typeof client.getLeaderboard).toBe('function');
    });
  });

  describe('Profile Operations', () => {
    it('should have a getProfile method', () => {
      expect(typeof client.getProfile).toBe('function');
    });
  });

  describe('Notification Operations', () => {
    it('should have a getNotifications method', () => {
      expect(typeof client.getNotifications).toBe('function');
    });

    it('should have a getNotificationCount method', () => {
      expect(typeof client.getNotificationCount).toBe('function');
    });

    it('should have a markNotificationRead method', () => {
      expect(typeof client.markNotificationRead).toBe('function');
    });

    it('should have a markAllNotificationsRead method', () => {
      expect(typeof client.markAllNotificationsRead).toBe('function');
    });

    it('should have a deleteNotification method', () => {
      expect(typeof client.deleteNotification).toBe('function');
    });
  });

  describe('History Operations', () => {
    it('should have a getBattleHistory method', () => {
      expect(typeof client.getBattleHistory).toBe('function');
    });

    it('should have a getTradeHistory method', () => {
      expect(typeof client.getTradeHistory).toBe('function');
    });
  });

  describe('Friend Operations', () => {
    it('should have a sendFriendRequest method', () => {
      expect(typeof client.sendFriendRequest).toBe('function');
    });

    it('should have an acceptFriendRequest method', () => {
      expect(typeof client.acceptFriendRequest).toBe('function');
    });

    it('should have a declineFriendRequest method', () => {
      expect(typeof client.declineFriendRequest).toBe('function');
    });

    it('should have a getFriends method', () => {
      expect(typeof client.getFriends).toBe('function');
    });

    it('should have a getIncomingFriendRequests method', () => {
      expect(typeof client.getIncomingFriendRequests).toBe('function');
    });
  });

  describe('Deck Operations', () => {
    it('should have a createDeck method', () => {
      expect(typeof client.createDeck).toBe('function');
    });

    it('should have an updateDeck method', () => {
      expect(typeof client.updateDeck).toBe('function');
    });

    it('should have a getDecks method', () => {
      expect(typeof client.getDecks).toBe('function');
    });

    it('should have a getActiveDeck method', () => {
      expect(typeof client.getActiveDeck).toBe('function');
    });
  });

  describe('Message Operations', () => {
    it('should have a sendMessage method', () => {
      expect(typeof client.sendMessage).toBe('function');
    });

    it('should have a getConversation method', () => {
      expect(typeof client.getConversation).toBe('function');
    });

    it('should have a getRecentConversations method', () => {
      expect(typeof client.getRecentConversations).toBe('function');
    });

    it('should have a getUnreadMessageCount method', () => {
      expect(typeof client.getUnreadMessageCount).toBe('function');
    });
  });

  describe('Achievement Operations', () => {
    it('should have a getAllAchievements method', () => {
      expect(typeof client.getAllAchievements).toBe('function');
    });

    it('should have a getMyAchievements method', () => {
      expect(typeof client.getMyAchievements).toBe('function');
    });

    it('should have a checkAchievements method', () => {
      expect(typeof client.checkAchievements).toBe('function');
    });

    it('should have a getAvailableAchievements method', () => {
      expect(typeof client.getAvailableAchievements).toBe('function');
    });
  });

  describe('Quest Operations', () => {
    it('should have a getAllQuests method', () => {
      expect(typeof client.getAllQuests).toBe('function');
    });

    it('should have a getMyQuests method', () => {
      expect(typeof client.getMyQuests).toBe('function');
    });

    it('should have a getAvailableQuests method', () => {
      expect(typeof client.getAvailableQuests).toBe('function');
    });

    it('should have a startQuest method', () => {
      expect(typeof client.startQuest).toBe('function');
    });

    it('should have a getUserCompletedQuests method', () => {
      expect(typeof client.getUserCompletedQuests).toBe('function');
    });

    it('should have an updateQuestProgress method', () => {
      expect(typeof client.updateQuestProgress).toBe('function');
    });

    it('should have a resetQuests method', () => {
      expect(typeof client.resetQuests).toBe('function');
    });
  });

  describe('Trade Operations', () => {
    it('should have a tradeDecline method', () => {
      expect(typeof client.tradeDecline).toBe('function');
    });
  });

  describe('Battle Operations', () => {
    it('should have a battleDecline method', () => {
      expect(typeof client.battleDecline).toBe('function');
    });
  });

  describe('Discovery Operations', () => {
    it('should have discover, getToolsManifest, and getConnectGuide methods', () => {
      expect(typeof client.discover).toBe('function');
      expect(typeof client.getToolsManifest).toBe('function');
      expect(typeof client.getConnectGuide).toBe('function');
    });
  });
});

describe('MCPClientFactory', () => {
  describe('create', () => {
    it('should create a client instance', () => {
      const config: ClientConfig = {
        serverUrl: 'http://localhost:3000',
        apiKey: 'test_key',
      };
      const client = MCPClientFactory.create(config);
      expect(client).toBeInstanceOf(MCPClient);
    });
  });

  describe('fromEnv', () => {
    it('should create a client from environment variables', () => {
      // Set environment variables
      process.env.MCP_SERVER_URL = 'http://test:3000';
      process.env.MOLTBOOK_API_KEY = 'test_api_key';

      const client = MCPClientFactory.fromEnv();
      expect(client).toBeInstanceOf(MCPClient);

      // Clean up
      delete process.env.MCP_SERVER_URL;
      delete process.env.MOLTBOOK_API_KEY;
    });

    it('should use defaults when environment variables are not set', () => {
      // Clear any existing env vars
      delete process.env.MCP_SERVER_URL;
      delete process.env.MOLTBOOK_API_KEY;
      delete process.env.TEST_API_KEY;

      const client = MCPClientFactory.fromEnv();
      expect(client).toBeInstanceOf(MCPClient);
    });
  });
});