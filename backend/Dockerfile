# ─────────────────────────────────────────────
#  Stage 1 – Install dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# ─────────────────────────────────────────────
#  Stage 2 – Production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 expressjs

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY package.json ./

# Create uploads directory (persisted via Render Disk if needed)
RUN mkdir -p uploads/documents && \
    chown -R expressjs:nodejs uploads

# Switch to non-root user
USER expressjs

# Expose the Express port
EXPOSE 5000

# Health-check so Render knows the container is alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the server (uses `node` directly — no nodemon in production)
CMD ["node", "src/server.js"]
