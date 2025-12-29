# Use the official Node.js 20 image as base
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

# Next.js telemetry disabled
ENV NEXT_TELEMETRY_DISABLED 1

# ARGs passed from Coolify/Docker Compose
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_USER
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GOOGLE_ID
ARG GOOGLE_SECRET
ARG OPENAI_API_KEY
ARG ANTHROPIC_API_KEY
ARG GOOGLE_AI_API_KEY
ARG PPLX_API_KEY
ARG PPLX_MODEL
ARG NODE_ENV

# Set environment variables for build
# We use dummy values that pass our Zod validation if real ones aren't provided
ENV DATABASE_HOST=${DATABASE_HOST:-localhost}
ENV DATABASE_PORT=${DATABASE_PORT:-3306}
ENV DATABASE_USER=${DATABASE_USER:-user}
ENV DATABASE_PASSWORD=${DATABASE_PASSWORD:-password}
ENV DATABASE_NAME=${DATABASE_NAME:-database}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dummy-secret-key-at-least-thirty-two-chars}
ENV NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
ENV GOOGLE_ID=${GOOGLE_ID:-dummy-google-id}
ENV GOOGLE_SECRET=${GOOGLE_SECRET:-dummy-google-secret}
ENV NODE_ENV=${NODE_ENV:-production}
ENV SKIP_ENV_VALIDATION=true

# Build the application
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]