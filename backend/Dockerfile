# ─────────────────────────────────────────────────────────────
# BUILD STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma + bcrypt native deps
RUN apk add --no-cache openssl libc6-compat

# Install dependencies (postinstall runs prisma generate automatically)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source
COPY . .

# Build NestJS (prisma generate already ran via postinstall)
RUN npm run build


# ─────────────────────────────────────────────────────────────
# PRODUCTION STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Runtime dependencies
RUN apk add --no-cache openssl libc6-compat

# Install only production deps (postinstall runs prisma generate automatically)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /app/dist ./dist

# Create non-root user and add to nodejs group
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# Fix permissions (IMPORTANT for Prisma on Render)
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

# Health check (Render compatible) — 120s start period for Neon cold starts
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-3001}/api/v1/health || exit 1

# Run migrations then start the app.
# Uses direct binary (not npx) to avoid npx cache issues with system users.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node --max-old-space-size=256 dist/main.js"]
