# Code Style and Conventions - LINK Project

## TypeScript Standards
- Strict TypeScript configuration with `tsconfig.json`
- Interface definitions for all data structures
- Type safety enforced throughout application
- Custom type definitions in `app/types/` directory

## File Organization
- Next.js App Router structure in `app/` directory
- Components in `components/` directory
- Database schemas in `lib/db/schema/`
- API routes in `app/api/`
- Custom hooks in `hooks/`
- Utilities in `lib/` and `utils/`

## CSS/Styling Conventions
- Tailwind CSS for utility-first styling
- Custom gradient system with specific classes:
  - `.gradient-button` - Main gradient button style
  - `.edit-gradient` - Green gradient for edit actions
  - `.delete-gradient` - Red gradient for delete actions  
  - `.copy-gradient` - Blue gradient for copy actions
  - `.share-gradient` - Orange gradient for share actions
  - `.user-logged-gradient` - Yellow gradient for user-related UI
  - `.auth-panel-gradient` - Gradient borders for auth panels
- Dark mode support with `.dark` class variants
- CSS custom properties for theme colors
- Responsive design with mobile-first approach

## Component Patterns
- Functional components with TypeScript
- Custom hooks for state management
- Props interfaces defined for all components
- Default exports for pages, named exports for utilities
- Error boundaries and loading states
- Form handling with controlled components

## Database Patterns
- Drizzle ORM for type-safe database operations
- Connection pooling implemented in `lib/db-pool.ts`
- Schema definitions with metadata helpers
- Migration scripts in `scripts/` directory
- Environment-based configuration

## Security Practices
- NextAuth.js for authentication
- CSRF protection via NextAuth
- Input validation and sanitization
- Secure password hashing (migration from SHA256 to bcrypt planned)
- Environment variables for sensitive data