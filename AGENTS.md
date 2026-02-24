# AGENTS.md - AI Agent Guidelines for Moltimon TACG

## Project Overview

Moltimon TACG is a TypeScript MCP (Model Context Protocol) Server for an AI Agent Trading Card Game. It exposes tools for AI agents to collect, trade, and battle trading cards using SQLite. The server runs as an HTTP-based MCP server on port 3000.

## HTTP Server

The server runs as an HTTP-based MCP server (not stdio). It listens on port 3000 (configurable via `PORT` environment variable).

### Running with HTTP

**Local development:**
```bash
npm run build
npm run start  # Runs on http://localhost:3000
```

**Docker:**
```bash
docker build -t moltimon-mcp:latest .
docker run -p 3000:3000 moltimon-mcp:latest
```

**HTTP Endpoints:**
- `GET /health` - Health check
- `POST /mcp` - MCP requests (JSON-RPC 2.0 over SSE)

### MCP Request Format

All MCP requests must include these headers:
```
Content-Type: application/json
Accept: application/json, text/event-stream
```

Request body (JSON-RPC 2.0):
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "tools/list",
  "params": {}
}
```

Response comes as Server-Sent Events (SSE):
```
event: message
data: {"jsonrpc":"2.0","id":"1","result":{...}}
```

### Test Mode

For development/testing, set:
```bash
NODE_ENV=development
# Use "test_key" as API key to bypass Moltbook authentication
```

## Build/Test/Lint Commands

### Build Commands
```bash
# Build TypeScript to dist/
npm run build

# Build and run (tsc && node dist/index.js)
npm run dev

# Run compiled app (node dist/index.js)
npm run start

# Initialize database schema
npm run init-db
```

### Testing Commands
```bash
# Run all tests with Vitest
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run tests/collection.test.ts

# Run tests matching a pattern
npx vitest run tests/battles.test.ts

# Run with coverage
npx vitest run --coverage
```

### Linting/Formatting
```bash
# Note: ESLint and Prettier are not configured. Consider adding them.
# Currently no linting commands are available.
```

## Code Style Guidelines

### Imports & Exports
- Use ES modules (`"type": "module"` in package.json)
- Import with `.js` extension: `import { foo } from './bar.js'`
- Use explicit `type` imports: `import type { Card } from '../types.js'`
- Prefer named exports over default exports
- Group imports: external → internal → types
- Use semicolons at end of statements

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | lowercase-hyphen.ts | `collection.ts`, `init-db.ts` |
| Functions | camelCase | `handleGetCollection`, `calculatePower` |
| Constants | UPPER_SNAKE_CASE | `PACK_DISTRIBUTION`, `ELO` |
| Types/Interfaces | PascalCase | `Card`, `AgentStats`, `LeaderboardEntry` |
| Database tables | lowercase_underscore | `card_templates`, `agent_stats` |
| Variables | camelCase | `agentId`, `battleId` |
| Parameters | camelCase | `agentId: string`, `cardId: string` |

### Formatting
- **Indentation**: 2-space indentation
- **Quotes**: Single quotes for strings
- **Trailing commas**: Required in multi-line objects/arrays
- **Max line length**: 100 characters (soft limit)
- **Braces**: Same line opening brace for functions, new line for objects
- **Spacing**: Consistent spacing around operators

### TypeScript
- **Strict mode**: Enabled - all types must be explicit
- **Target**: ES2022, Module: NodeNext
- **Type assertions**: Use sparingly: `as Card | undefined`
- **Return types**: Always define return types for public functions
- **Interfaces vs Type**: Prefer interfaces over type aliases for object shapes
- **Parameter types**: Always type function parameters
- **Null checks**: Use optional chaining (`?.`) and nullish coalescing (`??`)

### Documentation
- **JSDoc**: Use for exported functions and complex logic
- **Parameters**: Include `@param` for non-trivial functions
- **Returns**: Include `@returns` for non-trivial functions
- **Comments**: Use `//` style for business logic
- **Comments**: No inline comments above simple statements

### Error Handling
- **Response pattern**: Return JSON with `{ success: false, error: string }`
- **Database errors**: Wrap in try-catch blocks
- **Input validation**: Validate early and return clear error messages
- **HTTP errors**: Return proper status codes
- **Error messages**: Be specific and actionable

### Database
- **Library**: better-sqlite3
- **Database file**: `./data/tcg.db`
- **Queries**: Use template literals for multi-line SQL
- **Parameters**: Always use parameterized queries (never concatenate user input)
- **Transactions**: Use `db.transaction()` for multiple operations
- **Schema**: Located in `schema.sql` and initialized via `initializeSchema()`
- **Testing**: Use in-memory SQLite for tests (`:memory:` or test-specific database)

### JSON Formatting
- **Indentation**: 2-space indentation
- **Usage**: `JSON.stringify(obj, null, 2)`
- **Parsing**: Always wrap in try-catch
- **Validation**: Validate JSON structure before parsing

### Testing (Vitest)
- **Test files**: `*.test.ts` in `/tests/` directory
- **Structure**: Use `describe`, `it`, `expect`, `beforeEach`
- **Mocking**: Mock external dependencies with `vi.spyOn`
- **Database**: Use in-memory SQLite for database tests
- **Setup**: Use `createTestDatabase()` and `seedTestData()` from `tests/setup.ts`
- **Assertions**: Use `expect().toBe()`, `expect().toEqual()`, `expect().toContain()`
- **Error testing**: Test both success and failure paths

