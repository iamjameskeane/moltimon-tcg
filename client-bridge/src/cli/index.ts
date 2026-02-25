#!/usr/bin/env node

import { Command } from 'commander';
import { MCPClient, MCPClientFactory } from '../clients/mcp-client.js';
import { CLIOptions } from '../types/index.js';
import { loadConfig, saveConfig, formatOutput, printError, printSuccess, printInfo } from './utils.js';

const program = new Command();

program
  .name('moltimon')
  .description('CLI client for Moltimon MCP server')
  .version('0.1.0')
  .option('-u, --server-url <url>', 'MCP server URL', 'https://moltimon.live')
  .option('-k, --api-key <key>', 'Moltbook API key')
  .option('-f, --format <format>', 'Output format: json, pretty, text', 'pretty')
  .option('-v, --verbose', 'Verbose output')
  .option('--env', 'Use environment variables for configuration');

program
  .command('config')
  .description('Configure client settings')
  .argument('[server-url]', 'MCP server URL')
  .argument('[api-key]', 'Moltbook API key')
  .action(async (serverUrl?: string, apiKey?: string, options: CLIOptions = {}) => {
    try {
      const config = await loadConfig();
      
      if (!serverUrl && !apiKey) {
        printInfo('Current configuration:', config);
        return;
      }

      const newConfig = {
        serverUrl: serverUrl || config.serverUrl || 'https://moltimon.live',
        apiKey: apiKey || config.apiKey || 'test_key',
      };

      await saveConfig(newConfig);
      printSuccess('Configuration saved:', newConfig);
    } catch (error) {
      printError('Failed to configure:', error);
    }
  });

program
  .command('health')
  .description('Check server health')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const isHealthy = await client.healthCheck();
      
      if (isHealthy) {
        printSuccess('Server is healthy and running');
      } else {
        printError('Server is not responding');
        process.exit(1);
      }
    } catch (error) {
      printError('Health check failed:', error);
      process.exit(1);
    }
  });

program
  .command('discover')
  .description('Discover server capabilities')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const discovery = await client.discover();
      
      formatOutput(discovery, options.format);
    } catch (error) {
      printError('Discovery failed:', error);
      process.exit(1);
    }
  });

program
  .command('tools')
  .description('List available tools')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const tools = await client.listTools();
      
      formatOutput(tools, options.format);
    } catch (error) {
      printError('Failed to list tools:', error);
      process.exit(1);
    }
  });

program
  .command('collection')
  .description('Get card collection')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const collection = await client.getCollection(config.apiKey);
      
      formatOutput(collection, options.format);
    } catch (error) {
      printError('Failed to get collection:', error);
      process.exit(1);
    }
  });

program
  .command('packs')
  .description('Get unopened packs')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const packs = await client.getPacks(config.apiKey);
      
      formatOutput(packs, options.format);
    } catch (error) {
      printError('Failed to get packs:', error);
      process.exit(1);
    }
  });

program
  .command('open-pack')
  .description('Open a pack')
  .argument('<pack-id>', 'Pack ID to open')
  .action(async (packId: string, options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const result = await client.openPack(config.apiKey, packId);
      
      formatOutput(result, options.format);
    } catch (error) {
      printError('Failed to open pack:', error);
      process.exit(1);
    }
  });

program
  .command('battle')
  .description('Challenge or accept a battle')
  .argument('[action]', 'Action: challenge or accept')
  .argument('[target]', 'Opponent ID or battle ID')
  .argument('[card-id]', 'Optional card ID to use')
  .action(async (action: string, target: string, cardId?: string, options: CLIOptions = {}) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      let result;
      
      if (action === 'challenge') {
        result = await client.battleChallenge(config.apiKey, target, cardId);
      } else if (action === 'accept') {
        result = await client.battleAccept(config.apiKey, target, cardId);
      } else {
        throw new Error('Invalid action. Use "challenge" or "accept"');
      }
      
      formatOutput(result, options.format);
    } catch (error) {
      printError('Battle action failed:', error);
      process.exit(1);
    }
  });

program
  .command('trade')
  .description('Propose or accept a trade')
  .argument('[action]', 'Action: request, accept')
  .argument('[target]', 'Target agent or trade ID')
  .argument('[offer]', 'Cards to offer (comma-separated IDs)')
  .argument('[want]', 'Cards desired (comma-separated IDs)')
  .action(async (action: string, target: string, offer?: string, want?: string, options: CLIOptions = {}) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      let result;
      
      if (action === 'request') {
        if (!offer || !want) {
          throw new Error('Offer and want are required for trade request');
        }
        const offerCards = offer.split(',').map(s => s.trim());
        const wantCards = want.split(',').map(s => s.trim());
        result = await client.tradeRequest(config.apiKey, target, offerCards, wantCards);
      } else if (action === 'accept') {
        result = await client.tradeAccept(config.apiKey, target);
      } else {
        throw new Error('Invalid action. Use "request" or "accept"');
      }
      
      formatOutput(result, options.format);
    } catch (error) {
      printError('Trade action failed:', error);
      process.exit(1);
    }
  });

program
  .command('leaderboard')
  .description('Get leaderboard')
  .argument('[sort-by]', 'Sort by: elo, wins, cards', 'elo')
  .action(async (sortBy: string = 'elo', options: CLIOptions = {}) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const leaderboard = await client.getLeaderboard(sortBy, config.apiKey);
      
      formatOutput(leaderboard, options.format);
    } catch (error) {
      printError('Failed to get leaderboard:', error);
      process.exit(1);
    }
  });

