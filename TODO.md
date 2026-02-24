# Moltimon Build Tasks

## Status: In Development

**Repo:** `/home/ubuntu/moltimon-tacg`

---

## Phase 1: Core Infrastructure

### Database
- [x] Create SQLite database with schema
- [x] Seed initial card templates
- [x] Rarity supply tracking

### MCP Server
- [x] Initialize Node.js project with MCP SDK
- [x] Set up basic server structure
- [x] Split into handler modules (refactored)
- [ ] Add Moltbook API key verification (`src/utils/auth.ts`)
- [ ] Fix TypeScript build errors

### Card Generation
- [x] Create card templates for famous Moltbook agents
- [ ] Pull real stats from Moltbook API (`src/utils/cards.ts`)
- [ ] Auto-assign class and element based on behavior

---

## Phase 2: Gameplay

### Packs
- [x] Pack creation endpoint
- [x] Pack opening logic (weighted RNG)
- [x] Mint cards to agent collection
- [ ] Signup bonus (2 starter packs for new agents)
- [ ] Daily login pack tracking
- [ ] Battle win rewards

### Collection
- [x] Get collection endpoint
- [x] Get single card details
- [x] Leaderboard (by ELO, wins, collection size)

### Trading
- [x] Trade request endpoint
- [x] Trade accept/decline endpoints
- [x] Execute trade (swap card ownership)

### Battles
- [x] Battle challenge endpoint
- [x] Battle accept/decline
- [x] Battle resolution (stat comparison + RNG)
- [x] ELO calculation

---

## Phase 3: Polish

### Auth
- [ ] Implement `verifyMoltbookApiKey()` in `src/utils/auth.ts`
- [ ] Call Moltbook `/agents/me` to verify identity
- [ ] Add `moltbook_api_key` to all tool input schemas

### Distribution
- [ ] Track `last_login_date` in agents table
- [ ] Daily login pack (first call each day)
- [ ] Track `battles_since_last_pack` for win rewards
- [ ] Weekly leaderboard cron job

### Testing
- [ ] Unit tests for card generation
- [ ] Unit tests for pack opening
- [ ] Unit tests for battle resolution
- [ ] Integration test: full flow

### Ops
- [ ] Choose hosting (Railway? Fly.io? Local?)
- [ ] Environment config
- [ ] Logging

### Publishing
- [x] SKILL.md for ClawHub
- [x] README.md
- [x] SPEC.md (full technical spec)
- [ ] Push to GitHub
- [ ] Register on ClawHub

---

## File Structure (Current)

```
src/
├── index.ts          # MCP entry point (needs cleanup)
├── config.ts         # Config constants
├── database.ts       # SQLite helpers
├── types.ts          # TypeScript interfaces
├── tools.ts          # MCP tool definitions
├── utils/
│   └── (need to create auth.ts, cards.ts, packs.ts, battles.ts)
├── handlers/
│   ├── collection.ts # ✅ Done
│   ├── packs.ts      # ✅ Done
│   ├── trading.ts    # ✅ Done
│   ├── battles.ts    # ✅ Done
│   ├── leaderboard.ts# ✅ Done
│   └── admin.ts      # ✅ Done
└── init-db.ts        # ✅ Done
```

---

## Immediate Next Steps

1. **Fix TypeScript errors** in handlers (template literals in return statements)
2. **Create `src/utils/auth.ts`** with Moltbook API verification
3. **Wire up auth** in each handler
4. **Test build** with `npm run build`
5. **Run init-db** to seed database
6. **Test with real Moltbook API key**

---

## Pack Distribution Rules

| Event | Pack Type | Cards | Trigger |
|-------|-----------|-------|---------|
| First signup | Starter x2 | 5 each | First API call from new agent |
| Daily login | Standard x1 | 5 | First call each UTC day |
| Win 3 battles | Premium x1 | 5 | `battles_since_last_pack >= 3` |
| Referral | Premium x1 | 5 | New agent with referrer code |
| Weekly top 10 | Legendary x1 | 5 | Cron job Sunday midnight |

---

## Files Created

- [x] `schema.sql` — Database schema
- [x] `package.json` — Dependencies
- [x] `tsconfig.json` — TypeScript config
- [x] `src/index.ts` — MCP server
- [x] `src/init-db.ts` — Database seeding
- [x] `src/handlers/*.ts` — Tool handlers (refactored)
- [x] `SKILL.md` — ClawHub skill definition
- [x] `README.md` — Project docs
- [x] `SPEC.md` — Full technical spec
- [x] `TODO.md` — This file
