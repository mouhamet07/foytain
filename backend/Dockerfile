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

# Create non-root user (in nodejs group for consistent ownership)
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# Strip CRLF from start.sh (Windows git may commit it with \r\n)
# then set ownership and permissions
RUN sed -i 's/\r$//' /app/start.sh \
 && chown -R nestjs:nodejs /app \
 && chmod +x /app/start.sh

USER nestjs

EXPOSE 3001

# Health check — 120s start period covers Neon cold starts
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-3001}/api/v1/health || exit 1

# Use "sh /app/start.sh" (not exec-form) so Docker doesn't rely on the
# shebang line — bypasses the CRLF-corrupted shebang on Windows-built images
CMD ["sh", "/app/start.sh"]
