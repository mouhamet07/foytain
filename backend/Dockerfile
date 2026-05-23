# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# openssl: required by Prisma query engine on Alpine
# libc6-compat: required by native Node addons (bcrypt, etc.)
RUN apk add --no-cache openssl libc6-compat

# Install dependencies (layer-cached separately from source)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma client then compile TypeScript
RUN npx prisma generate && npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Same native deps needed at runtime by Prisma + bcrypt
RUN apk add --no-cache openssl libc6-compat

# Install production-only deps and regenerate the Prisma client
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && \
    npx prisma generate && \
    npm cache clean --force

# Copy compiled TypeScript output from builder
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3001}/api/v1/health || exit 1

# Run migrations then start (migrations are idempotent and fast on subsequent runs)
CMD sh -c "npx prisma migrate deploy && node dist/main.js"
