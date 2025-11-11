# Use the official Node.js 20 image as base
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure public directory exists (create if missing)
RUN mkdir -p public

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build arguments for environment variables (optional during build)
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_USER
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GOOGLE_ID
ARG GOOGLE_SECRET
ARG PPLX_API_KEY
ARG PPLX_MODEL
ARG NODE_ENV

# Set environment variables for build (use dummy values if not provided)
ENV DATABASE_HOST=${DATABASE_HOST:-localhost}
ENV DATABASE_PORT=${DATABASE_PORT:-3306}
ENV DATABASE_USER=${DATABASE_USER:-user}
ENV DATABASE_PASSWORD=${DATABASE_PASSWORD:-password}
ENV DATABASE_NAME=${DATABASE_NAME:-database}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dummy-secret-key-for-build-only-min-32-chars}
ENV NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
ENV GOOGLE_ID=${GOOGLE_ID:-dummy-google-id}
ENV GOOGLE_SECRET=${GOOGLE_SECRET:-dummy-google-secret}
ENV PPLX_API_KEY=${PPLX_API_KEY:-}
ENV PPLX_MODEL=${PPLX_MODEL:-}
ENV NODE_ENV=${NODE_ENV:-development}

# Verify npm is available and build
RUN which npm && npm --version || echo "npm not found"
# Build with increased memory allocation for large builds
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then NODE_OPTIONS=--max_old_space_size=4096 npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && NODE_OPTIONS=--max_old_space_size=4096 pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copy drizzle migrations directory for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]