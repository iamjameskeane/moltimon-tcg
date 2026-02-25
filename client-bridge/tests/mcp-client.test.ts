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