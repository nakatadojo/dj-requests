# Use Node.js LTS version
FROM node:20-slim

# Install Python and build tools for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy all package files first
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install --legacy-peer-deps

# Install client dependencies
WORKDIR /app/client
RUN npm install --legacy-peer-deps

# Install server dependencies
WORKDIR /app/server
RUN npm install --legacy-peer-deps

# Go back to root and copy all application code
WORKDIR /app
COPY . .

# Build the client
WORKDIR /app/client
RUN npm run build

# Go back to root for running the app
WORKDIR /app

# Create uploads directory for local dev (production uses /app/data volume)
RUN mkdir -p /app/server/uploads/covers

# Expose port
EXPOSE 3001

# Start server (DJ account creation happens automatically on startup)
# Updated: 2026-02-15 - Integrated DJ creation into server.js
CMD ["npm", "start"]
