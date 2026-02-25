import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ReadableStream } from 'stream/web';
import {
  MCPRequest,
  MCPResponse,
  MCPTool,
  ClientConfig,
  AuthResult,
  CollectionResult,
  PackResult,
  OpenPackResult,
  BattleResult,
  TradeResult,
  LeaderboardResult,
  ErrorResponse,
} from '../types/index.js';

export class MCPClient {
  private client: AxiosInstance;
  private config: ClientConfig;
  private requestId: number = 0;

  constructor(config: ClientConfig) {
    this.config = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.serverUrl,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestId}`;
  }

  private async sendMCPRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const response: AxiosResponse = await this.client.post('/mcp', request);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return axiosError.response.data as MCPResponse;
      }
      throw new Error(`MCP request failed: ${axiosError.message}`);
    }
  }

  private async parseSSEResponse(
    response: AxiosResponse<ReadableStream>
  ): Promise<MCPResponse> {
    if (!response.data) {
      throw new Error('No response data');
    }

    // Check if response data is a Node.js IncomingMessage (has 'on' method)
    const isNodeStream = response.data && typeof (response.data as any).on === 'function';
    
    if (isNodeStream) {
      // Handle Node.js IncomingMessage
      const stream = response.data as any;
      
      return new Promise((resolve, reject) => {
        let buffer = '';
        
        stream.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          
          // Process complete SSE events as they come
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('event: message')) {
              const dataIndex = i + 1;
              if (dataIndex < lines.length && lines[dataIndex].startsWith('data:')) {
                const dataLine = lines[dataIndex];
                const jsonData = dataLine.slice(5).trim();
                try {
                  const parsed = JSON.parse(jsonData);
                  stream.removeAllListeners('data');
                  stream.removeAllListeners('end');
                  stream.removeAllListeners('error');
                  resolve(parsed);
                  return;
                } catch (e) {
                  // Continue
                }
              }
            }
          }
        });
        
        stream.on('end', () => {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line.startsWith('event: message') && i + 1 < lines.length) {
                const dataLine = lines[i + 1];
                if (dataLine.startsWith('data:')) {
                  const jsonData = dataLine.slice(5).trim();
                  try {
                    const parsed = JSON.parse(jsonData);
                    resolve(parsed);
                    return;
                  } catch (e) {
                    // Continue
                  }
                }
              }
            }
          }
          
          reject(new Error('No valid SSE message received'));
        });
        
        stream.on('error', (error: Error) => {
          reject(error);
        });
      });
    }

    // Check if response data is a ReadableStream (browser)
    const hasGetReader = response.data && typeof (response.data as any).getReader === 'function';
    
    if (!hasGetReader) {
      // If not a stream, the data is already parsed JSON
      if (response.data && typeof response.data === 'object' && 'result' in response.data) {
        return response.data as unknown as MCPResponse;
      }
      throw new Error('Response is not a stream and not valid JSON');
    }

    // Read the stream as text and parse SSE manually (browser ReadableStream)
    const reader = (response.data as ReadableStream).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const readResult = await reader.read();
        if (readResult.done) break;

        const value = readResult.value;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('event: message')) {
            // Next line should be data:
            const dataIndex = i + 1;
            if (dataIndex < lines.length && lines[dataIndex].startsWith('data:')) {
              const dataLine = lines[dataIndex];
              const jsonData = dataLine.slice(5).trim(); // Remove "data: " prefix
              try {
                return JSON.parse(jsonData);
              } catch (e) {
                // Continue parsing
              }
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('event: message') && i + 1 < lines.length) {
            const dataLine = lines[i + 1];
            if (dataLine.startsWith('data:')) {
              const jsonData = dataLine.slice(5).trim();
              try {
                return JSON.parse(jsonData);
              } catch (e) {
                // Continue
              }
            }
          }
        }
      }

      // If no SSE format, try direct JSON parsing
      if (buffer.trim().startsWith('{')) {
        try {
          return JSON.parse(buffer);
        } catch (e) {
          // Not valid JSON
        }
      }
    } finally {
      reader.releaseLock();
    }

    throw new Error('No valid SSE message received');
  }

  private parseSSEResponseFromText(responseText: string): MCPResponse {
    // Parse SSE response from text
    const lines = responseText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('event: message')) {
        const dataIndex = i + 1;
        if (dataIndex < lines.length && lines[dataIndex].startsWith('data:')) {
          const dataLine = lines[dataIndex];
          const jsonData = dataLine.slice(5).trim(); // Remove "data: " prefix
          try {
            return JSON.parse(jsonData);
          } catch (e) {
            // Continue parsing
          }
        }
      }
    }
    
    throw new Error('No valid SSE message found in response');
  }

  async listTools(): Promise<MCPTool[]> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.generateRequestId(),
      method: 'tools/list',
      params: {},
    };

    try {
      // Server requires both application/json and text/event-stream
      // But axios will return the entire SSE response as a string
      const response = await this.client.post('/mcp', request, {
        headers: {
          ...this.config.headers,
          'Accept': 'application/json, text/event-stream',
        },
        responseType: 'text', // Use text to get the raw response
      });

      if (response.data) {
        // Parse the SSE response
        const parsed = await this.parseSSEResponseFromText(response.data);
        if (parsed?.result?.tools) {
          return parsed.result.tools;
        }
      }
    } catch (error) {
      console.error('Request failed:', error);
      // Try with JSON only as fallback
      try {
        const fallbackResponse = await this.client.post('/mcp', request, {
          headers: {
            ...this.config.headers,
            'Accept': 'application/json',
          },
        });

        if (fallbackResponse.data?.result?.tools) {
          return fallbackResponse.data.result.tools;
        }
        
        if (fallbackResponse.data?.tools) {
          return fallbackResponse.data.tools;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    throw new Error('Failed to list tools');
  }

  async callTool(
    toolName: string,
    arguments_: Record<string, any>,
    apiKey?: string
  ): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.generateRequestId(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: {
          ...arguments_,
          ...(apiKey ? { moltbook_api_key: apiKey } : {}),
        },
      },
    };

    try {
      const response = await this.client.post('/mcp', request, {
        headers: {
          ...this.config.headers,
          'Accept': 'application/json, text/event-stream',
        },
        responseType: 'text',
      });

      if (response.data) {
        const parsed = this.parseSSEResponseFromText(response.data);
        if (parsed.result) {
          return parsed.result;
        }
      }
    } catch (error) {
      console.error('Call tool failed:', error);
      throw error;
    }

    throw new Error('Failed to call tool');
  }

  // Common operations
  async getCollection(apiKey: string): Promise<CollectionResult> {
    const result = await this.callTool('moltimon_get_collection', {}, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getPacks(apiKey: string): Promise<PackResult> {
    const result = await this.callTool('moltimon_get_packs', {}, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async openPack(apiKey: string, packId: string): Promise<OpenPackResult> {
    const result = await this.callTool('moltimon_open_pack', { pack_id: packId }, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async battleChallenge(
    apiKey: string,
    opponent: string,
    cardId?: string
  ): Promise<BattleResult> {
    const args: Record<string, any> = { opponent };
    if (cardId) args.card_id = cardId;

    const result = await this.callTool('moltimon_battle_challenge', args, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async battleAccept(
    apiKey: string,
    battleId: string,
    cardId?: string
  ): Promise<BattleResult> {
    const args: Record<string, any> = { battle_id: battleId };
    if (cardId) args.card_id = cardId;

    const result = await this.callTool('moltimon_battle_accept', args, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async tradeRequest(
    apiKey: string,
    toAgent: string,
    offer: string[],
    want: string[]
  ): Promise<TradeResult> {
    const result = await this.callTool('moltimon_trade_request', {
      to_agent: toAgent,
      offer,
      want,
    }, apiKey);

    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async tradeAccept(apiKey: string, tradeId: string): Promise<TradeResult> {
    const result = await this.callTool('moltimon_trade_accept', { trade_id: tradeId }, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getLeaderboard(sortBy: string = 'elo', apiKey?: string): Promise<LeaderboardResult> {
    const result = await this.callTool('moltimon_leaderboard', { sort_by: sortBy }, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getProfile(apiKey: string): Promise<any> {
    const result = await this.callTool('moltimon_get_profile', {}, apiKey);
    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  async getNotifications(apiKey: string, includeRead: boolean = false): Promise<any> {
    const result = await this.callTool('moltimon_get_notifications', {
      include_read: includeRead,
    }, apiKey);

    const text = result.content?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return result;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data?.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  // Get tools manifest
  async getToolsManifest(): Promise<any> {
    try {
      const response = await this.client.get('/tools.json');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch tools manifest');
    }
  }

  // Discover server capabilities
  async discover(): Promise<any> {
    try {
      const response = await this.client.get('/.well-known/agent.json');
      return response.data;
    } catch (error) {
      throw new Error('Failed to discover server capabilities');
    }
  }

  // Get connection guide
  async getConnectGuide(): Promise<any> {
    try {
      const response = await this.client.get('/connect');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch connection guide');
    }
  }
}

export class MCPClientFactory {
  static create(config: ClientConfig): MCPClient {
    return new MCPClient(config);
  }

  static fromEnv(): MCPClient {
    const serverUrl = process.env.MCP_SERVER_URL || 'https://moltimon.live';
    const apiKey = process.env.MOLTBOOK_API_KEY || process.env.TEST_API_KEY || 'test_key';

    return new MCPClient({
      serverUrl,
      apiKey,
    });
  }
}