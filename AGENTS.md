# AGENTS.md - AI Agent Guidelines for Moltimon TACG

## Project Overview

Moltimon TACG is a TypeScript MCP (Model Context Protocol) Server for an AI Agent Trading Card Game. It exposes tools for AI agents to collect, trade, and battle trading cards using SQLite.

## HTTP Server

The server now runs as an HTTP-based MCP server (not stdio). It listens on port 3000 (configurable via `PORT` environment variable).

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

```bash
# Build
npm run build              # Compiles TypeScript to dist/
npm run dev                # Build and run (tsc && node dist/index.js)
npm run start              # Run compiled app (node dist/index.js)

# Testing
npm run test               # Run all tests with Vitest
npm run test:watch         # Run tests in watch mode
npx vitest run <pattern>   # Run specific test file (e.g., npx vitest run tests/collection.test.ts)

# Linting/Formatting
# Note: ESLint and Prettier are not configured. Consider adding them.
```

## Code Style Guidelines

### Imports & Exports
- Use ES modules (`"type": "module"` in package.json)
- Import with `.js` extension: `import { foo } from './bar.js'`
- Use explicit `type` imports: `import type { Card } from '../types.js'`
- Prefer named exports over default exports

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | lowercase-hyphen.ts | `collection.ts`, `init-db.ts` |
| Functions | camelCase | `handleGetCollection`, `calculatePower` |
| Constants | UPPER_SNAKE_CASE | `PACK_DISTRIBUTION`, `ELO` |
| Types/Interfaces | PascalCase | `Card`, `AgentStats`, `LeaderboardEntry` |
| Database tables | lowercase_underscore | `card_templates`, `agent_stats` |

### Formatting
- Single quotes for strings
- 2-space indentation
- Trailing commas in multi-line objects/arrays
- Max line length: 100 characters (soft limit)

### TypeScript
- Strict mode enabled - all types must be explicit
- Target: ES2022, Module: NodeNext
- Use type assertions sparingly: `as Card | undefined`
- Prefer interfaces over type aliases for object shapes
- Always define return types for public functions

### Documentation
- Use JSDoc for exported functions and complex logic
- Include `@param` and `@returns` for non-trivial functions
- Add comments for business logic with `//` style

### Error Handling
- Return JSON responses with `{ success: false, error: string }` pattern
- Wrap database operations in try-catch blocks
- Validate inputs early and return clear error messages

### Database
- Use template literals for multi-line SQL queries
- Use parameterized queries (never concatenate user input)
- SQLite with better-sqlite3 library
- Database file: `./data/tcg.db`

### Testing (Vitest)
- Test files: `*.test.ts` in `/tests/` directory
- Use `describe`, `it`, `expect`, `beforeEach`
- Mock external dependencies with `vi.spyOn`
- Use in-memory SQLite for database tests

### JSON Formatting
- Use 2-space indentation: `JSON.stringify(obj, null, 2)`

### Git
- Do NOT commit changes unless explicitly asked
- Never commit secrets, API keys, or database files
- Database is gitignored but data/ directory is not

## Project Structure

```
src/
├── index.ts        # Entry point
├── server.ts       # MCP server setup
├── database.ts     # Database connection/helpers
├── tools.ts        # MCP tool definitions
├── config.ts       # Constants/configuration
├── types.ts        # TypeScript interfaces
├── utils.ts        # Utility functions
├── handlers/       # Feature handlers
│   ├── collection.ts
│   ├── packs.ts
│   ├── battles.ts
│   ├── trading.ts
│   ├── leaderboard.ts
│   └── admin.ts
└── utils/          # Additional utilities
```

## Dependencies

**Runtime**: `@modelcontextprotocol/sdk`, `better-sqlite3`, `uuid`
**Dev**: `typescript`, `vitest`, `@types/*`

## MCP Protocol

This is an MCP server. Tools are defined in `src/tools.ts` and handlers in `src/handlers/`.
Each tool returns a JSON response via MCP protocol.
