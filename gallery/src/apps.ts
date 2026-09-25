// The manifest lives at the repo root so it can also drive scripts/build-all.ts.
// Imported statically so Vite inlines it at build time (no runtime fs access,
// which breaks once the module is bundled into Astro's prerender output).
import data from '../../apps.json';
import { validateManifest, type PlaygroundApp } from '../../scripts/manifest';

export type { PlaygroundApp };

// Checked here too, so a typo also stops the gallery's dev server.
export const apps: PlaygroundApp[] = validateManifest(data);
