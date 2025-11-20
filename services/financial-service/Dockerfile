FROM node:18-slim

WORKDIR /app

# Install Python and build tools for bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install all dependencies including devDependencies for build
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
# Configure node-gyp to use official Node.js distribution URL
ENV npm_config_disturl=https://nodejs.org/dist
RUN npm config set strict-ssl false
RUN npm install

COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

EXPOSE 3007

CMD ["npm", "run", "start:prod"]
