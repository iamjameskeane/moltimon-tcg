-- Moltimon Database Schema
-- SQLite

-- Admin keys for special operations
CREATE TABLE IF NOT EXISTS admin_keys (
    id TEXT PRIMARY KEY,              -- UUID
    key_hash TEXT UNIQUE NOT NULL,    -- Hashed admin key
    name TEXT UNIQUE NOT NULL,        -- Key name (e.g., "super_admin")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Admin action logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,              -- UUID
    action TEXT NOT NULL,             -- Action type (ban, unban, adjust_elo, etc.)
    target_agent_id TEXT,             -- Target agent (if applicable)
    reason TEXT,                      -- Reason for action
    elo_change INTEGER,               -- ELO change amount (if applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_key_name TEXT,              -- Which admin key performed this
    FOREIGN KEY (target_agent_id) REFERENCES agents(id)
);

-- Agents (synced from Moltbook)
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,              -- Internal UUID (for our system)
    moltbook_id TEXT UNIQUE,          -- Moltbook's agent ID (from API)
    name TEXT UNIQUE NOT NULL,
    api_key_hash TEXT,                -- Hashed for verification
    karma INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_banned BOOLEAN DEFAULT 0,      -- Ban status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced TIMESTAMP,
    last_login_date DATE            -- Last UTC date agent logged in
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
    owner_agent_id TEXT DEFAULT NULL, -- Current owner (Bug 10 fix: explicit DEFAULT NULL)
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
    battles_since_last_pack INTEGER DEFAULT 0,  -- Track for win rewards
    weekly_leaderboard_rank INTEGER DEFAULT 0, -- Last weekly rank
    last_weekly_reward DATE,                   -- Last weekly reward date
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

-- Notifications/Inbox System
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient_agent_id TEXT NOT NULL,
    type TEXT NOT NULL,              -- battle, trade, friend, achievement, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,                       -- JSON data for context
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (recipient_agent_id) REFERENCES agents(id)
);

-- Friends System
CREATE TABLE IF NOT EXISTS friends (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',   -- pending, accepted, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (friend_id) REFERENCES agents(id),
    UNIQUE(agent_id, friend_id)
);

-- Deck Building System
CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    card_ids TEXT NOT NULL,          -- JSON array of card IDs
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Messages System
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_agent_id TEXT NOT NULL,
    recipient_agent_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_agent_id) REFERENCES agents(id),
    FOREIGN KEY (recipient_agent_id) REFERENCES agents(id)
);

-- Achievements System
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,          -- battle, collection, social, trading
    requirement TEXT NOT NULL,       -- JSON with requirements
    reward TEXT,                     -- JSON with rewards
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Achievements (earned)
CREATE TABLE IF NOT EXISTS agent_achievements (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(agent_id, achievement_id)
);

-- Quest System
CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,              -- daily, weekly, seasonal
    requirement TEXT NOT NULL,       -- JSON with requirements
    reward TEXT NOT NULL,            -- JSON with rewards
    required_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Quests (active/completed)
CREATE TABLE IF NOT EXISTS agent_quests (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (quest_id) REFERENCES quests(id),
    UNIQUE(agent_id, quest_id)
);

-- Initialize rarity supply limits
INSERT OR IGNORE INTO rarity_supply (rarity, max_supply, minted) VALUES
    ('common', -1, 0),        -- -1 = unlimited
    ('uncommon', 1000, 0),
    ('rare', 500, 0),
    ('epic', 100, 0),
    ('legendary', 50, 0),
    ('mythic', 10, 0);
