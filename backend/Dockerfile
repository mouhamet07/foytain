# ─────────────────────────────────────────────────────────────
# BUILD STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma + bcrypt native deps
RUN apk add --no-cache openssl libc6-compat

# Install all dependencies (postinstall runs prisma generate)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build


# ─────────────────────────────────────────────────────────────
# PRODUCTION STAGE
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Runtime native deps
RUN apk add --no-cache openssl libc6-compat

# Install production dependencies (postinstall runs prisma generate)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy compiled app and startup script
COPY --from=builder /app/dist ./dist
COPY start.sh ./start.sh

# Strip CRLF (Windows git may commit .sh files with \r\n),
# fix ownership for the pre-existing "node" user (uid 1000, /home/node exists),
# and ensure start.sh is executable.
# The "node" user ships in node:20-alpine — no need to create a system user.
RUN sed -i 's/\r$//' /app/start.sh \
 && chown -R node:node /app \
 && chmod +x /app/start.sh

USER node

EXPOSE 3001

# Health check — 120s start period covers Neon cold starts
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-3001}/api/v1/health || exit 1

# sh /app/start.sh bypasses the shebang (no exec-form binary lookup),
# so CRLF in the shebang line cannot cause exit 128.
CMD ["sh", "/app/start.sh"]
