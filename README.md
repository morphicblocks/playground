# playground

Example apps embedding **Morphic Blocks** in different frameworks and
toolchains — served at `playground.morphicblocks.com`.

The point is to show the library is framework-agnostic: every app embeds the
same setup, and only the host-framework glue differs. **Each app is
self-contained** — download its folder and run it on its own.

## Develop

```sh
cp .env.example .env   # then edit .env
bun run dev            # gallery dev server
bun run build          # assemble the whole playground into ./dist
```

`ONLY=<id> bun run build` builds a single app while iterating.

## Structure

```text
apps.json            single source of truth — every app, including planned ones
apps/<id>/           self-contained apps (own package.json, lockfile, toolchain)
gallery/             the front door (Astro): cards, stack logos, derived links
scripts/build-all.ts builds gallery → dist/, then each ready app → dist/<id>/
```

## How an app is wired

- **`id` is immutable** — it is the folder name, the URL segment (`/<id>/`), and
  the key used to derive links. `name` is display-only and safe to change.
- **Links are derived, not stored**: source → `{PUBLIC_GITHUB_URL}/tree/main/apps/{id}`,
  download → `bunx degit {PUBLIC_REPO_SLUG}/apps/{id} {id}`.
- **Package manager is inferred** from the app's lockfile (`bun.lock`,
  `pnpm-lock.yaml`, `yarn.lock`, otherwise npm).
- **Build output** is assumed to be `dist`; set `outDir` on the entry only when
  the toolchain differs (Next.js static export writes to `out`).
- **`status`** is the placeholder switch: `planned` renders a greyed card with a
  disabled button and is skipped by the build; `ready` builds and links.

Nothing is shared between apps. That duplication is deliberate — it is what
makes a downloaded folder runnable on its own.

## Adding an app

1. Create `apps/<id>/` as a normal standalone project.
2. Add an entry to `apps.json` (start with `"status": "planned"`).
3. Flip to `"ready"` once it builds.

Assets must resolve under a subpath (`/<id>/`) as well as standalone. With Vite
that is `base: './'`; other toolchains have their own equivalent (Next.js needs
`basePath`/`assetPrefix`).

## Configuration

Every switchable value is a build-time `PUBLIC_*` env var, read in
`gallery/src/config.ts`. One `.env` at the repo root serves the project.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_NAME` | Title and brand in the gallery |
| `PUBLIC_SITE_URL` | Canonical site URL, used by the link-preview tags |
| `PUBLIC_REPO_SLUG` | `owner/repo`, used to build the degit command |
| `PUBLIC_GITHUB_URL` | Repository URL, used for "Source" links |
| `PUBLIC_DOCS_URL` | Link to the documentation site |
| `PUBLIC_LANDING_URL` | Link to the landing page |
| `PUBLIC_UNIVERSITY` | Copyright holder in the footer |
| `PUBLIC_UNIVERSITY_URL` | Link target for the copyright holder |
| `PUBLIC_IMPRINT_URL` | Imprint link in the footer |
| `PUBLIC_PRIVACY_URL` | Privacy policy link in the footer |
| `PUBLIC_DISCLAIMER_URL` | Disclaimer (Haftungsausschluss) link in the footer |

A link whose `PUBLIC_*` variable is unset or empty is not rendered at all, so
an incomplete configuration never produces dead `#` links. Links to other sites
open in a new tab.

## Deploy

The playground ships as a Docker image: a `bun` stage runs the full assembly
(`scripts/build-all.ts`), an `nginx` stage serves the resulting `dist/`. The
gallery is served at `/` and each ready app at `/<id>/`. Two compose files, so
the same image can be run with or without a reverse proxy in front.

**Locally**, to check a change in the image that actually gets deployed:

```sh
docker compose up -d --build
open http://localhost:8082
```

**On the server**, behind an existing Traefik instance:

```sh
cp .env.example .env     # then edit, DEPLOY_DOMAIN in particular
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d --build
```

The second file adds only the Traefik router labels and the external `traefik`
network. It expects Traefik to be running already and attached to that
network. Traefik terminates TLS and forwards plain HTTP to the container, so
nginx listens on port 80 only and holds no certificate.

`DEPLOY_DOMAIN` is the one value that differs per deployment, along with
`HTTP_PROXY` and friends if the build host needs a proxy. Everything else
(image and container names, the loopback port, the entrypoint and network
names) is the same for every clone and is written directly in the compose
files.

Because the `PUBLIC_*` values are baked in at build time, changing any of them
means rebuilding: `docker compose … up -d --build` again.

An app whose lockfile is not `bun.lock` needs its package manager installed in
the build stage before it can be flipped to `ready`; every app is still
`planned`, so only the gallery is built today.

Any static host works too: build command `bun run build`, output directory
`dist`, with the `PUBLIC_*` vars set in the host's project settings.
