/**
 * The shape of apps.json, shared by scripts/build-all.ts and the gallery.
 *
 * Tech and layout fields take one of the keys below, so a typo is caught and
 * each value has one label (and, where one exists, a simple-icons logo) for
 * the cards and the table. Adding a tool means adding it here. Descriptive
 * fields (`useCase`, `codeShown`) are free text.
 */

interface Term {
  label: string;
  /** simple-icons slug; terms without one render as a text pill. */
  icon?: string;
}

export const FRAMEWORKS = {
  none: { label: 'No framework' },
  react: { label: 'React', icon: 'simple-icons:react' },
  vue: { label: 'Vue', icon: 'simple-icons:vuedotjs' },
  svelte: { label: 'Svelte', icon: 'simple-icons:svelte' },
  solid: { label: 'Solid', icon: 'simple-icons:solid' },
  angular: { label: 'Angular', icon: 'simple-icons:angular' },
  preact: { label: 'Preact', icon: 'simple-icons:preact' },
  lit: { label: 'Lit', icon: 'simple-icons:lit' },
  next: { label: 'Next.js', icon: 'simple-icons:nextdotjs' },
  astro: { label: 'Astro', icon: 'simple-icons:astro' },
} satisfies Record<string, Term>;

export const BUNDLERS = {
  vite: { label: 'Vite', icon: 'simple-icons:vite' },
  parcel: { label: 'Parcel' },
  bun: { label: 'Bun', icon: 'simple-icons:bun' },
  esbuild: { label: 'esbuild', icon: 'simple-icons:esbuild' },
  webpack: { label: 'webpack', icon: 'simple-icons:webpack' },
  rsbuild: { label: 'Rsbuild' },
  next: { label: 'Next.js', icon: 'simple-icons:nextdotjs' },
  astro: { label: 'Astro', icon: 'simple-icons:astro' },
} satisfies Record<string, Term>;

export const PACKAGE_MANAGERS = {
  npm: { label: 'npm', icon: 'simple-icons:npm' },
  pnpm: { label: 'pnpm', icon: 'simple-icons:pnpm' },
  yarn: { label: 'Yarn', icon: 'simple-icons:yarn' },
  bun: { label: 'Bun', icon: 'simple-icons:bun' },
  deno: { label: 'Deno', icon: 'simple-icons:deno' },
} satisfies Record<string, Term>;

export const STYLING = {
  css: { label: 'Plain CSS', icon: 'simple-icons:css' },
  'css-modules': { label: 'CSS modules', icon: 'simple-icons:cssmodules' },
  scoped: { label: 'Scoped styles' },
  tailwind: { label: 'Tailwind', icon: 'simple-icons:tailwindcss' },
  sass: { label: 'Sass', icon: 'simple-icons:sass' },
} satisfies Record<string, Term>;

export const VIEWS = {
  blocks: { label: 'Blocks' },
  text: { label: 'Text editor' },
  preview: { label: 'Preview' },
} satisfies Record<string, Term>;

export const SETUPS = {
  config: { label: 'Config only' },
  'config-and-code': { label: 'Config + code' },
} satisfies Record<string, Term>;

export const DIFFICULTIES = {
  beginner: { label: 'Beginner' },
  intermediate: { label: 'Intermediate' },
  advanced: { label: 'Advanced' },
} satisfies Record<string, Term>;

export interface PlaygroundApp {
  /** Immutable: folder name under apps/, URL segment, and link key. */
  id: string;
  /** Display title, free to change without breaking URLs. */
  name: string;
  /** One or two sentences on the card. */
  description: string;
  /** The longer explanation behind the card's "More" toggle. */
  details: string;
  /** What the app demonstrates, e.g. "Block to text transition". */
  useCase: string;
  framework: keyof typeof FRAMEWORKS;
  bundler: keyof typeof BUNDLERS;
  packageManager: keyof typeof PACKAGE_MANAGERS;
  styling: keyof typeof STYLING;
  /** What is on screen. */
  views: (keyof typeof VIEWS)[];
  /** The languages the blocks turn into, e.g. ["Python"]. */
  codeShown: string[];
  /** Whether the app needs code beyond definitions and CSS. */
  setup: keyof typeof SETUPS;
  difficulty: keyof typeof DIFFICULTIES;
  /** Card image; when null the card falls back to a titled box. */
  preview: string | null;
  /** Build output directory, only set when the toolchain differs from `dist`. */
  outDir?: string;
}