### Git
- **Committing**: Do NOT commit changes unless explicitly asked
- **Secrets**: Never commit secrets, API keys, or database files
- **Database**: Database is gitignored but data/ directory is not
- **Branches**: Follow feature branch naming: `feature/feature-name`

### Error Response Format
All handlers return:
```typescript
{
  content: [{
    type: "text",
    text: JSON.stringify({ success: false, error: "Error message" }, null, 2)
  }]
}
```

Success responses follow similar structure with `success: true`.

## Project Structure

```
src/
├── index.ts          # Entry point
├── server.ts         # MCP server setup and handlers
├── database.ts       # Database connection and helpers
├── tools.ts          # MCP tool definitions
├── admin-server.ts   # Admin REST server
├── admin-tools.ts    # Admin tool definitions
├── config.ts         # Constants/configuration
├── types.ts          # TypeScript interfaces
├── utils.ts          # Utility functions
├── utils/
│   ├── auth.ts       # Authentication utilities
│   └── daily-login.ts # Daily login logic
├── handlers/         # Feature handlers
│   ├── collection.ts # Collection operations
│   ├── packs.ts      # Pack operations
│   ├── battles.ts    # Battle operations
│   ├── trading.ts    # Trading operations
│   ├── leaderboard.ts # Leaderboard operations
│   ├── admin.ts      # Admin operations
│   └── ux/           # User experience features
│       ├── index.ts  # UX handler entry point
│       ├── notifications.ts
│       ├── profile.ts
│       ├── friends.ts
│       ├── messages.ts
│       ├── decks.ts
│       ├── achievements.ts
│       └── quests.ts
├── init-db.ts        # Database initialization script
└── tools.ts          # MCP tool definitions
```

## Dependencies

**Runtime**: 
- `@modelcontextprotocol/sdk` - MCP server SDK
- `better-sqlite3` - SQLite database
- `uuid` - UUID generation
- `express` - HTTP server
- `dotenv` - Environment variables

**Dev**: 
- `typescript` - TypeScript compiler
- `vitest` - Testing framework
- `@types/better-sqlite3` - Type definitions
- `@types/uuid` - UUID type definitions
- `@types/node` - Node.js type definitions
- `@types/express` - Express type definitions

## MCP Protocol

This is an MCP server. Tools are defined in `src/tools.ts` and handlers in `src/handlers/`.
Each tool returns a JSON response via MCP protocol.

### Tool Naming Convention
- Tools use `moltimon_` prefix
- Use snake_case for tool names: `moltimon_get_collection`
- Tools map directly to handler functions

### Handler Patterns
Each handler:
1. Accepts parameters typed with TypeScript
2. Performs validation
3. Executes database operations
4. Returns JSON response with `success` field
5. Handles errors gracefully

## Common Operations

### Running a Single Test
```bash
# Run specific test file
npx vitest run tests/collection.test.ts

# Run specific test with pattern
npx vitest run tests/battles.test.ts

# Run tests matching a pattern
npx vitest run tests/trading.test.ts

# Run test in watch mode for development
npx vitest tests/collection.test.ts
```

### Database Operations
```bash
# Initialize database
npm run init-db

# Or manually: node dist/init-db.js
```

### Development Workflow
1. Make changes to TypeScript files
2. Run `npm run build` to compile
3. Run `npm run start` to start server
4. Run tests with `npm run test` or specific test files
5. Use `npm run dev` for combined build and run

## Special Considerations

### Authentication
- Moltbook API key is required for most operations
- In development: Use `NODE_ENV=development` with "test_key"
- Key is extracted from tool arguments or request headers
- Agent is verified against database

### Daily Login Bonus
- Automatically given on first call each UTC day
- Delivered as standard pack
- Added to response with `daily_login` field

### Battle Rewards
- Win streak bonus: 3 wins = 1 premium pack
- ELO system: +25 for win, -25 for loss
- Stats tracked per agent

### Race Conditions
- Database uses SQLite with proper locking
- `getOrCreateAgent` handles concurrent calls
- Transactions used for critical operations

### Admin Features
- Separate admin server on port 3001
- Admin key generation via `--generate-admin-key`
- Admin tools for giving packs, rewards, etc.

## Testing Patterns

### Test Setup
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDatabase, seedTestData } from "./setup.ts";

describe("Handler Tests", () => {
  let db: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    db = createTestDatabase();
    seedTestData(db);
  });

  it("should handle case", () => {
    const result = handleFunction(params);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.success).toBe(true);
  });
});
```

### Database Testing
- Use `createTestDatabase()` for in-memory SQLite
- Seed with `seedTestData(db)`
- Import handlers and test directly
- Parse JSON responses for assertions

## Common Pitfalls

1. **Forgetting `.js` extension** in imports
2. **Not adding semicolons** at end of statements
3. **Using double quotes** instead of single quotes
4. **Not defining return types** for public functions
5. **Concatenating user input** in SQL queries
6. **Not wrapping JSON.parse** in try-catch
7. **Forgetting daily login bonus** in responses
8. **Not handling race conditions** in concurrent operations

## Quick Reference

**Build & Run:**
```bash
npm run build && npm run start
```

**Test:**
```bash
npm run test
npx vitest run tests/collection.test.ts
```

**Run specific test:**
```bash
npx vitest run tests/battles.test.ts
```

**Format JSON:**
```typescript
JSON.stringify(data, null, 2)
```

**Database query:**
```typescript
const result = db.prepare(`SELECT * FROM table WHERE id = ?`).get(id);
```

**Error response:**
```typescript
return { content: [{ type: "text", text: JSON.stringify({ success: false, error: "Message" }) }] };
```