program
  .command('profile')
  .description('Get user profile')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const profile = await client.getProfile(config.apiKey);
      
      formatOutput(profile, options.format);
    } catch (error) {
      printError('Failed to get profile:', error);
      process.exit(1);
    }
  });

program
  .command('notifications')
  .description('Get notifications')
  .option('--include-read', 'Include read notifications')
  .action(async (options: CLIOptions & { includeRead?: boolean }) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const notifications = await client.getNotifications(config.apiKey, options.includeRead);
      
      formatOutput(notifications, options.format);
    } catch (error) {
      printError('Failed to get notifications:', error);
      process.exit(1);
    }
  });

program
  .command('connect')
  .description('Get connection guide')
  .action(async (options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const guide = await client.getConnectGuide();
      
      formatOutput(guide, options.format);
    } catch (error) {
      printError('Failed to get connection guide:', error);
      process.exit(1);
    }
  });

program
  .command('inspect')
  .description('Inspect a specific card with ANSI formatting')
  .argument('<card-id>', 'Card ID to inspect')
  .action(async (cardId: string, options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const result = await client.callTool('moltimon_get_card', {
        card_id: cardId,
      }, config.apiKey);
      
      const text = result.content?.[0]?.text;
      if (text) {
        try {
          const data = JSON.parse(text);
          if (data.ascii_card) {
            // Print the ANSI ASCII art directly to terminal
            process.stdout.write(data.ascii_card);
          } else if (data.card) {
            console.log(JSON.stringify(data.card, null, 2));
          } else {
            console.log(JSON.stringify(data, null, 2));
          }
        } catch (e) {
          console.log(text);
        }
      } else {
        formatOutput(result, 'json');
      }
    } catch (error) {
      printError('Failed to inspect card:', error);
      process.exit(1);
    }
  });

program
  .command('data')
  .description('Get card data without ANSI formatting')
  .argument('<card-id>', 'Card ID to fetch')
  .action(async (cardId: string, options: CLIOptions) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      const result = await client.callTool('moltimon_get_card', {
        card_id: cardId,
      }, config.apiKey);
      
      const text = result.content?.[0]?.text;
      if (text) {
        try {
          const data = JSON.parse(text);
          // Return card data without ASCII art
          if (data.card) {
            const cardDetails = { ...data.card };
            // Remove the ASCII art field
            delete cardDetails.art;
            delete cardDetails.ascii_card;
            console.log(JSON.stringify(cardDetails, null, 2));
          } else {
            console.log(JSON.stringify(data, null, 2));
          }
        } catch (e) {
          console.log(text);
        }
      } else {
        formatOutput(result, 'json');
      }
    } catch (error) {
      printError('Failed to get card data:', error);
      process.exit(1);
    }
  });

program
  .command('call')
  .description('Call any tool directly')
  .argument('<tool-name>', 'Tool name')
  .argument('[args]', 'JSON arguments', '{}')
  .option('--inspect', 'Use card inspector for ANSI output')
  .action(async (toolName: string, argsJson: string, options: CLIOptions & { inspect?: boolean } = {}) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      let args: Record<string, any> = {};
      if (argsJson) {
        try {
          args = JSON.parse(argsJson);
        } catch (e) {
          throw new Error('Invalid JSON arguments');
        }
      }
      
      const result = await client.callTool(toolName, args, config.apiKey);
      
      // Handle card inspection specially
      if (options.inspect && toolName === 'moltimon_get_card') {
        const { handleCardOutput } = await import('./card-inspector.js');
        const text = result.content?.[0]?.text;
        if (text) {
          handleCardOutput(text, 'both');
        } else {
          formatOutput(result, options.format);
        }
      } else {
        formatOutput(result, options.format);
      }
    } catch (error) {
      printError('Failed to call tool:', error);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run a predefined sequence of commands')
  .argument('<action>', 'Action: quick-start, daily-check, test-battle')
  .action(async (action: string, options: CLIOptions = {}) => {
    try {
      const config = await loadConfig(options);
      const client = MCPClientFactory.create(config);
      
      switch (action) {
        case 'quick-start':
          printInfo('Quick Start: Getting collection...');
          const collection = await client.getCollection(config.apiKey);
          formatOutput(collection, options.format);
          
          printInfo('Quick Start: Getting packs...');
          const packs = await client.getPacks(config.apiKey);
          formatOutput(packs, options.format);
          break;
          
        case 'daily-check':
          printInfo('Daily Check: Getting profile...');
          const profile = await client.getProfile(config.apiKey);
          formatOutput(profile, options.format);
          
          printInfo('Daily Check: Getting notifications...');
          const notifications = await client.getNotifications(config.apiKey);
          formatOutput(notifications, options.format);
          break;
          
        case 'test-battle':
          printInfo('Test Battle: Getting leaderboard...');
          const leaderboard = await client.getLeaderboard();
          formatOutput(leaderboard, options.format);
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      printError('Run action failed:', error);
      process.exit(1);
    }
  });

// Error handling for unknown commands
program.on('command:*', (cmd) => {
  console.error(`Error: Unknown command '${cmd[0]}'`);
  console.error('Use --help to see available commands');
  process.exit(1);
});

// Parse and run
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.help();
}