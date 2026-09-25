#!/usr/bin/env bun
/**
 * Builds the playground into a single deployable `dist/`:
 *
 *   dist/            ← the gallery (Astro)
 *   dist/<id>/       ← each app's own build output
 *
 * Each app under apps/<id>/ is an independent project with its own toolchain.
 * The package manager is inferred from its lockfile; the output directory is
 * `dist` unless the app's apps.json entry overrides it.
 *
 * Set ONLY=<id> to build a single app while iterating locally.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PlaygroundApp } from './manifest';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const only = process.env.ONLY;

const { apps }: { apps: PlaygroundApp[] } = JSON.parse(
  readFileSync(join(root, 'apps.json'), 'utf8'),
);

/** Infer the package manager from whichever lockfile the app committed. */
function detectPackageManager(dir: string): string {
  if (existsSync(join(dir, 'bun.lock')) || existsSync(join(dir, 'bun.lockb'))) return 'bun';
  if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(dir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function run(cmd: string[], cwd: string) {
  const { exitCode } = Bun.spawnSync(cmd, { cwd, stdout: 'inherit', stderr: 'inherit' });
  if (exitCode !== 0) {
    throw new Error(`\`${cmd.join(' ')}\` failed in ${cwd} (exit ${exitCode})`);
  }
}

// 1. Gallery first — Astro clears its own dist, so copy it in before the apps.
const gallery = join(root, 'gallery');
console.log('▸ building gallery');
run(['bun', 'install'], gallery);
run(['bun', 'run', 'build'], gallery);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(gallery, 'dist'), dist, { recursive: true });

// 2. Each app into dist/<id>/
for (const app of apps) {
  if (only && app.id !== only) continue;

  // Only existing apps are listed, so a missing folder is a mistake.
  const dir = join(root, 'apps', app.id);
  if (!existsSync(dir)) {
    throw new Error(`${app.id}: listed in apps.json, but apps/${app.id}/ does not exist`);
  }

  const pm = detectPackageManager(dir);
  console.log(`▸ building ${app.id} (${pm})`);
  run([pm, 'install'], dir);
  run([pm, 'run', 'build'], dir);

  const out = join(dir, app.outDir ?? 'dist');
  if (!existsSync(out)) {
    throw new Error(`${app.id}: expected build output at ${out}`);
  }
  cpSync(out, join(dist, app.id), { recursive: true });
}

console.log(`\n✓ playground assembled in ${dist}`);
