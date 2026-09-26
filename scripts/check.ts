#!/usr/bin/env bun
/**
 * Run before pushing: `bun run check`.
 *
 * 1. Checks that every app README matches apps.json, then builds everything,
 *    which also validates apps.json.
 * 2. Serves the result locally and opens the gallery and every app in
 *    headless Chrome, moving the pointer the way a visitor would (Blockly
 *    loads its sounds on the first pointer move).
 * 3. Fails if any page requests a file from another server. Neither the apps
 *    nor the gallery may send visitors' browsers anywhere else.
 *
 * Uses the installed Chrome; set CHROME_PATH if it is not found.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { validateManifest } from './manifest';
import { serveDist } from './serve';

const root = fileURLToPath(new URL('..', import.meta.url));

// 1. READMEs, then the build
const readmes = Bun.spawnSync(['bun', 'run', 'scripts/readmes.ts', '--check'], { cwd: root, stdout: 'inherit', stderr: 'inherit' });
if (readmes.exitCode !== 0) process.exit(readmes.exitCode ?? 1);
const build = Bun.spawnSync(['bun', 'run', 'build'], { cwd: root, stdout: 'inherit', stderr: 'inherit' });
if (build.exitCode !== 0) process.exit(build.exitCode ?? 1);
const apps = validateManifest(await Bun.file(join(root, 'apps.json')).json());

// 2. Serve dist/ the way nginx does.
const server = serveDist();
const origin = `http://localhost:${server.port}`;

function findChrome(): string {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to its executable.');
  return found;
}

// 3. Visit every page and record requests that leave localhost.
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
const problems: string[] = [];
try {
  for (const path of ['/', ...apps.map((app) => `/${app.id}/`)]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const external = new Set<string>();
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && url.hostname !== 'localhost') external.add(request.url());
    });
    const response = await page.goto(origin + path, { waitUntil: 'networkidle0', timeout: 30_000 });
    if (!response?.ok()) problems.push(`${path} did not load (${response?.status() ?? 'no response'}).`);
    for (let step = 0; step < 10; step++) await page.mouse.move(200 + step * 60, 200 + step * 40);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    for (const url of external) problems.push(`${path} requested ${url}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.stop();
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`\n✓ checked ${apps.length + 1} page(s): no external requests`);
