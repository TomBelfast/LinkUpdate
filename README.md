# 🔗 Link Manager - Comprehensive Link & Project Management Platform

Modern, full-featured link management and project organization platform built with Next.js 15, featuring AI integration, authentication, and comprehensive task tracking.

## ✨ Features

- **🔗 Link Management** - Store, organize, and share links with metadata extraction and thumbnail generation
- **📝 Prompt Management** - Save and manage AI prompts for reuse
- **📺 YouTube Integration** - Special handling for YouTube videos with embedded players
- **✅ Task Management** - Todo lists and project organization
- **🤖 AI Integration** - Multiple AI providers (OpenAI, Anthropic, Google AI, Perplexity)
- **👤 User Authentication** - NextAuth.js with Google OAuth and credentials-based login
- **🔑 API Key Management** - Secure storage and management of API keys
- **🐙 GitHub Integration** - Repository management and description generation
- **🎨 Modern UI** - Tailwind CSS with responsive design and gradient buttons
- **📊 State Management** - Zustand + TanStack Query for efficient state handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+ (local or remote)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LinkUpdate-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   > **Note**: Dependency conflicts have been resolved. Installation should work without any flags.

3. **Configure environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   # Database Configuration (REQUIRED)
   DATABASE_HOST=192.168.0.9
   DATABASE_PORT=3306
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=your_database

   # NextAuth Configuration (REQUIRED)
   NEXTAUTH_SECRET=your-secret-key-min-32-characters
   NEXTAUTH_URL=http://localhost:9999

   # Google OAuth (Optional - for Google login)
   GOOGLE_ID=your-google-client-id
   GOOGLE_SECRET=your-google-client-secret

   # AI Providers (Optional)
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   GOOGLE_AI_API_KEY=your-google-ai-key
   PPLX_API_KEY=your-perplexity-key
   PPLX_MODEL=sonar
   ```

4. **Setup database** (optional)
   ```bash
   npm run db:setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at **http://localhost:9999**

## 📚 Documentation

> 📖 **Start here:** See **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** for complete documentation navigation and all available guides.

### Quick Links
- **[API Reference](API_REFERENCE.md)** - Complete API endpoints documentation with request/response examples
- **[Project Index](PROJECT_INDEX.md)** - Detailed project structure, architecture, and component overview
- **[Local Development Setup](LOCAL_DEV_SETUP.md)** - Step-by-step local development environment setup
- **[Database Setup](claudedocs/DATABASE-SETUP.md)** - Database configuration and migration guide
- **[Deployment Guide](claudedocs/DEPLOYMENT.md)** - Production deployment instructions

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript 5.7.3
- **Runtime**: Node.js 20+
- **Database**: MySQL 8.0+ with Drizzle ORM 0.29.3

### Frontend
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 3.3.0
- **Components**: Headless UI, Radix UI
- **State Management**: Zustand 5.0.7, TanStack Query 5.84.1
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Backend
- **Authentication**: NextAuth.js 4.24.11
- **API**: Next.js API Routes
- **Database ORM**: Drizzle ORM
- **Validation**: Zod

### AI & Integrations
- **AI Providers**: OpenAI, Anthropic, Google AI, Perplexity
- **OAuth**: Google OAuth 2.0
- **GitHub**: GitHub API integration

### Development Tools
- **Testing**: Vitest 3.2.4
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript

## 📁 Project Structure

```
LinkUpdate-1/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Page-specific components
│   ├── links/             # Link management
│   ├── prompts/           # Prompt management
│   ├── todo/              # Task management
│   └── youtube/           # YouTube integration
├── components/            # Reusable React components
├── lib/                   # Utilities and libraries
│   ├── db/               # Database schema and connections
│   ├── auth/             # Authentication utilities
│   ├── ai/               # AI service integration
│   └── store/            # Zustand stores
├── scripts/              # Database and deployment scripts
├── __tests__/            # Test files
└── docs/                 # Documentation
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## 🏗️ Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```
   
   Production server runs on port **8888** by default.

## 🐳 Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

See [DEPLOYMENT.md](claudedocs/DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Available Scripts

- `npm run dev` - Start development server (port 9999)
- `npm run build` - Build for production
- `npm run start` - Start production server (port 8888)
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:setup` - Full database setup (sync + generate + push)

## 📝 Key Features in Detail

### Link Management
- Store URLs with metadata (title, description)
- Automatic thumbnail generation
- Image storage and display
- Search and filter functionality
- Link sharing capabilities

### AI Integration
- Multiple AI provider support
- Prompt management and reuse
- Content generation
- API key management per user

### Authentication
- Google OAuth 2.0
- Credentials-based login
- Password reset functionality
- Role-based access control (admin/user)
- Secure session management

### Task Management
- Todo lists
- Project organization
- Idea tracking
- Status management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🔗 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

**Built with ❤️ using Next.js 15 and modern web technologies**
