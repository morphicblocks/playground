// The manifest lives at the repo root so it can also drive scripts/build-all.ts.
// Imported statically so Vite inlines it at build time (no runtime fs access,
// which breaks once the module is bundled into Astro's prerender output).
import data from '../../apps.json';

export interface PlaygroundApp {
  /** Immutable: folder name under apps/, URL segment, and link key. */
  id: string;
  /** Display title — free to change without breaking URLs. */
  name: string;
  description: string;
  /** simple-icons slugs; rendered as logos. First entry is the primary tech. */
  stack: string[];
  level: string;
  scope: string;
  /** Card image; when null the card falls back to a titled box. */
  preview: string | null;
  /** Build output directory — only set when the toolchain differs from `dist`. */
  outDir?: string;
  status: 'planned' | 'ready';
}

export const apps: PlaygroundApp[] = data.apps as PlaygroundApp[];
