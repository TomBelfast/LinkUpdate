# Project Index - LINK Application

## Project Overview

**LINK** is a comprehensive link management and project organization platform built with Next.js 15, featuring AI integration, user management, and task tracking capabilities.

### Quick Stats
- **Tech Stack**: Next.js 15, TypeScript, MySQL, Drizzle ORM
- **Authentication**: NextAuth.js (Google OAuth + credentials)
- **UI Framework**: React 19, Tailwind CSS, Headless UI
- **Database**: MySQL with Drizzle migrations
- **Testing**: Vitest
- **Deployment**: Docker with standalone output

---

## 📁 Directory Structure

### Core Application (`app/`)
```
app/
├── api/                    # API routes and endpoints
│   ├── auth/              # Authentication endpoints
│   ├── admin/             # Admin management
│   ├── ai/                # AI integration
│   ├── links/             # Link management
│   ├── ideas/             # Ideas management
│   ├── prompts/           # Prompt management
│   └── upload/            # File upload handling
├── auth/                  # Authentication pages
├── admin/                 # Admin dashboard
├── links/                 # Link management interface
├── todo/                  # Task management
├── prompts/               # Prompt management
├── youtube/               # YouTube integration
├── components/            # Page-specific components
└── providers/             # React providers
```

### Database Layer (`lib/db/`)
```
lib/db/
├── schema/
│   ├── index.ts          # Links table schema
│   ├── users.ts          # User management
│   ├── ideas.ts          # Ideas tracking
│   ├── projects.ts       # Project organization
│   ├── tasks.ts          # Task management
│   └── todo.ts           # Todo functionality
└── index.ts              # Database connection
```

### Components (`components/`)
```
components/
├── ui/                   # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── badge.tsx
├── LinkForm.tsx          # Link creation/editing
├── LinkList.tsx          # Link display
├── IdeaForm.tsx          # Ideas management
├── TodoList.tsx          # Task tracking
├── ImageDropzone.tsx     # File uploads
├── Navigation.tsx        # Site navigation
└── Toast.tsx             # Notifications
```

### Configuration & Scripts
```
scripts/                  # Database and deployment
├── seed.ts              # Database seeding
├── sync-schema.ts       # Schema synchronization
├── migrate.ts           # Database migrations
└── deploy-qnap.sh       # Deployment automation
```

---

## 🔧 Core Features

### 1. Link Management
- **Location**: `app/links/`, `app/api/links/`
- **Features**: URL storage, metadata extraction, thumbnail generation
- **Database**: `links` table with image/thumbnail support
- **Components**: `LinkForm`, `LinkList`

### 2. User Authentication
- **Location**: `app/auth/`, `app/api/auth/`
- **Methods**: Google OAuth, credentials-based
- **Features**: Registration, login, password reset, role-based access
- **Database**: `users` table with hashed passwords

### 3. AI Integration
- **Location**: `app/api/ai/`
- **Provider**: OpenAI API
- **Features**: Content generation, prompt improvement
- **Dependencies**: `openai` package

### 4. Task & Project Management
- **Location**: `app/todo/`, `lib/db/schema/todo.ts`
- **Features**: Todo lists, project tracking, idea management
- **Database**: `todos`, `projects`, `tasks`, `ideas` tables

### 5. File Management
- **Location**: `app/api/upload/`
- **Features**: Image uploads, thumbnail generation
- **Storage**: Binary data in MySQL
- **Processing**: Sharp for image optimization

---

## 🚀 Development Workflow

### Environment Setup
```bash
# Database setup
npm run db:setup          # Full database initialization
npm run db:sync           # Sync schema definitions
npm run db:generate       # Generate migrations
npm run db:push           # Apply to database

# Development
npm run dev               # Start dev server (port 9999)
npm run build             # Production build (4GB memory)
npm run start             # Production server
npm run lint              # ESLint validation
npm test                  # Run Vitest tests
```

### Database Operations
- **Connection**: MySQL via environment variables
- **ORM**: Drizzle with type-safe operations
- **Migrations**: Automatic generation and application
- **Studio**: `npm run db:studio` for GUI management

### Testing Strategy
- **Framework**: Vitest
- **Setup**: `__tests__/setup.ts`
- **Coverage**: Unit tests for CRUD operations
- **Integration**: API endpoint testing

---

## 📊 Database Schema

