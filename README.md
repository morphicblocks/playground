# playground

Example apps for **Morphic Blocks**, served at `playground.morphicblocks.com`.
Each app shows a different use case, built with a different stack. **Every app
is self contained:** download its folder and run it on its own.

## Develop

```sh
cp .env.example .env   # then edit .env
bun install            # tools for the check script
bun run dev            # gallery dev server (the gallery page only)
bun run build          # assemble the whole playground into ./dist
bun run preview        # build, then serve it all at localhost:4321
bun run readmes        # write the generated parts of every app README
bun run check          # READMEs, build, then fail on any external request
```

Run `bun run check` before pushing; CI runs it on every push too.
`ONLY=<id> bun run build` builds a single app while iterating.

## Structure

```text
apps.json              every app in apps/, with what the gallery shows about it
apps/<id>/             self contained apps (own package.json, lockfile, toolchain)
gallery/               the front door (Astro): cards and the comparison table
scripts/manifest.ts    allowed values for apps.json, and its validation
scripts/build-all.ts   builds the gallery into dist/, then each app into dist/<id>/
scripts/check.ts       the pre-push check
scripts/preview.ts     builds and serves the whole playground locally
scripts/readmes.ts     writes the generated parts of the app READMEs
LICENSE-APPS           the license of everything in apps/
```

## apps.json

An app is listed once it exists; there are no placeholder entries. Each entry
has these fields:

| Field | Meaning |
| --- | --- |
| `id` | Folder name, URL segment and link key. Never change it. |
| `name` | Display title, safe to change |
| `description` | One or two sentences on the card |
| `details` | The longer text behind the card's "More"; blank lines start paragraphs |
| `useCase` | What the app demonstrates, e.g. "Block to text transition" |
| `framework`, `bundler`, `packageManager`, `styling` | The stack, as keys from `scripts/manifest.ts` |
| `language` | `typescript` or `javascript`; only for apps without a framework, and required for them |
| `views` | What is on screen: `blocks`, `text`, `preview` |
| `codeShown` | The languages the blocks turn into, e.g. `["Python"]` |
| `difficulty` | `beginner`, `intermediate` or `advanced` |
| `preview` | Card image path, or `null` for a titled box |
| `outDir` | Build output folder, only when it is not `dist` |

`scripts/manifest.ts` holds the allowed values with their labels and logos,
and checks the file before every build and gallery start. A typo stops the
build with a list of every problem.

## Links

Every link is derived from the app's `id`, never stored:

| Link | Target |
| --- | --- |
| Card click | `/<id>/`, in a new tab |
| Source | `{PUBLIC_GITHUB_URL}/tree/main/apps/{id}` |
| Download | `{PUBLIC_GITHUB_URL}/releases/latest/download/{id}.zip` |
| Copy CLI | `npx giget gh:{PUBLIC_REPO_SLUG}/apps/{id} {id}` |

Download stays disabled until the ZIPs are published; `downloadsAvailable` in
`gallery/src/config.ts` switches every Download button on at once.

## Rules for apps

- **Self contained.** Nothing is shared between apps. That duplication is
  deliberate: it is what makes a downloaded folder runnable on its own.
- **Knows nothing about the playground.** The build passes `BASE_PATH=/<id>`,
  the subpath the app is served under here; a standalone build leaves it unset
  and serves from `/`. With Vite that is `base`, with Next.js `basePath`.
- **Commits its lockfile.** The build checks that it matches `packageManager`.
- **No external requests.** No web fonts, scripts or styles from other
  servers, and Blockly's images and sounds are served by the app itself (see
  the docs guide *Privacy & External Requests*). `bun run check` opens every
  app in headless Chrome and fails on any request to another server.
- **Blockly's media is copied, not committed.** Each app's
  `scripts/copy-blockly-media.mjs` copies Blockly's images, cursors and sounds
  into `public/blockly-media/`. The app's `dev` and `build` scripts run it
  first, so nobody runs it by hand, and the copy always matches the installed
  Blockly. The app's `.gitignore` keeps the copy out of git.

## License

The apps in `apps/` are licensed under **MIT-0** ([LICENSE-APPS](LICENSE-APPS)):
copy them into your own project and use them without any conditions.
Everything else in this repository is Apache-2.0 ([LICENSE](LICENSE)). Each
app's README ends with a line pointing to LICENSE-APPS, so a downloaded copy
still shows its license.

## App READMEs

Every app README has the same layout. `bun run readmes` writes two parts of
it from `apps.json`, each between hidden markers: the top (title,
description, badges, the table and the run commands) and the license at the
end. The part between them is written by hand, usually a "Where to look"
list of the files worth opening first. `bun run check` fails when a README
no longer matches `apps.json`.

## Adding an app

1. Create `apps/<id>/` as a normal standalone project, with its lockfile.
2. Add its entry to `apps.json`.
3. Run `bun run readmes`, then fill in the hand written part of its README.
4. Run `bun run check`.

## Configuration

Every switchable value is a build-time `PUBLIC_*` env var, read in
`gallery/src/config.ts`. One `.env` at the repo root serves the project.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_NAME` | Title and brand in the gallery |
| `PUBLIC_SITE_URL` | Canonical site URL, used by the link-preview tags |
| `PUBLIC_REPO_SLUG` | `owner/repo`, used to build the CLI command |
| `PUBLIC_GITHUB_URL` | Repository URL, used for the Source and Download links |
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
gallery is served at `/` and each app at `/<id>/`. Two compose files, so
the same image can be run with or without a reverse proxy in front.

`deploy_docker.sh` picks the compose files for you, so the only thing you
choose is which machine you are on:

```sh
cp .env.example .env              # once, then edit DEPLOY_DOMAIN

./deploy_docker.sh local          # build and start here, on :9352
./deploy_docker.sh prod           # build and start behind Traefik
./deploy_docker.sh prod down      # stop and remove
./deploy_docker.sh prod logs -f   # follow the logs
```

Given no action it runs `up -d --build`, which is what you want almost every
time. Anything after the mode is handed straight to `docker compose`, so
`ps`, `build --no-cache` and the rest work as well. Before running it checks
that `.env` exists, and in `prod` mode that the `traefik` network is there,
since both failures are otherwise obscure.

The same thing without the script:

```sh
docker compose up -d --build                                    # local
docker compose -f docker-compose.yaml \
               -f docker-compose.prod.yaml up -d --build        # prod
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

An app whose `packageManager` is not `bun` needs that package manager installed
in the build stage (and in the CI workflow) before it is added.

Any static host works too: build command `bun run build`, output directory
`dist`, with the `PUBLIC_*` vars set in the host's project settings.
