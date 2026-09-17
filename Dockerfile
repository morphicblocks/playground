# syntax=docker/dockerfile:1

# ── Build ─────────────────────────────────────────────────────────────
# `bun run build` runs scripts/build-all.ts, which builds the gallery and then
# every app marked `ready` in apps.json, assembling them into one `dist/`.
#
# The PUBLIC_* values are baked into the static output at build time, so `.env`
# has to be readable in this stage (see .dockerignore). It never reaches the
# served image: the stage below copies only the built `dist/`.
#
# Pinned to the bun minor line the lockfile was generated with, so
# `--frozen-lockfile` stays valid.
FROM oven/bun:1.3-alpine AS build

# For hosts that reach the internet through an outbound proxy. Empty by
# default, so the build also works on a machine without one.
ARG HTTP_PROXY=""
ARG HTTPS_PROXY=""
ARG NO_PROXY=""

WORKDIR /app

# The gallery holds the only lockfile, and the repo root has no dependencies
# of its own. Installing it up front keeps this layer cached when only content
# changes; build-all.ts runs the same install again, which is a no-op once
# node_modules is in place.
COPY gallery/package.json gallery/bun.lock ./gallery/
RUN cd gallery && bun install --frozen-lockfile

COPY . .
RUN bun run build

# NOTE: every app is still `planned`, so only the gallery is built here. Apps
# infer their package manager from their own lockfile, so an app that flips to
# `ready` with a pnpm, yarn or npm lockfile needs that package manager
# installed in this stage first.

# ── Serve ─────────────────────────────────────────────────────────────
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
