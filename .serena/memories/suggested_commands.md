# Suggested Commands for LINK Project

## Development Commands
- `npm run dev` - Start development server on port 9999, host 0.0.0.0
- `npm run build` - Build for production with 4GB memory allocation
- `npm start` - Start production server on port 9999, host 0.0.0.0
- `npm run lint` - Run ESLint
- `npm test` - Run Vitest tests

## Database Operations
- `npm run db:generate` - Generate Drizzle schema migrations
- `npm run db:push` - Push schema changes to MySQL database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with initial data
- `npm run db:sync` - Sync schema definitions
- `npm run db:setup` - Complete database setup (sync + generate + push)

## Testing Commands
- `npm test` - Run unit tests with Vitest
- `npx playwright test` - Run E2E tests
- `npx playwright install` - Install Playwright browsers
- `npx vitest --ui` - Run tests with UI

## Specialized Tools
- `./start-serena.sh` - Start Serena MCP server for semantic analysis
- `./start-claude-monitor.sh` - Start Claude Code Usage Monitor
- `claude-monitor --plan pro` - Monitor with Pro plan limits

## System Commands (Linux/WSL)
- `ls`, `find`, `grep`, `cat`, `chmod`, `mv`, `cp` - Standard Linux commands
- `curl` - API testing
- `mysql` - Database CLI access
- `node` - Node.js runtime
- `git` - Version control