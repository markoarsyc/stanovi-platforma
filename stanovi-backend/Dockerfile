# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiraj package fajlove i instaliraj zavisnosti
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Kopiraj ostatak koda i generiši Prisma Client
COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Kreiraj non-root korisnika
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Kopiraj fajlove i ODMAH im dodeli vlasnika
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.js ./

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Pokretanje aplikacije
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
