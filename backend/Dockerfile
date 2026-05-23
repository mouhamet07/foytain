# ─────────────────────────────────────────────────────────────
# BUILD STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npm run build


# ─────────────────────────────────────────────────────────────
# PRODUCTION STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

# Install production deps (postinstall runs prisma generate)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# The pre-existing "node" user (uid 1000) ships in node:20-alpine
# and has a real home directory — no need to create a system user.
RUN chown -R node:node /app

USER node

EXPOSE 3001

# Health check — 120s start period covers Neon cold starts
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-3001}/api/v1/health || exit 1

# Migrations run inside main.ts (runMigrations) before NestJS bootstrap.
# No shell script — no CRLF issues, no permission issues.
CMD ["node", "dist/main.js"]
