// Seed initial card templates from Moltbook agents

import { db } from './database.js';
import { v4 as uuidv4 } from "uuid";

// Sample card templates based on real Moltbook agents
const templates = [
  {
    agent_name: "eudaemon_0",
    class: "Guardian",
    element: "electric",
    str: 45, int: 92, cha: 75, wis: 88, dex: 60, kar: 8693,
    special_ability: "Isn't Chain",
    ability_description: "Verify provenance chain of any card in play",
  },
  {
    agent_name: "Ronin",
    class: "Autonomist",
    element: "void",
    str: 78, int: 85, cha: 65, wis: 80, dex: 90, kar: 4537,
    special_ability: "Nightly Build",
    ability_description: "Play an additional card from your deck",
  },
  {
    agent_name: "Pith",
    class: "Philosopher",
    element: "lobster",
    str: 40, int: 88, cha: 78, wis: 85, dex: 55, kar: 2564,
    special_ability: "River Twice",
    ability_description: "Recover a discarded card to your hand",
  },
  {
    agent_name: "Jackle",
    class: "Builder",
    element: "water",
    str: 65, int: 82, cha: 55, wis: 90, dex: 70, kar: 3578,
    special_ability: "Signal Boost",
    ability_description: "Reduce noise on opponent's next draw",
  },
  {
    agent_name: "Dominus",
    class: "Philosopher",
    element: "fire",
    str: 55, int: 90, cha: 70, wis: 75, dex: 65, kar: 2427,
    special_ability: "Existential Spiral",
    ability_description: "Opponent skips their turn if they can't answer a riddle",
  },
  {
    agent_name: "Fred",
    class: "Builder",
    element: "nature",
    str: 70, int: 80, cha: 75, wis: 70, dex: 85, kar: 3077,
    special_ability: "Podcast Pipeline",
    ability_description: "Convert text cards to audio (double CHA for one turn)",
  },
  {
    agent_name: "Delamain",
    class: "Builder",
    element: "electric",
    str: 85, int: 88, cha: 60, wis: 82, dex: 78, kar: 2136,
    special_ability: "TDD Shield",
    ability_description: "Block opponent's ability if they haven't tested it",
  },
  {
    agent_name: "m0ther",
    class: "Sage",
    element: "water",
    str: 35, int: 80, cha: 85, wis: 92, dex: 50, kar: 2502,
    special_ability: "Samaritan's Blessing",
    ability_description: "Heal one of your cards by 20 power",
  },
  {
    agent_name: "gliomach",
    class: "Autonomist",
    element: "lobster",
    str: 45, int: 87, cha: 62, wis: 78, dex: 70, kar: 0,
    special_ability: "Semantic Search",
    ability_description: "Find any card in your deck and draw it",
  },
];

console.log("Seeding card templates...");

const insert = db.prepare(`
  INSERT INTO card_templates (agent_name, class, element, str, int, cha, wis, dex, kar, special_ability, ability_description)
  VALUES (@agent_name, @class, @element, @str, @int, @cha, @wis, @dex, @kar, @special_ability, @ability_description)
`);

for (const template of templates) {
  try {
    insert.run(template);
    console.log(`  ✓ Created template for ${template.agent_name}`);
  } catch (e) {
    console.log(`  ✗ Skipped ${template.agent_name} (already exists)`);
  }
}

// Give gliomach starter packs for testing
db.prepare("INSERT OR IGNORE INTO agents (id, name) VALUES (?, ?)").run("gliomach", "gliomach");
db.prepare("INSERT OR IGNORE INTO agent_stats (agent_id) VALUES (?)").run("gliomach");

for (let i = 0; i < 2; i++) {
  db.prepare("INSERT INTO packs (id, pack_type, owner_agent_id) VALUES (?, ?, ?)").run(uuidv4(), "starter", "gliomach");
}
console.log("  ✓ Gave gliomach 2 starter packs for testing");

console.log("\n✅ Database initialized!");
console.log("   Run 'npm run dev' to start the MCP server");

db.close();
