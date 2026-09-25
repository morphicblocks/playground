#!/usr/bin/env bun
/**
 * Builds the playground into a single deployable `dist/`:
 *
 *   dist/            ← the gallery (Astro)
 *   dist/<id>/       ← each app's own build output
 *
 * Each app under apps/<id>/ is an independent project with its own toolchain.
 * Its package manager comes from its apps.json entry; the output directory is
 * `dist` unless the entry overrides it.
 *
 * Set ONLY=<id> to build a single app while iterating locally.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifest, type PlaygroundApp } from './manifest';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const only = process.env.ONLY;

// Checked first, so a typo in apps.json stops the build before anything runs.
const apps = validateManifest(JSON.parse(readFileSync(join(root, 'apps.json'), 'utf8')));

/** How each package manager installs and runs the build, and its lockfile. */
const PACKAGE_MANAGER_COMMANDS: Record<PlaygroundApp['packageManager'], { install: string[]; build: string[]; lockfile: string }> = {
  npm: { install: ['npm', 'install'], build: ['npm', 'run', 'build'], lockfile: 'package-lock.json' },
  pnpm: { install: ['pnpm', 'install'], build: ['pnpm', 'run', 'build'], lockfile: 'pnpm-lock.yaml' },
  yarn: { install: ['yarn', 'install'], build: ['yarn', 'run', 'build'], lockfile: 'yarn.lock' },
  bun: { install: ['bun', 'install'], build: ['bun', 'run', 'build'], lockfile: 'bun.lock' },
  deno: { install: ['deno', 'install'], build: ['deno', 'task', 'build'], lockfile: 'deno.lock' },
};

function run(cmd: string[], cwd: string, env?: Record<string, string>) {
  const { exitCode } = Bun.spawnSync(cmd, {
    cwd,
    env: { ...process.env, ...env },
    stdout: 'inherit',
    stderr: 'inherit',
  });
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

  // Each app commits its lockfile, so a missing one means apps.json names
  // the wrong package manager.
  const pm = PACKAGE_MANAGER_COMMANDS[app.packageManager];
  if (!existsSync(join(dir, pm.lockfile))) {
    throw new Error(`${app.id}: apps.json says ${app.packageManager}, but apps/${app.id}/${pm.lockfile} is missing`);
  }
  console.log(`▸ building ${app.id} (${app.packageManager})`);
  run(pm.install, dir);
  // The subpath the app is served under here. Apps know nothing about the
  // playground: it is a plain hosting setting, and standalone builds leave it
  // unset and serve from /.
  run(pm.build, dir, { BASE_PATH: `/${app.id}` });

  const out = join(dir, app.outDir ?? 'dist');
  if (!existsSync(out)) {
    throw new Error(`${app.id}: expected build output at ${out}`);
  }
  cpSync(out, join(dist, app.id), { recursive: true });
}

console.log(`\n✓ playground assembled in ${dist}`);
