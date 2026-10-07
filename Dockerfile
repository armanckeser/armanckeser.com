# The studio: the site's own dev server, running against a clone of this repo
# that lives in a volume. The image only carries the dependencies; the code,
# the posts and the components come from the clone, so a `git pull` (or a
# publish) is all it takes for the studio to pick up a change.
#
# Built natively on arm64 for the home server (see build-cms-image.yml): the
# dev server needs the platform's own esbuild and rollup binaries.
FROM node:24-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates git \
	&& rm -rf /var/lib/apt/lists/* \
	&& npm install -g bun

WORKDIR /app
COPY package.json bun.lock ./
ENV HUSKY=0
RUN --mount=type=cache,target=/root/.bun/install/cache \
	bun install --frozen-lockfile

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV PORT=3000 \
	STUDIO=1 \
	REPO_PATH=/app/repo \
	NODE_OPTIONS=--max-old-space-size=1536
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "/app/node_modules/vite/bin/vite.js", "dev", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]
