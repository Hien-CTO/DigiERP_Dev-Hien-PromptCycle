# Use Node.js 20 Slim as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install Python and build tools for bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for build
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
# Configure node-gyp to use official Node.js distribution URL
ENV npm_config_disturl=https://nodejs.org/dist
# Configure npm for better network handling
RUN npm config set strict-ssl false && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000
# Install dependencies with retry logic
RUN npm install || npm install || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
