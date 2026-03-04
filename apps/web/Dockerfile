# ── Stage 1: Install dependencies ──────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

# ── Stage 2: Build the application ────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Generate Prisma client
RUN npm run -w apps/web prisma:generate

# Build the Next.js app (standalone output)
RUN npm run -w apps/web build

# ── Stage 3: Production runner ────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets (images, favicon, etc.) — must be relative to server.js
COPY --from=builder /workspace/apps/web/public ./apps/web/public

# Copy standalone server + dependencies
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
# Copy static assets (.next/static → .next/static in standalone)
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The standalone server is at apps/web/server.js (monorepo layout)
CMD ["node", "apps/web/server.js"]
