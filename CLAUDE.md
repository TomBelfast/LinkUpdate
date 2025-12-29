# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on port 9999 (host 0.0.0.0)
npm run build        # Production build (4GB memory allocation)
npm start            # Production server on port 8888

# Testing
npm test             # Run Vitest tests
npm test -- --watch  # Watch mode

# Database
npm run db:setup     # Full setup: sync + generate + push
npm run db:push      # Push schema changes to MySQL
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed initial data

# Linting
npm run lint
```

## Architecture Overview

**Stack**: Next.js 15 (App Router) + TypeScript + MySQL (Drizzle ORM) + NextAuth.js + React 19

### Key Patterns

**Database Connection** (`lib/db/index.ts`):
- Singleton connection pool with auto-reconnect
- Drizzle ORM with typed schema exports
- Use `getDb()` async function to get database instance
- Pool handles connection lifecycle automatically

**State Management**:
- Zustand stores in `lib/store/` for client state
- TanStack Query for server state and caching
- Optimistic updates pattern where possible

**Authentication** (`lib/auth/`):
- NextAuth.js with credentials + Google OAuth
- Custom SHA256 password hashing with salt (NOT bcrypt in existing code)
- Role-based access: admin/user
- Session available via `getServerSession(authOptions)`

### Database Schema (`lib/db/schema/`)

| Table | Purpose |
|-------|---------|
| `links` | URLs with metadata, thumbnails (binary), userId |
| `users` | Auth, roles (admin/user), password hash |
| `ideas` | Project ideas with status tracking |
| `projects` | Project organization |
| `tasks` | Task/todo management |

### API Routes Pattern

Routes in `app/api/` follow Next.js App Router conventions:
- `route.ts` exports GET, POST, PUT, DELETE handlers
- Dynamic routes: `[id]/route.ts`
- Auth check: `getServerSession(authOptions)`
- Response: `NextResponse.json()`

### UI Components

- Gradient buttons are critical - preserve classes: `gradient-button`, `edit-gradient`, `delete-gradient`, `copy-gradient`, `share-gradient`
- Components in `components/` are reusable
- Page-specific components in `app/components/`
- Tailwind CSS with custom config in `tailwind.config.ts`

## Environment Variables

Required in `.env.local`:
```env
DATABASE_HOST=
DATABASE_PORT=3306
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
NEXTAUTH_SECRET=      # min 32 chars
NEXTAUTH_URL=http://localhost:9999
```

Optional:
```env
GOOGLE_ID=            # Google OAuth
GOOGLE_SECRET=
OPENAI_API_KEY=       # AI features
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
PPLX_API_KEY=
```

## Testing Approach

After changes, verify with curl:
```bash
curl http://localhost:9999/api/health
curl http://localhost:9999/api/links
```

## Docker

```bash
docker-compose -f docker-compose.dev.yml up   # Development
docker-compose -f docker-compose.prod.yml up  # Production
```

Production uses standalone Next.js output.

## Project-Specific Rules

1. **Preserve gradient CSS classes** - UI depends on them
2. **Polish language** for UI messages and comments
3. **English** for variable/function names
4. **Document changes** in `claudedocs/` directory after major changes
5. **Run tests** after each change: `npm test`
