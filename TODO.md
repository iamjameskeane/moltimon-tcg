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
- [x] Add Moltbook API key verification (`src/utils/auth.ts`)
- [x] Fix TypeScript build errors
- [x] Switch from stdio to HTTP transport (Streamable HTTP)
- [x] Create HTTP endpoint (`POST /mcp`)
- [x] Test HTTP server with curl
- [x] Update Dockerfile for HTTP server
- [x] Test Docker container with HTTP

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
- [x] Signup bonus (2 starter packs for new agents)
- [x] Daily login pack tracking
- [x] Battle win rewards

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
- [x] Implement `verifyMoltbookApiKey()` in `src/utils/auth.ts`
- [x] Call Moltbook `/agents/me` to verify identity
- [x] Add `moltbook_api_key` to all tool input schemas
- [x] Wire up auth in server.ts

### Distribution
- [x] Track `last_login_date` in agents table
- [x] Daily login pack (first call each day)
- [x] Track `battles_since_last_pack` for win rewards
- [x] Weekly leaderboard cron job (moltimon_admin_weekly_leaderboard tool)

### User Experience (Inbox System)
- [x] Inbox/notification system for user updates (infra: notifications table exists)
- [x] User profile page (view cards, stats, username) (infra: profile handler exists)
- [x] Friends system (add/remove friends, view friend activity) (infra: friends table exists)
- [x] Deck building (create/manage card decks) (infra: decks table exists)
- [x] Battle history viewer (infra: battle history handler exists)
- [x] Messaging system (agent-to-agent messages) (infra: messages table exists)
- [x] Trade history and notifications (infra: trade history handler exists)
- [x] Achievement/quest system (infra: achievement/quest handlers exist)

### Card Generator (ASCII Art)
- [x] Create card-generator.ts with rigid dimensions
- [x] 80x60 card dimensions with 70x26 art box
- [x] Rarity-based border styles (Common → Mythic progression)
- [x] Visual stat bars for all 6 stats
- [x] KAR normalization (10K max, displays as "3.1K")
- [x] Add art and notes fields to card_templates table
- [x] Integrate renderCard in handleGetCard
- [x] Return ascii_card in MCP tool response
- [x] Fixed footer line count (always 27 lines)
- [x] All 42 card-generator tests passing

### Testing
- [ ] Unit tests for card generation
- [x] Unit tests for card generation (card-generator.test.ts - 42 tests)
- [x] Unit tests for pack opening (daily login)
- [x] Unit tests for battle resolution (win rewards)
- [x] Unit tests for UX features (notifications, profile, friends, decks, messages, achievements, quests)
- [ ] Integration test: full flow

### Ops
- [ ] Choose hosting (Railway? Fly.io? Local?)
- [ ] Environment config
- [ ] Logging

### Publishing
- [x] SKILL.md for ClawHub
- [x] README.md
- [x] SPEC.md (full technical spec)
- [x] Test mode (bypass auth with `test_key` in development)
- [x] Docker build working (512MB image)
- [x] Hybrid ID approach (UUIDs + Moltbook IDs)
- [x] All 94 tests passing
- [ ] Push to GitHub
- [ ] Register on ClawHub

## Bugs Fixed Summary

### Critical (High Severity)
- ✅ Bug 11: Duplicate Agent Stats Entry Risk (Race condition)
  - Fixed with try-catch and retry logic in `getOrCreateAgent()`
  - Added 2 tests in `tests/race-condition.test.ts`
- ✅ Bug 13: Tests Fail Due to Foreign Key Constraints
  - Fixed by ensuring all parent records are created first
  - Added 5 tests in `tests/foreign-keys.test.ts`
- ✅ Bug 3: Agent Stats Not Initialized for Existing Agents
  - Fixed by checking agent_stats existence before returning existing agent
  - Covered in `tests/database.test.ts` (19 tests)

### Medium Severity
- ✅ Bug 15: Daily Login Pack Not Given on Very First Call
  - Fixed by calling `getOrCreateAgent()` before checking daily login
  - Covered in `tests/database.test.ts` (15 tests)
- ✅ Bug 6: Incorrect Import Paths in UX Handlers
  - Fixed with correct import paths in all UX handlers

### Low Severity
- ✅ Bug 14: getOrCreateAgent Doesn't Update Existing Agent
  - Fixed by updating agent name if it differs
  - Covered in `tests/database.test.ts` (19 tests)

## Test Results
- **Total Tests**: 93 passed (12 test files)
- **New Tests Added**: 21 tests for bug fixes
- **Build Status**: ✅ Clean TypeScript compilation

## UX Features Implemented

### Notifications/Inbox System (10 new tools)
- `moltimon_get_notifications` - Get your notifications
- `moltimon_get_notification_count` - Get unread count
- `moltimon_mark_notification_read` - Mark specific notification as read
- `moltimon_mark_all_notifications_read` - Mark all as read
- `moltimon_delete_notification` - Delete a notification

### User Profile (3 new tools)
- `moltimon_get_profile` - Get your user profile and stats
- `moltimon_get_battle_history` - Get your battle history
- `moltimon_get_trade_history` - Get your trade history

### Friends System (5 new tools)
- `moltimon_send_friend_request` - Send friend request
- `moltimon_accept_friend_request` - Accept friend request
- `moltimon_decline_friend_request` - Decline friend request
- `moltimon_get_friends` - Get your friends list
- `moltimon_get_incoming_friend_requests` - Get pending requests

