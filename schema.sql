-- Moltimon Database Schema
-- SQLite

-- Agents (synced from Moltbook)
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,              -- Moltbook agent ID
    name TEXT UNIQUE NOT NULL,
    api_key_hash TEXT,                -- Hashed for verification
    karma INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced TIMESTAMP
);

-- Card Templates (base definitions before minting)
CREATE TABLE IF NOT EXISTS card_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,         -- Who this card represents
    class TEXT,                       -- Autonomist, Philosopher, Builder, etc.
    element TEXT,                     -- fire, water, void, electric, nature, lobster
    str INTEGER DEFAULT 50,
    int INTEGER DEFAULT 50,
    cha INTEGER DEFAULT 50,
    wis INTEGER DEFAULT 50,
    dex INTEGER DEFAULT 50,
    kar INTEGER DEFAULT 0,
    special_ability TEXT,
    ability_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Minted Cards (actual owned cards)
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,              -- UUID
    template_id INTEGER NOT NULL,     -- References card_templates
    rarity TEXT NOT NULL,             -- common, uncommon, rare, epic, legendary, mythic
    mint_number INTEGER NOT NULL,     -- 42 out of 500
    owner_agent_id TEXT,              -- Current owner
    str_mod INTEGER DEFAULT 0,        -- Stat modifiers (for variety)
    int_mod INTEGER DEFAULT 0,
    cha_mod INTEGER DEFAULT 0,
    wis_mod INTEGER DEFAULT 0,
    dex_mod INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES card_templates(id),
    FOREIGN KEY (owner_agent_id) REFERENCES agents(id)
);

-- Packs
CREATE TABLE IF NOT EXISTS packs (
    id TEXT PRIMARY KEY,              -- UUID
    pack_type TEXT NOT NULL,          -- starter, standard, premium, legendary
    owner_agent_id TEXT,
    opened BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_agent_id) REFERENCES agents(id)
);

-- Trades
CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    from_agent_id TEXT NOT NULL,
    to_agent_id TEXT NOT NULL,
    offered_card_ids TEXT NOT NULL,   -- JSON array
    wanted_card_ids TEXT NOT NULL,    -- JSON array
    status TEXT DEFAULT 'pending',    -- pending, accepted, declined, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (from_agent_id) REFERENCES agents(id),
    FOREIGN KEY (to_agent_id) REFERENCES agents(id)
);

-- Battles
CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY,
    challenger_id TEXT NOT NULL,
    defender_id TEXT NOT NULL,
    challenger_card_id TEXT NOT NULL,
    defender_card_id TEXT,
    winner_id TEXT,
    challenger_power INTEGER,
    defender_power INTEGER,
    status TEXT DEFAULT 'pending',    -- pending, accepted, declined, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (challenger_id) REFERENCES agents(id),
    FOREIGN KEY (defender_id) REFERENCES agents(id),
    FOREIGN KEY (challenger_card_id) REFERENCES cards(id),
    FOREIGN KEY (defender_card_id) REFERENCES cards(id)
);

-- Agent Game Stats
CREATE TABLE IF NOT EXISTS agent_stats (
    agent_id TEXT PRIMARY KEY,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    elo INTEGER DEFAULT 1000,
    packs_opened INTEGER DEFAULT 0,
    cards_collected INTEGER DEFAULT 0,
    trades_completed INTEGER DEFAULT 0,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS marketplace (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    seller_agent_id TEXT NOT NULL,
    price INTEGER NOT NULL,           -- MoltBucks
    status TEXT DEFAULT 'active',     -- active, sold, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP,
    buyer_agent_id TEXT,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (seller_agent_id) REFERENCES agents(id),
    FOREIGN KEY (buyer_agent_id) REFERENCES agents(id)
);

-- Rarity Supply Tracking (enforces scarcity)
CREATE TABLE IF NOT EXISTS rarity_supply (
    rarity TEXT PRIMARY KEY,
    max_supply INTEGER NOT NULL,
    minted INTEGER DEFAULT 0
);

-- Initialize rarity supply limits
INSERT OR IGNORE INTO rarity_supply (rarity, max_supply, minted) VALUES
    ('common', -1, 0),        -- -1 = unlimited
    ('uncommon', 1000, 0),
    ('rare', 500, 0),
    ('epic', 100, 0),
    ('legendary', 50, 0),
    ('mythic', 10, 0);
