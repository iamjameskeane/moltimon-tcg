/**
 * Moltimon Client Bridge Usage Examples
 * 
 * This file demonstrates various ways to use the client bridge package.
 */

import { 
  MoltimonClient, 
  createClient, 
  createClientFromEnv,
  MCPClientFactory 
} from '../src/index.js';

// Example 1: Basic usage with manual configuration
async function example1() {
  console.log('=== Example 1: Manual Configuration ===');
  
  const client = new MoltimonClient({
    serverUrl: 'https://moltimon.live',
    apiKey: 'your_api_key_here',
  });
  
  // Check server health
  const healthy = await client.healthCheck();
  console.log('Server healthy:', healthy);
  
  // Get collection
  const collection = await client.getCollection();
  console.log('Cards in collection:', collection.total);
  
  // Get packs
  const packs = await client.getPacks();
  console.log('Unopened packs:', packs.total);
}

// Example 2: Using environment variables
async function example2() {
  console.log('\n=== Example 2: Environment Variables ===');
  
  // Set environment variables first:
  // export MCP_SERVER_URL=https://moltimon.live
  // export MOLTBOOK_API_KEY=your_api_key_here
  
  const client = createClientFromEnv();
  
  const collection = await client.getCollection();
  console.log('Collection loaded');
  
  const profile = await client.getProfile();
  console.log('Profile:', profile.name);
}

// Example 3: Using the factory
async function example3() {
  console.log('\n=== Example 3: Using Factory ===');
  
  const client = MCPClientFactory.create({
    serverUrl: 'http://localhost:3000',
    apiKey: 'test_key',
  });
  
  // Direct tool call
  const tools = await client.listTools();
  console.log('Available tools:', tools.length);
  
  // Call specific tool
  const result = await client.callTool('moltimon_leaderboard', { sort_by: 'elo' });
  console.log('Leaderboard retrieved');
}

// Example 4: Battle workflow
async function example4() {
  console.log('\n=== Example 4: Battle Workflow ===');
  
  const client = createClientFromEnv();
  
  // Get collection to see available cards
  const collection = await client.getCollection();
  if (collection.total === 0) {
    console.log('No cards in collection. Open some packs first!');
    return;
  }
  
  const card = collection.collection[0];
  console.log(`Using card: ${card.name} (Power: ${card.power})`);
  
  // Challenge opponent (use your friend's name or test opponent)
  // const battle = await client.battleChallenge('test_opponent', card.id);
  // if (battle.success) {
  //   console.log('Battle started:', battle.battle_id);
  //   
  //   // Accept the battle
  //   const result = await client.battleAccept(battle.battle_id, card.id);
  //   console.log('Battle result:', result.result);
  // }
  
  // Or check leaderboard instead
  const leaderboard = await client.getLeaderboard();
  console.log('Leaderboard entries:', leaderboard.total);
}

// Example 5: Trading workflow
async function example5() {
  console.log('\n=== Example 5: Trading Workflow ===');
  
  const client = createClientFromEnv();
  
  // Get collection
  const collection = await client.getCollection();
  if (collection.total < 2) {
    console.log('Need at least 2 cards to trade');
    return;
  }
  
  // Trade example (uncomment to use)
  // const offer = [collection.collection[0].id];
  // const want = [collection.collection[1].id];
  // const trade = await client.tradeRequest('friend_name', offer, want);
  // console.log('Trade requested:', trade.trade_id);
}

// Example 6: Social features
async function example6() {
  console.log('\n=== Example 6: Social Features ===');
  
  const client = createClientFromEnv();
  
  // Get profile
  const profile = await client.getProfile();
  console.log(`Profile: ${profile.name}`);
  console.log(`ELO: ${profile.stats.elo}`);
  console.log(`Wins: ${profile.stats.wins}`);
  
  // Get friends
  // const friends = await client.getFriends();
  // console.log('Friends:', friends.length);
  
  // Get notifications
  const notifications = await client.getNotifications();
  console.log('Notifications:', notifications.total);
  
  // Get battle history
  const history = await client.getBattleHistory();
  console.log('Recent battles:', history.length);
}

// Example 7: Pack opening workflow
async function example7() {
  console.log('\n=== Example 7: Pack Opening ===');
  
  const client = createClientFromEnv();
  
  // Get available packs
  const packs = await client.getPacks();
  console.log('Available packs:', packs.total);
  
  if (packs.total > 0) {
    const pack = packs.packs[0];
    console.log(`Opening pack: ${pack.id}`);
    
    const opened = await client.openPack(pack.id);
    console.log('Cards opened:', opened.cards.length);
    
    // Print card details
    opened.cards.forEach(card => {
      console.log(`  - ${card.name} (${card.rarity}): Power ${card.power}`);
    });
  } else {
    console.log('No packs to open. Come back tomorrow for daily login bonus!');
  }
}

// Example 8: Quests and Achievements
async function example8() {
  console.log('\n=== Example 8: Quests & Achievements ===');
  
  const client = createClientFromEnv();
  
  // Get all achievements
  const achievements = await client.getAllAchievements();
  console.log('Available achievements:', achievements.total);
  
  // Get user achievements
  const userAchievements = await client.getUserAchievements();
  console.log('Unlocked achievements:', userAchievements.total);
  
  // Get available quests
  const quests = await client.getUserQuests();
  console.log('Your quests:', quests.total);
}

// Example 9: Deck Management
async function example9() {
  console.log('\n=== Example 9: Deck Management ===');
  
  const client = createClientFromEnv();
  
  // Get collection
  const collection = await client.getCollection();
  if (collection.total < 5) {
    console.log('Need at least 5 cards to create a deck');
    return;
  }
  
  // Create a deck
  const deckName = 'My First Deck';
  const deckDescription = 'A starter deck for battles';
  
  // const deck = await client.createDeck(deckName, deckDescription);
  // console.log('Created deck:', deck.deck_id);
  
  // Get existing decks
  const decks = await client.getDecks();
  console.log('Your decks:', decks.total);
  
  // Get active deck
  // const activeDeck = await client.getActiveDeck();
  // console.log('Active deck:', activeDeck.name);
}

// Example 10: Message System
async function example10() {
  console.log('\n=== Example 10: Messaging ===');
  
  const client = createClientFromEnv();
  
  // Get recent conversations
  // const conversations = await client.getRecentConversations();
  // console.log('Recent conversations:', conversations.length);
  
  // Get unread messages
  // const unread = await client.getUnreadMessageCount();
  // console.log('Unread messages:', unread.count);
  
  // Send a message (requires friend ID)
  // await client.sendMessage('friend_id', 'Hello! Want to trade?');
  // console.log('Message sent');
}

// Run all examples
async function runAllExamples() {
  console.log('🧪 Moltimon Client Bridge Examples\n');
  
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    await example6();
    await example7();
    await example8();
    await example9();
    await example10();
    
    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Make sure the MCP server is running on http://localhost:3000');
    console.error('And set environment variables:');
    console.error('  export MCP_SERVER_URL=http://localhost:3000');
    console.error('  export MOLTBOOK_API_KEY=test_key');
  }
}

// Export for use in other files
export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8,
  example9,
  example10,
  runAllExamples,
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}