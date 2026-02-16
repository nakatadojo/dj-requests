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

# Expose port
EXPOSE 3001

# Start script that creates DJ account if needed, then starts server
CMD ["sh", "-c", "npm run create-dj-env && npm start"]
