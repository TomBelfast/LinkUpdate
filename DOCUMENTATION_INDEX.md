# 📚 Documentation Index

Complete navigation guide for Link Manager project documentation.

## 🚀 Getting Started

### For New Developers
1. **[README.md](README.md)** - Start here! Project overview, quick start guide, and key features
2. **[LOCAL_DEV_SETUP.md](LOCAL_DEV_SETUP.md)** - Detailed local development environment setup
3. **[PROJECT_INDEX.md](PROJECT_INDEX.md)** - Project structure, architecture, and component overview

### Quick Links
- [Installation Guide](#installation--setup)
- [API Documentation](#api-documentation)
- [Deployment Guides](#deployment)
- [Development Guides](#development)

---

## 📖 Core Documentation

### README.md
**Purpose:** Main project documentation and entry point
- Project overview and features
- Quick start guide
- Tech stack details
- Available scripts
- Project structure overview

**When to use:** First thing to read when starting with the project

---

### API_REFERENCE.md
**Purpose:** Complete API endpoint documentation
- All API endpoints with request/response examples
- Authentication requirements
- Error handling
- Rate limiting information

**When to use:** When working with API endpoints or integrating with the backend

---

### PROJECT_INDEX.md
**Purpose:** Detailed project structure and architecture
- Directory structure
- Core features breakdown
- Database schema
- Development workflow
- Key files reference

**When to use:** Understanding project architecture and codebase organization

---

## 🔧 Setup & Configuration

### Installation & Setup

#### LOCAL_DEV_SETUP.md
**Purpose:** Local development environment setup guide
- Prerequisites
- Installation steps
- Environment variable configuration
- Database setup
- Running the development server
- Troubleshooting

**Related Files:**
- `.env.local` - Environment variables (create from template)
- `package.json` - Dependencies and scripts

---

#### claudedocs/DATABASE-SETUP.md
**Purpose:** Database configuration and setup
- Internal vs external database options
- Docker Compose configuration
- Database connection setup
- Migration management
- Backup and recovery

**Related Files:**
- `drizzle.config.ts` - Database configuration
- `scripts/` - Database setup scripts

---

#### GOOGLE_OAUTH_SETUP.md
**Purpose:** Google OAuth 2.0 configuration
- Creating Google OAuth credentials
- Environment variable setup
- OAuth flow configuration

**Related Files:**
- `.env.local` - `GOOGLE_ID` and `GOOGLE_SECRET`

---

## 🚀 Deployment

### claudedocs/DEPLOYMENT.md
**Purpose:** Production deployment guide
- Docker deployment
- Environment configuration
- Production build process
- Deployment best practices
- Monitoring and logging

**Related Files:**
- `Dockerfile` - Docker image configuration
- `docker-compose.prod.yml` - Production Docker Compose

---

### COOLIFY-SETUP.md
**Purpose:** Coolify platform deployment
- Coolify-specific configuration
- Deployment process
- Environment variables setup

**Related Files:**
- `coolify.json` - Coolify configuration
- `coolify.prod.json` - Production configuration

---

### COOLIFY-QUICKSTART.md
**Purpose:** Quick start guide for Coolify deployment

---

### claudedocs/COOLIFY-RESTRICTIONS.md
**Purpose:** Coolify platform limitations and workarounds

---

## 💻 Development

### Code Quality & Architecture

#### claudedocs/analiza-jakosci-kodu.md
**Purpose:** Code quality analysis and recommendations
- Security issues
- Performance optimizations
- Architecture improvements
- Code quality metrics

---

#### PLAN_MODERNIZACJI.md
**Purpose:** Modernization plan and roadmap
- Planned improvements
- Migration strategies
- Technical debt reduction

---

#### SZCZEGOLOWY_PLAN_IMPLEMENTACJI.md
**Purpose:** Detailed implementation plan
- Step-by-step implementation guide
- Task breakdown
- Timeline and priorities

---

### UI & Design

#### UI_PRESERVATION_PLAN.md
**Purpose:** UI/UX preservation guidelines
- Design system documentation
- Component usage guidelines
- Style guide

**Related Files:**
- `components/ui/` - UI components
- `styles/common.ts` - Common styles
- `tailwind.config.ts` - Tailwind configuration

---

### Testing & Quality Assurance

#### claudedocs/test-results.md
**Purpose:** Test results and coverage reports

**Related Files:**
- `__tests__/` - Test files
- `vitest.config.ts` - Test configuration

---

### Security

#### claudedocs/sprint1-security-fixes-summary.md
**Purpose:** Security fixes and improvements documentation
- Security vulnerabilities addressed
- Security best practices
- Implementation details

---

## 📝 Project Planning & Memory

### memory-bank/

#### activeContext.md
**Purpose:** Current project context and active work

#### progress.md
**Purpose:** Project progress tracking

#### projectbrief.md
**Purpose:** Project brief and requirements

#### systemPatterns.md
**Purpose:** System patterns and architectural decisions

#### tasks.md
**Purpose:** Task tracking and management

#### techContext.md
**Purpose:** Technical context and technology decisions

---

## 🔍 Reference Documentation

### MIGRATION_SUMMARY.md
**Purpose:** Migration and refactoring summary
- Recent migrations
- Breaking changes
- Migration guides

---

### github.md
**Purpose:** GitHub integration documentation

---

### CLAUDE.md
**Purpose:** Development guidelines and best practices

---

## 📂 Documentation by Category

### Getting Started
- [README.md](README.md)
- [LOCAL_DEV_SETUP.md](LOCAL_DEV_SETUP.md)
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

### API & Backend
- [API_REFERENCE.md](API_REFERENCE.md)
- [PROJECT_INDEX.md](PROJECT_INDEX.md) - API architecture section

### Database
- [claudedocs/DATABASE-SETUP.md](claudedocs/DATABASE-SETUP.md)
- [PROJECT_INDEX.md](PROJECT_INDEX.md) - Database schema section

### Deployment
- [claudedocs/DEPLOYMENT.md](claudedocs/DEPLOYMENT.md)
- [COOLIFY-SETUP.md](COOLIFY-SETUP.md)
- [COOLIFY-QUICKSTART.md](COOLIFY-QUICKSTART.md)

### Development
- [PROJECT_INDEX.md](PROJECT_INDEX.md)
- [PLAN_MODERNIZACJI.md](PLAN_MODERNIZACJI.md)
- [claudedocs/analiza-jakosci-kodu.md](claudedocs/analiza-jakosci-kodu.md)

### Architecture & Design
- [PROJECT_INDEX.md](PROJECT_INDEX.md) - Architecture sections
- [UI_PRESERVATION_PLAN.md](UI_PRESERVATION_PLAN.md)
- [memory-bank/systemPatterns.md](memory-bank/systemPatterns.md)

---

## 🔗 Quick Reference Links

### Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.js` / `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database ORM configuration
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (create from template)

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utilities, stores, and services
- `scripts/` - Database and deployment scripts
- `__tests__/` - Test files
- `docs/` - Additional documentation

---

## 📋 Documentation Maintenance

### How to Update Documentation

1. **API Changes:** Update `API_REFERENCE.md` when adding/modifying endpoints
2. **Architecture Changes:** Update `PROJECT_INDEX.md` for structural changes
3. **Setup Changes:** Update `LOCAL_DEV_SETUP.md` for environment setup changes
4. **New Features:** Update relevant sections in `README.md` and `PROJECT_INDEX.md`

### Documentation Standards

- Use clear, descriptive headings
- Include code examples where helpful
- Link to related documentation
- Keep information up-to-date
- Use consistent formatting

---

## 🆘 Need Help?

### Common Issues

1. **Installation Problems**
   - Check [LOCAL_DEV_SETUP.md](LOCAL_DEV_SETUP.md) troubleshooting section
   - Verify Node.js version (18+)
   - Check environment variables

2. **API Questions**
   - Refer to [API_REFERENCE.md](API_REFERENCE.md)
   - Check endpoint examples
   - Verify authentication requirements

3. **Database Issues**
   - See [claudedocs/DATABASE-SETUP.md](claudedocs/DATABASE-SETUP.md)
   - Check connection configuration
   - Verify migrations

4. **Deployment Problems**
   - Review [claudedocs/DEPLOYMENT.md](claudedocs/DEPLOYMENT.md)
   - Check Docker configuration
   - Verify environment variables

---

*Last updated: 2024-12-29*
*Maintained by: Development Team*

