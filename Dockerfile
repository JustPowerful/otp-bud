# ---- Frontend Build Stage ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ .
RUN pnpm build

# ---- Backend Build Stage ----
FROM node:20-alpine AS backend
WORKDIR /app/backend

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ .

# Copy built frontend assets to the backend's public directory
COPY --from=frontend /app/frontend/dist ./public

RUN pnpm run build

# ---- Final Stage ----
FROM node:20-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=backend /app/backend/package.json /app/backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=backend /app/backend/dist ./dist
COPY --from=backend /app/backend/public ./public
COPY --from=backend /app/backend/prisma ./prisma
COPY --from=backend /app/backend/prisma.config.ts ./prisma.config.ts
COPY .env ./
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]