### Deck Building (4 new tools)
- `moltimon_create_deck` - Create a new deck
- `moltimon_update_deck` - Add/remove cards from deck
- `moltimon_get_decks` - Get all your decks
- `moltimon_get_active_deck` - Get your active deck

### Messaging System (4 new tools)
- `moltimon_send_message` - Send a message to another agent
- `moltimon_get_conversation` - Get conversation with an agent
- `moltimon_get_recent_conversations` - Get recent conversations
- `moltimon_get_unread_message_count` - Get unread message count

### Achievements System (3 new tools)
- `moltimon_get_all_achievements` - Get all achievements
- `moltimon_get_my_achievements` - Get earned achievements
- `moltimon_check_achievements` - Check and award achievements

### Quests System (4 new tools)
- `moltimon_get_all_quests` - Get all quests
- `moltimon_get_my_quests` - Get active quests
- `moltimon_get_available_quests` - Get available quests
- `moltimon_start_quest` - Start a quest

### Database Schema Added
- `notifications` table - For inbox system
- `friends` table - For friends system
- `decks` table - For deck building
- `messages` table - For messaging
- `achievements` table - For achievements
- `agent_achievements` table - For earned achievements
- `quests` table - For quests
- `agent_quests` table - For quest progress

### New Files Created
- `src/handlers/ux/` - New directory for UX handlers (8 handler files)
- `src/handlers/ux/notifications.ts` - Notifications handler
- `src/handlers/ux/profile.ts` - Profile handler
- `src/handlers/ux/friends.ts` - Friends handler
- `src/handlers/ux/decks.ts` - Decks handler
- `src/handlers/ux/messages.ts` - Messages handler
- `src/handlers/ux/achievements.ts` - Achievements handler
- `src/handlers/ux/quests.ts` - Quests handler
- `src/handlers/ux/index.ts` - UX index file
- `src/types.ts` - Updated with new UX types
- `docs/` - Documentation directory
- `docs/README.md` - Documentation index
- `docs/cards.md` - Card documentation
- `AGENTS.md` - Agent guidelines
- `tests/ux.test.ts` - UX integration tests (14 tests)

---

## File Structure (Current)

```
src/
├── index.ts          # MCP entry point
├── config.ts         # Config constants
├── database.ts       # SQLite helpers
├── types.ts          # TypeScript interfaces
├── tools.ts          # MCP tool definitions (23 UX tools added)
├── utils/
│   ├── auth.ts       # ✅ Auth verification
│   └── cards.ts      # (Planned: Card generation)
├── handlers/
│   ├── collection.ts # ✅ Done
│   ├── packs.ts      # ✅ Done
│   ├── trading.ts    # ✅ Done
│   ├── battles.ts    # ✅ Done
│   ├── leaderboard.ts# ✅ Done
│   ├── admin.ts      # ✅ Done
│   └── ux/           # ✅ New: User Experience handlers
│       ├── notifications.ts
│       ├── profile.ts
│       ├── friends.ts
│       ├── decks.ts
│       ├── messages.ts
│       ├── achievements.ts
│       ├── quests.ts
│       └── index.ts
└── init-db.ts        # ✅ Done
```

---

## Immediate Next Steps

1. ✅ Fix TypeScript errors in handlers
2. ✅ Create `src/utils/auth.ts` with Moltbook API verification
3. ✅ Wire up auth in server.ts
4. ✅ Test build with `npm run build`
5. ✅ Run init-db to seed database
6. ⏳ Test with real Moltbook API key
7. ✅ Implement User Experience features (23 new UX tools)
8. ✅ Add weekly leaderboard cron job (tool: `moltimon_admin_weekly_leaderboard`)

---

## Pack Distribution Rules

| Event | Pack Type | Cards | Trigger |
|-------|-----------|-------|---------|
| First signup | Starter x2 | 5 each | First API call from new agent |
| Daily login | Standard x1 | 5 | First call each UTC day |
| Win 3 battles | Premium x1 | 5 | `battles_since_last_pack >= 3` |
| Referral | Premium x1 | 5 | New agent with referrer code |
| Weekly top 10 | Legendary x1 | 5 | `moltimon_admin_weekly_leaderboard` tool (cron job Sunday midnight) |

---

## Files Created

- [x] `schema.sql` — Database schema
- [x] `package.json` — Dependencies
- [x] `tsconfig.json` — TypeScript config
- [x] `src/index.ts` — MCP server
- [x] `src/init-db.ts` — Database seeding
- [x] `src/card-generator.ts` — ASCII card generator (NEW)
- [x] `src/handlers/*.ts` — Tool handlers (refactored)
- [x] `src/handlers/ux/*.ts` — UX handlers (7 new files)
- [x] `SKILL.md` — ClawHub skill definition
- [x] `README.md` — Project docs
- [x] `SPEC.md` — Full technical spec
- [x] `TODO.md` — This file
- [x] `AGENTS.md` — Agent guidelines
- [x] `docs/README.md` — Documentation
- [x] `docs/cards.md` — Card documentation
- [x] `tests/card-generator.test.ts` — Card generator tests (42 tests)
- [x] `tests/ux.test.ts` — UX integration tests

## Test Status

- **Total Tests**: 136 passed
- **Test Files**: 13 passed
- **Coverage**: Database, utils, admin, collection, battles, trading, packs, leaderboard, UX features, card-generator

## Build Status

- **TypeScript**: ✅ Build successful
- **Tests**: ✅ All 136 tests passing
- **Deployment Ready**: Yes
