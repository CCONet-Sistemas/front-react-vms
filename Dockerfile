# Development dependencies stage
FROM node:22-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Production dependencies stage
FROM node:22-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build stage
FROM node:22-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reactrouter

# Copy necessary files
COPY package.json package-lock.json ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build

# Change ownership to non-root user
RUN chown -R reactrouter:nodejs /app

USER reactrouter

EXPOSE 3000

CMD ["npm", "run", "start"]
