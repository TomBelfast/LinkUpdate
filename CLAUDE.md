# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
- `npm run dev` - Start development server on port 9999, host 0.0.0.0
- `npm run build` - Build for production with 4GB memory allocation
- `npm start` - Start production server on port 9999, host 0.0.0.0
- `npm run lint` - Run ESLint
- `npm test` - Run Vitest tests

**Database Operations:**
- `npm run db:generate` - Generate Drizzle schema migrations
- `npm run db:push` - Push schema changes to MySQL database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with initial data
- `npm run db:sync` - Sync schema definitions
- `npm run db:setup` - Complete database setup (sync + generate + push)

**Testing:**
Every change must be tested. After each application run, test with curl to verify functionality. If not working, search internet for solutions, implement fixes, and rerun until working.

**Serena Integration:**
- `./start-serena.sh` - Start Serena MCP server for semantic code analysis
- Serena dashboard: http://127.0.0.1:24282/dashboard/index.html
- Serena logs: /root/.serena/logs/
- Project config: `.serena/project.yml`

**Claude Usage Monitoring:**
- `./start-claude-monitor.sh` - Start Claude Code Usage Monitor
- `claude-monitor --plan pro` - Monitor with Pro plan limits
- `claude-monitor --view daily` - Daily usage view
- `ccm` - Short alias for claude-monitor

**SuperClaude Framework:**
- 16 specialized slash commands (e.g., `/sc:implement`, `/sc:analyze`, `/sc:build`)
- 11 AI personas (architect, frontend, backend, security, qa, etc.)
- MCP server integration (Context7, Sequential, Magic, Playwright)
- Framework files in `/root/.claude/`
- Auto-activation based on context and task type

## Architecture Overview

**Tech Stack:**
- Next.js 15 (App Router) with TypeScript
- Database: MySQL with Drizzle ORM
- Authentication: NextAuth.js with Google OAuth and credentials
- UI: React 19, Tailwind CSS, Headless UI
- Testing: Vitest
- Deployment: Docker with standalone output

**Key Directories:**
- `app/` - Next.js App Router pages and API routes
- `lib/db/schema/` - Drizzle database schema definitions
- `components/` - Reusable React components
- `scripts/` - Database and deployment scripts
- `__tests__/` - Test files with setup in `__tests__/setup.ts`

**Database Schema:**
- `links` table - URL management with thumbnails and metadata
- `ideas` table - Project ideas with status tracking
- `users` table - User authentication and roles
- Uses MySQL with custom crypto-based password hashing

**Authentication:**
- NextAuth.js with custom credentials provider using crypto.createHash('sha256')
- Google OAuth integration with automatic user creation
- Role-based access (admin/user)
- Custom password comparison with salt+hash format

**Development Environment:**
- MySQL database connection via environment variables
- Drizzle ORM for type-safe database operations
- Custom webpack configuration for Node.js polyfills
- Optimized build with code splitting and compression

**Key Features:**
- Link management with image/thumbnail storage
- AI integration via OpenAI API
- File upload handling
- YouTube integration
- Todo/task management
- Admin user management

**Performance Optimizations:**
- Image optimization with Sharp
- Bundle splitting and compression
- Custom webpack configuration
- Memory allocation for large builds (4GB)