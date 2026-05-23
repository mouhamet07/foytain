# ─────────────────────────────────────────────────────────────
# BUILD STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma + bcrypt native deps
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source
COPY . .

# Generate Prisma + build NestJS
RUN npx prisma generate
RUN npm run build


# ─────────────────────────────────────────────────────────────
# PRODUCTION STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Runtime dependencies
RUN apk add --no-cache openssl libc6-compat

# Install only production deps
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev
RUN npx prisma generate

# Copy build output
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -S nodejs && adduser -S nestjs

# Fix permissions (IMPORTANT for Prisma on Render)
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

# Health check (Render compatible)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3001}/api/v1/health || exit 1

# Start app + run migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]