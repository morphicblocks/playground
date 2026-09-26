#!/usr/bin/env bun
/**
 * `bun run readmes`: write the generated parts of every app README from
 * apps.json, so all READMEs share one layout. `--check` only compares and
 * fails when a README is out of date (the check script runs it).
 *
 * A README has two generated parts, each between hidden markers: the top
 * (title, description, badges, table, run commands) and the license at the
 * end. Everything between them is written by hand, e.g. "Where to look".
 * A README without markers is created with a placeholder for that part.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUNDLERS,
  PACKAGE_MANAGERS,
  STYLING,
  VIEWS,
  frameworkOrLanguage,
  validateManifest,
  type PlaygroundApp,
} from './manifest';

const root = fileURLToPath(new URL('..', import.meta.url));
const checkOnly = process.argv.includes('--check');

const TOP_START = '<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->';
const TOP_END = '<!-- /generated:top -->';
const LICENSE_START = '<!-- generated:license -->';
const LICENSE_END = '<!-- /generated:license -->';

// Official brand colors for the badges, keyed by simple-icons slug.
const BADGE_COLORS: Record<string, { color: string; logoColor?: string }> = {
  react: { color: '20232A', logoColor: '61DAFB' },
  vuedotjs: { color: '4FC08D' },
  svelte: { color: 'FF3E00' },
  solid: { color: '2C4F7C' },
  angular: { color: 'DD0031' },
  preact: { color: '673AB8' },
  lit: { color: '324FFF' },
  nextdotjs: { color: '000000' },
  astro: { color: 'BC52EE' },
  vite: { color: '646CFF' },
  bun: { color: '000000' },
  esbuild: { color: 'FFCF00', logoColor: '000000' },
  webpack: { color: '8DD6F9', logoColor: '000000' },
  npm: { color: 'CB3837' },
  pnpm: { color: 'F69220' },
  yarn: { color: '2C8EBB' },
  deno: { color: '000000' },
  typescript: { color: '3178C6' },
  javascript: { color: 'F7DF1E', logoColor: '000000' },
};

function badge(term: { label: string; icon?: string }): string {
  const slug = term.icon?.replace('simple-icons:', '');
  const colors = (slug && BADGE_COLORS[slug]) || { color: '555555' };
  const label = encodeURIComponent(term.label.replace(/-/g, '--'));
  const logo = slug ? `?logo=${slug}&logoColor=${colors.logoColor ?? 'white'}` : '';
  return `![${term.label}](https://img.shields.io/badge/${label}-${colors.color}${logo})`;
}

const COMMANDS: Record<PlaygroundApp['packageManager'], [install: string, dev: string, build: string]> = {
  npm: ['npm install', 'npm run dev', 'npm run build'],
  pnpm: ['pnpm install', 'pnpm dev', 'pnpm build'],
  yarn: ['yarn install', 'yarn dev', 'yarn build'],
  bun: ['bun install', 'bun run dev', 'bun run build'],
  deno: ['deno install', 'deno task dev', 'deno task build'],
};

function top(app: PlaygroundApp): string {
  const stack = [
    frameworkOrLanguage(app),
    BUNDLERS[app.bundler],
    PACKAGE_MANAGERS[app.packageManager],
  ].filter((term, index, all): term is { label: string; icon?: string } =>
    !!term && all.findIndex((other) => other?.label === term.label) === index,
  );
  const [install, dev, build] = COMMANDS[app.packageManager];
  return [
    TOP_START,
    `# ${app.name}`,
    '',
    app.description,
    '',
    stack.map(badge).join(' '),
    '',
    '| | |',
    '|---|---|',
    `| **Use case** | ${app.useCase} |`,
    `| **Stack** | ${[frameworkOrLanguage(app), BUNDLERS[app.bundler], PACKAGE_MANAGERS[app.packageManager]].map((t) => t.label).join(' · ')} |`,
    `| **Styling** | ${STYLING[app.styling].label} |`,
    `| **Views** | ${app.views.map((view) => VIEWS[view].label).join(', ')} |`,
    `| **Code shown** | ${app.codeShown.join(', ')} |`,
    '',
    '## Run',
    '',
    '```sh',
    install,
    dev,
    '```',
    '',
    `\`${build}\` writes a static site to \`${app.outDir ?? 'dist'}/\`.`,
    TOP_END,
  ].join('\n');
}

const LICENSE = [
  LICENSE_START,
  '## License',
  '',
  'MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).',
  LICENSE_END,
].join('\n');

/** The README with its generated parts rewritten; hand written text is kept. */
function render(app: PlaygroundApp, current: string | undefined): string {
  let handWritten = '## Where to look\n\n- `src/…`: TODO, the files worth opening first';
  if (current !== undefined) {
    const start = current.indexOf(TOP_END);
    const end = current.indexOf(LICENSE_START);
    if (start === -1 || end === -1 || end < start) {
      throw new Error(`apps/${app.id}/README.md: the generated markers are missing or out of order`);
    }
    handWritten = current.slice(start + TOP_END.length, end).trim();
  }
  return `${top(app)}\n\n${handWritten}\n\n${LICENSE}\n`;
}

const apps = validateManifest(JSON.parse(readFileSync(join(root, 'apps.json'), 'utf8')));
const outdated: string[] = [];
for (const app of apps) {
  const file = join(root, 'apps', app.id, 'README.md');
  const current = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
  const next = render(app, current);
  if (next === current) continue;
  if (checkOnly) outdated.push(`apps/${app.id}/README.md`);
  else {
    writeFileSync(file, next);
    console.log(`▸ wrote apps/${app.id}/README.md`);
  }
}

if (checkOnly && outdated.length > 0) {
  console.error(`✗ out of date, run \`bun run readmes\`:\n  ${outdated.join('\n  ')}`);
  process.exit(1);
}
