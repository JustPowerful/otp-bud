ARG PNPM_VERSION=10.33.0

# ---- Frontend Build Stage ----
FROM node:20-alpine AS frontend
ARG PNPM_VERSION
WORKDIR /app/frontend

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL


RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ .
RUN pnpm build

# ---- Backend Build Stage ----
FROM node:20-alpine AS backend
ARG PNPM_VERSION
WORKDIR /app/backend

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY backend/ .

# Generate Prisma Client before building the backend
# Dummy DATABASE_URL is used to avoid errors during the build process
RUN DATABASE_URL="postgresql://user:pass@localhost:5432/db" pnpm prisma generate

# Copy built frontend assets to the backend's public directory
COPY --from=frontend /app/frontend/dist ./public

RUN pnpm run build

# ---- Final Stage ----
FROM node:20-alpine AS production
ARG PNPM_VERSION
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY --from=backend /app/backend/package.json /app/backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=backend /app/backend/dist ./dist
COPY --from=backend /app/backend/public ./public
COPY --from=backend /app/backend/prisma ./prisma
COPY --from=backend /app/backend/prisma.config.ts ./prisma.config.ts

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]