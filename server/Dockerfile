# Install all deps (including dev) for build/generate
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Build stage: copy source, run prisma tasks, then reinstall prod deps
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Provide a default DATABASE_URL for Prisma generate during build
# (no DB connection is attempted during generate; this just satisfies schema validation)
ARG DATABASE_URL=postgresql://postgres:password@streamer-db:5432/streamer_tracker
ENV DATABASE_URL=$DATABASE_URL
# Ensure OpenSSL 3 libraries are available for Prisma engines on Alpine
RUN apk add --no-cache openssl
RUN yarn prisma:generate:Docker \
    && rm -rf node_modules \
    && yarn install --frozen-lockfile --production=true

# Runtime image: minimal, only production deps and app files
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app ./ 
# Ensure OpenSSL 3 libraries are available at runtime for Prisma migrate deploy
RUN apk add --no-cache openssl
EXPOSE 3000
# Ensure entrypoint is executable and run migrations before starting the server
RUN chmod +x ./docker-entrypoint.sh || true
CMD ["sh", "./docker-entrypoint.sh"]
