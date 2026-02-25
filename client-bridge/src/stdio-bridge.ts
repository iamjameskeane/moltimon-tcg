#!/usr/bin/env node

import * as readline from 'readline';
import { MCPClient, MCPClientFactory } from './clients/mcp-client.js';
import { loadConfig, printError, printSuccess, printInfo, formatOutput } from './cli/utils.js';
import { StdioCommand, StdioResponse } from './types/index.js';

class StdioBridge {
  private client: MCPClient | null = null;
  private config: any = null;

  async processCommand(command: StdioCommand): Promise<StdioResponse> {
    const timestamp = new Date().toISOString();

    try {
      // Initialize client if needed
      if (!this.client || !this.config) {
        this.config = command.config || await loadConfig();
        this.client = MCPClientFactory.create(this.config);
      }

      const { action, args = {} } = command;

      switch (action) {
        case 'connect':
          const isHealthy = await this.client.healthCheck();
          return {
            success: isHealthy,
            data: { healthy: isHealthy, server: this.config.serverUrl },
            command: action,
            timestamp,
          };

        case 'list_tools':
          const tools = await this.client.listTools();
          return {
            success: true,
            data: tools,
            command: action,
            timestamp,
          };

        case 'get_collection':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          const collection = await this.client.getCollection(this.config.apiKey);
          return {
            success: collection.success,
            data: collection,
            command: action,
            timestamp,
          };

        case 'get_packs':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          const packs = await this.client.getPacks(this.config.apiKey);
          return {
            success: packs.success,
            data: packs,
            command: action,
            timestamp,
          };

        case 'open_pack':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          if (!args.pack_id) {
            return {
              success: false,
              error: 'pack_id required',
              command: action,
              timestamp,
            };
          }
          const openedPack = await this.client.openPack(this.config.apiKey, args.pack_id);
          return {
            success: openedPack.success,
            data: openedPack,
            command: action,
            timestamp,
          };

        case 'battle_challenge':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          if (!args.opponent) {
            return {
              success: false,
              error: 'opponent required',
              command: action,
              timestamp,
            };
          }
          const battleResult = await this.client.battleChallenge(
            this.config.apiKey,
            args.opponent,
            args.card_id
          );
          return {
            success: battleResult.success,
            data: battleResult,
            command: action,
            timestamp,
          };

        case 'battle_accept':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          if (!args.battle_id) {
            return {
              success: false,
              error: 'battle_id required',
              command: action,
              timestamp,
            };
          }
          const acceptResult = await this.client.battleAccept(
            this.config.apiKey,
            args.battle_id,
            args.card_id
          );
          return {
            success: acceptResult.success,
            data: acceptResult,
            command: action,
            timestamp,
          };

        case 'trade_request':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          if (!args.to_agent || !args.offer || !args.want) {
            return {
              success: false,
              error: 'to_agent, offer, and want required',
              command: action,
              timestamp,
            };
          }
          const tradeRequest = await this.client.tradeRequest(
            this.config.apiKey,
            args.to_agent,
            args.offer,
            args.want
          );
          return {
            success: tradeRequest.success,
            data: tradeRequest,
            command: action,
            timestamp,
          };

        case 'trade_accept':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          if (!args.trade_id) {
            return {
              success: false,
              error: 'trade_id required',
              command: action,
              timestamp,
            };
          }
          const tradeAccept = await this.client.tradeAccept(this.config.apiKey, args.trade_id);
          return {
            success: tradeAccept.success,
            data: tradeAccept,
            command: action,
            timestamp,
          };

        case 'leaderboard':
          const leaderboard = await this.client.getLeaderboard(args.sort_by || 'elo');
          return {
            success: leaderboard.success,
            data: leaderboard,
            command: action,
            timestamp,
          };

        case 'get_profile':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          const profile = await this.client.getProfile(this.config.apiKey);
          return {
            success: profile.success,
            data: profile,
            command: action,
            timestamp,
          };

        case 'get_notifications':
          if (!this.config.apiKey) {
            return {
              success: false,
              error: 'API key required',
              command: action,
              timestamp,
            };
          }
          const notifications = await this.client.getNotifications(
            this.config.apiKey,
            args.include_read || false
          );
          return {
            success: notifications.success,
            data: notifications,
            command: action,
            timestamp,
          };

        case 'call_tool':
          if (!args.tool_name) {
            return {
              success: false,
              error: 'tool_name required',
              command: action,
              timestamp,
            };
          }
          const toolResult = await this.client.callTool(
            args.tool_name,
            args.arguments || {},
            this.config.apiKey
          );
          return {
            success: true,
            data: toolResult,
            command: action,
            timestamp,
          };

        case 'discover':
          const discovery = await this.client.discover();
          return {
            success: true,
            data: discovery,
            command: action,
            timestamp,
          };

        case 'get_tools_manifest':
          const manifest = await this.client.getToolsManifest();
          return {
            success: true,
            data: manifest,
            command: action,
            timestamp,
          };

        case 'get_connect_guide':
          const guide = await this.client.getConnectGuide();
          return {
            success: true,
            data: guide,
            command: action,
            timestamp,
          };

        case 'get_card':
          if (!args.card_id) {
            return {
              success: false,
              error: 'card_id required',
              command: action,
              timestamp,
            };
          }
          const cardResult = await this.client.callTool('moltimon_get_card', {
            card_id: args.card_id,
          }, this.config.apiKey);
          
          const text = cardResult.content?.[0]?.text;
          if (text) {
            try {
              const data = JSON.parse(text);
              // Return only card details (without ASCII art)
              if (data.card) {
                const cardDetails = { ...data.card };
                // Remove the ASCII art field
                delete cardDetails.art;
                delete cardDetails.ascii_card;
                return {
                  success: true,
                  data: cardDetails,
                  command: action,
                  timestamp,
                };
              } else {
                return {
                  success: true,
                  data: data,
                  command: action,
                  timestamp,
                };
              }
            } catch (e) {
              return {
                success: false,
                error: 'Failed to parse card data',
                command: action,
                timestamp,
              };
            }
          } else {
            return {
              success: false,
              error: 'No card data returned',
              command: action,
              timestamp,
            };
          }

        case 'inspect_card':
          if (!args.card_id) {
            return {
              success: false,
              error: 'card_id required',
              command: action,
              timestamp,
            };
          }
          const inspectResult = await this.client.callTool('moltimon_get_card', {
            card_id: args.card_id,
          }, this.config.apiKey);
          
          const inspectText = inspectResult.content?.[0]?.text;
          if (inspectText) {
            try {
              const data = JSON.parse(inspectText);
              // Return ANSI art only for inspection
              if (data.ascii_card) {
                return {
                  success: true,
                  data: { ansi_art: data.ascii_card },
                  command: action,
                  timestamp,
                };
              } else {
                return {
                  success: false,
                  error: 'No ANSI art found in card data',
                  command: action,
                  timestamp,
                };
              }
            } catch (e) {
              return {
                success: false,
                error: 'Failed to parse card data',
                command: action,
                timestamp,
              };
            }
          } else {
            return {
              success: false,
              error: 'No card data returned',
              command: action,
              timestamp,
            };
          }

        case 'health':
          const healthy = await this.client.healthCheck();
          return {
            success: healthy,
            data: { healthy },
            command: action,
            timestamp,
          };

        default:
          return {
            success: false,
            error: `Unknown action: ${action}`,
            command: action,
            timestamp,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        command: command.action,
        timestamp,
      };
    }
  }

  async run(): Promise<void> {
    const stdin = process.stdin;
    const stdout = process.stdout;
    const stderr = process.stderr;

    const rl = readline.createInterface({
      input: stdin,
      output: stdout,
      terminal: false,
    });

    rl.on('line', async (line) => {
      try {
        const command: StdioCommand = JSON.parse(line);
        const response = await this.processCommand(command);
        
        stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        const errorResponse: StdioResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid JSON command',
          timestamp: new Date().toISOString(),
        };
        stderr.write(JSON.stringify(errorResponse) + '\n');
      }
    });

    rl.on('close', () => {
      // Clean up
      process.exit(0);
    });
  }
}

// Main entry point
async function main() {
  const bridge = new StdioBridge();

  // Check for initial config from environment
  if (process.env.MOLTBOOK_API_KEY && process.env.MCP_SERVER_URL) {
    bridge['config'] = {
      serverUrl: process.env.MCP_SERVER_URL,
      apiKey: process.env.MOLTBOOK_API_KEY,
    };
    bridge['client'] = MCPClientFactory.create(bridge['config']);
  }

  await bridge.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { StdioBridge };