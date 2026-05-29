# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Kreiraj non-root korisnika
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Kopiraj samo potrebne fajlove iz builder-a
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Kopiraj aplikaciju
COPY --chown=nodejs:nodejs . .

USER nodejs

# Health check - provera da li je Kafka consumer aktivan
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD ps aux | grep -v grep | grep "node" || exit 1

CMD ["npm", "start"]