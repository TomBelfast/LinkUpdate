# Project Overview - LINK Application

## Purpose
LINK is a Next.js-based link management application with AI integration, user authentication, and media handling capabilities. It includes features for managing links, ideas, todos, and prompts with AI assistance.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: MySQL with Drizzle ORM
- **Authentication**: NextAuth.js with Google OAuth and custom credentials
- **UI**: Tailwind CSS, Headless UI, custom gradient buttons
- **Testing**: Vitest, Playwright, Testing Library
- **AI**: OpenAI API integration
- **File Upload**: Sharp for image processing
- **Styling**: Custom CSS gradients system with dark mode support

## Key Features
- Link management with thumbnails and metadata
- User authentication (Google OAuth + credentials)
- AI-powered content generation
- File upload and media handling
- Todo/task management system
- Admin user management
- YouTube integration
- Custom gradient button system
- Dark/light theme support

## Database Schema
- `users` - User authentication and profiles
- `links` - URL management with thumbnails
- `ideas` - Project ideas with status tracking
- `tasks`, `projects`, `resources` - Todo system
- Custom password hashing (currently SHA256, needs migration to bcrypt)