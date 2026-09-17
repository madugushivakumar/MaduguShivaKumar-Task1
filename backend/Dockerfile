# Base Node.js image
FROM node:20-alpine AS base
WORKDIR /app

# Install backend dependencies
FROM base AS dependencies
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# Production runner image
FROM base AS runner

ENV NODE_ENV=production
ENV NODE_PATH=/app/backend/node_modules

WORKDIR /app/backend

# Copy backend dependencies
COPY --from=dependencies /app/backend/node_modules ./node_modules

# Copy backend package files
COPY backend/package*.json ./

# Copy backend source
COPY backend/src ./src

# Copy database scripts
COPY database /app/database

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Run migrations, then start the server
CMD ["sh", "-c", "npm run db:migrate && npm start"]