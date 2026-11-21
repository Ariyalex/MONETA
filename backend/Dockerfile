ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app

RUN apk add --no-cache openssl

# dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Development: development hot reload
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
CMD ["sh", "-c", "npx prisma generate --config prisma7.config.ts && npm run dev"]

# generate prisma client dan compile typescript
FROM deps AS build
COPY . .
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
    npx prisma generate --config prisma7.config.ts
RUN npm run build

# database migration
FROM deps AS migrate
COPY . .
CMD ["npx", "prisma", "migrate", "deploy", "--config", "prisma7.config.ts"]

# production dependency
FROM base AS prod-deps
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev


# Production
FROM base AS prod
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node::node /app/node_modules ./node_modules

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["npm", "start"]
