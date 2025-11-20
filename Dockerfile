# --- Runtime base (Alpine for small image) ---
FROM node:20-alpine

# Enable SSL certificate trust for RDS
RUN apk add --no-cache ca-certificates

# Set working dir inside container
WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install production dependencies (fast + reproducible)
RUN npm ci --omit=dev

# Copy backend source code only
COPY . .

# Expose backend API port
EXPOSE 3001

# Optional: Add a healthcheck (you must add /health route)
# HEALTHCHECK --interval=30s --timeout=5s \
#   CMD wget -qO- http://localhost:3001/health || exit 1

# Run backend as non-root user
USER node

# Start the server
CMD ["node", "index.js"]
