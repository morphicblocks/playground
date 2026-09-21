#!/usr/bin/env bash
#
# Start, stop and inspect this site's container.
#
#   ./deploy_docker.sh <local|prod> [docker compose arguments...]
#
# The mode picks which compose files are used:
#
#   local   docker-compose.yaml                        build + nginx, no proxy
#   prod    docker-compose.yaml + docker-compose.prod.yaml   adds the Traefik router
#
# Anything after the mode is handed straight to `docker compose`, so every
# subcommand works without this script having to know about it. With no
# further arguments it runs `up -d --build`, which is what is wanted almost
# every time, since the site is baked into the image at build time.
#
# Make it executable once:  chmod +x deploy_docker.sh

set -euo pipefail

# Work from the repo root, whichever directory the script was invoked from.
cd "$(dirname "$0")"

# Matches the external network named in docker-compose.prod.yaml.
TRAEFIK_NETWORK="traefik"

# Read back from the compose file so this text cannot drift from reality.
PORT="$(grep -o '127\.0\.0\.1:[0-9]\+' docker-compose.yaml | head -1 | cut -d: -f2 || true)"

usage() {
  cat <<USAGE
Usage: ./deploy_docker.sh <local|prod> [docker compose arguments...]

  local   this machine, no reverse proxy    -> http://localhost:${PORT:-<port>}
  prod    behind an existing Traefik        -> the host set in DEPLOY_DOMAIN

Runs \`up -d --build\` when no further arguments are given.

  ./deploy_docker.sh local                   build and start here
  ./deploy_docker.sh prod up -d --build      build and start behind Traefik
  ./deploy_docker.sh prod down               stop and remove
  ./deploy_docker.sh prod logs -f            follow the logs
  ./deploy_docker.sh local build --no-cache  rebuild, ignoring cached layers
USAGE
}

mode="${1:-}"
case "$mode" in
  local) files=(-f docker-compose.yaml) ;;
  prod) files=(-f docker-compose.yaml -f docker-compose.prod.yaml) ;;
  -h | --help | help)
    usage
    exit 0
    ;;
  "")
    echo "Error: no mode given." >&2
    echo >&2
    usage >&2
    exit 1
    ;;
  *)
    echo "Error: unknown mode '$mode'." >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac
shift

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: 'docker' is not on your PATH." >&2
  echo "On macOS the Docker Desktop CLI lives in ~/.docker/bin." >&2
  exit 1
fi

# The PUBLIC_* values are read during the build, so a missing .env yields a
# site with empty names and no links rather than an obvious failure.
if [ ! -f .env ]; then
  echo "Error: .env not found. Create it first:" >&2
  echo "    cp .env.example .env" >&2
  exit 1
fi

# Traefik's network is declared external, so compose will not create it and
# the error it raises on its own is not self-explanatory.
if [ "$mode" = "prod" ] && ! docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1; then
  echo "Error: the '$TRAEFIK_NETWORK' Docker network does not exist." >&2
  echo "Start Traefik first, or create the network with:" >&2
  echo "    docker network create $TRAEFIK_NETWORK" >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  set -- up -d --build
fi

echo "▸ docker compose ${files[*]} $*"
docker compose "${files[@]}" "$@"

# A detached local `up` prints nothing useful about where to look.
if [ "$mode" = "local" ] && [ "$1" = "up" ] && [ -n "$PORT" ]; then
  echo
  echo "▸ http://localhost:$PORT"
fi