### Primary Tables
```sql
-- Links table (main entity)
links {
  id: int (PK, auto-increment)
  url: varchar(255) NOT NULL
  title: varchar(255) NOT NULL  
  description: text
  prompt: text
  userId: varchar(36) -- FK to users
  imageData: binary(255)
  imageMimeType: varchar(50)
  thumbnailData: binary(255)
  thumbnailMimeType: varchar(50)
  createdAt: timestamp NOT NULL
  updatedAt: timestamp NOT NULL
}

-- Users table
users {
  id: varchar(36) PK
  email: varchar(255) UNIQUE NOT NULL
  name: varchar(255)
  hashedPassword: varchar(255)
  role: enum('user', 'admin') DEFAULT 'user'
  createdAt: timestamp NOT NULL
  updatedAt: timestamp NOT NULL
}

-- Additional tables: ideas, projects, tasks, todos
```

---

## 🔐 Security Features

### Authentication
- **NextAuth.js**: Industry-standard authentication
- **Password Hashing**: Custom crypto.createHash('sha256') with salt
- **OAuth Integration**: Google OAuth with automatic user creation
- **Session Management**: Secure JWT tokens

### Data Protection
- **Input Validation**: API endpoint validation
- **SQL Injection**: Protected via Drizzle ORM
- **File Upload**: MIME type validation
- **Role-Based Access**: Admin/user role separation

---

## 🎨 Frontend Architecture

### React 19 Features
- **App Router**: Next.js 15 with modern routing
- **Server Components**: Optimal performance
- **Client Components**: Interactive UI elements
- **Streaming**: Progressive page loading

### Styling System
- **Tailwind CSS**: Utility-first styling
- **Headless UI**: Accessible components
- **Custom Components**: Consistent design system
- **Responsive Design**: Mobile-first approach

### State Management
- **React State**: Local component state
- **Context Providers**: Auth and theme management
- **Server State**: Next.js data fetching

---

## 📱 API Architecture

### RESTful Endpoints
```
GET    /api/links         # List links
POST   /api/links         # Create link
GET    /api/links/[id]    # Get specific link
PUT    /api/links/[id]    # Update link
DELETE /api/links/[id]    # Delete link

POST   /api/auth/register # User registration
POST   /api/auth/signin   # User login
GET    /api/admin/users   # Admin user management
POST   /api/upload        # File upload
POST   /api/ai            # AI integration
```

### Request/Response Patterns
- **Content-Type**: `application/json`
- **Authentication**: Bearer tokens via NextAuth
- **Error Handling**: Structured error responses
- **Validation**: Zod schema validation

---

## 🛠️ Tools & Integrations

### Development Tools
- **SuperClaude Framework**: AI-powered development assistance
- **Serena MCP**: Semantic code analysis
- **Claude Monitor**: Usage tracking
- **Docker**: Containerized deployment

### External Services
- **OpenAI API**: AI content generation
- **Google OAuth**: Authentication provider
- **YouTube API**: Video integration
- **MySQL**: Primary database

---

## 📈 Performance Optimizations

### Build Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with Sharp
- **Bundle Analysis**: Webpack bundle optimization
- **Memory Allocation**: 4GB for large builds

### Runtime Optimizations  
- **Server Components**: Reduced client bundle size
- **Static Generation**: Pre-rendered pages where possible
- **Caching**: Database query optimization
- **Compression**: Production build compression

---

## 🔍 Key Files Reference

### Configuration
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `drizzle.config.ts` - Database configuration
- `tailwind.config.ts` - Styling configuration
- `CLAUDE.md` - Development guidance

### Entry Points
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Homepage
- `app/api/` - API routes
- `middleware.ts` - Request middleware

### Database
- `lib/db/schema/index.ts` - Primary schema
- `drizzle/` - Migration files
- `scripts/seed.ts` - Database seeding

---

## 🚨 Important Notes

### Development Guidelines
- **Testing Required**: All changes must be tested via curl
- **Security First**: Never expose sensitive data
- **TypeScript**: Strict type checking enabled
- **Code Quality**: ESLint and Prettier configured

### Deployment
- **Docker Ready**: Dockerfile and compose files included
- **Environment Variables**: Database and OAuth configuration
- **Port Configuration**: Default port 9999
- **Production Build**: Optimized for standalone deployment

---

*Generated by SuperClaude Framework - Project Documentation Assistant*