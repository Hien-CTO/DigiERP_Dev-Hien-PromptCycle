FROM node:18-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Configure npm for better network handling and SSL certificate issues
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000

COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install || npm install || npm install

COPY . .

RUN npm run build

EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3008/api/v1/health || exit 1

CMD ["npm", "run", "start:prod"]

