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

/** Only for apps without a framework; a framework already implies its setup. */
export const LANGUAGES = {
  typescript: { label: 'TypeScript', icon: 'simple-icons:typescript' },
  javascript: { label: 'JavaScript', icon: 'simple-icons:javascript' },
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
  /** Required when `framework` is "none", and only then. */
  language?: keyof typeof LANGUAGES;
  bundler: keyof typeof BUNDLERS;
  packageManager: keyof typeof PACKAGE_MANAGERS;
  styling: keyof typeof STYLING;
  /** What is on screen. */
  views: (keyof typeof VIEWS)[];
  /** The languages the blocks turn into, e.g. ["Python"]. */
  codeShown: string[];
  difficulty: keyof typeof DIFFICULTIES;
  /** Card image; when null the card falls back to a titled box. */
  preview: string | null;
  /** Build output directory, only set when the toolchain differs from `dist`. */
  outDir?: string;
}

const TERMS: Partial<Record<keyof PlaygroundApp, Record<string, Term>>> = {
  framework: FRAMEWORKS,
  bundler: BUNDLERS,
  packageManager: PACKAGE_MANAGERS,
  styling: STYLING,
  difficulty: DIFFICULTIES,
};
const TEXT_FIELDS = ['id', 'name', 'description', 'details', 'useCase'] as const;
const KNOWN_FIELDS = new Set<string>([
  ...TEXT_FIELDS, ...Object.keys(TERMS), 'language', 'views', 'codeShown', 'preview', 'outDir',
]);

/** The framework, or for apps without one, the language they are written in. */
export function frameworkOrLanguage(app: PlaygroundApp): Term {
  return app.framework === 'none' && app.language ? LANGUAGES[app.language] : FRAMEWORKS[app.framework];
}

/**
 * Check the parsed apps.json and return its apps. Throws one error listing
 * every problem, so a typo stops the build instead of showing a broken card.
 */
export function validateManifest(data: unknown): PlaygroundApp[] {
  const problems: string[] = [];
  const list = (data as { apps?: unknown })?.apps;
  if (!Array.isArray(list)) throw new Error('apps.json: "apps" must be a list.');

  const seen = new Set<string>();
  list.forEach((entry: Record<string, unknown>, index) => {
    const at = `apps[${index}]${typeof entry?.id === 'string' ? ` (${entry.id})` : ''}`;
    const oneOf = (field: string, allowed: Record<string, Term>, value: unknown) => {
      if (typeof value !== 'string' || !Object.hasOwn(allowed, value)) {
        problems.push(`${at}: "${field}" must be one of ${Object.keys(allowed).join(', ')}.`);
      }
    };

    for (const key of Object.keys(entry ?? {})) {
      if (!KNOWN_FIELDS.has(key)) problems.push(`${at}: unknown field "${key}".`);
    }
    for (const field of TEXT_FIELDS) {
      if (typeof entry?.[field] !== 'string' || !(entry[field] as string).trim()) {
        problems.push(`${at}: "${field}" is required.`);
      }
    }
    if (typeof entry?.id === 'string') {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.id)) {
        problems.push(`${at}: "id" may only use lowercase letters, digits and single hyphens.`);
      }
      if (seen.has(entry.id)) problems.push(`${at}: "id" is used twice.`);
      seen.add(entry.id);
    }
    for (const [field, allowed] of Object.entries(TERMS)) oneOf(field, allowed, entry?.[field]);
    if (entry?.framework === 'none') oneOf('language', LANGUAGES, entry?.language);
    else if (entry?.language !== undefined) {
      problems.push(`${at}: "language" is only for apps without a framework.`);
    }

    const views = entry?.views;
    if (!Array.isArray(views) || views.length === 0) {
      problems.push(`${at}: "views" must list at least one of ${Object.keys(VIEWS).join(', ')}.`);
    } else {
      views.forEach((view) => oneOf('views', VIEWS, view));
    }
    const code = entry?.codeShown;
    if (!Array.isArray(code) || code.length === 0 || code.some((c) => typeof c !== 'string' || !c.trim())) {
      problems.push(`${at}: "codeShown" must list at least one language.`);
    }
    if (entry?.preview !== null && typeof entry?.preview !== 'string') {
      problems.push(`${at}: "preview" must be a path or null.`);
    }
    if (entry?.outDir !== undefined && typeof entry.outDir !== 'string') {
      problems.push(`${at}: "outDir" must be a folder name.`);
    }
  });

  if (problems.length > 0) {
    throw new Error(`apps.json has ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  }
  return list as PlaygroundApp[];
}
