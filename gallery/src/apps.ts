// The manifest lives at the repo root so it can also drive scripts/build-all.ts.
// Imported statically so Vite inlines it at build time (no runtime fs access,
// which breaks once the module is bundled into Astro's prerender output).
import data from '../../apps.json';
import type { PlaygroundApp } from '../../scripts/manifest';

export type { PlaygroundApp };

export const apps: PlaygroundApp[] = data.apps as PlaygroundApp[];
