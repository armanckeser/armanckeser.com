# Stage 1: Build CMS
FROM --platform=$BUILDPLATFORM node:24-slim AS build
WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .
ENV BUILD_MODE=cms
ENV GITHUB_TOKEN=unused
RUN bun run build

# Stage 2: Runtime
FROM --platform=$TARGETPLATFORM node:24-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build ./build
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV ORIGIN=http://localhost:3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "build"]
