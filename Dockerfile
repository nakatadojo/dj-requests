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

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy application code
COPY . .

# Build the client
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
