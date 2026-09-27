/**
 * Colors that make the gallery look like a box of blocks: every app gets a
 * block color, in the order of apps.json, and tech stack logos show in their
 * brand colors.
 */

/** Block colors, deep enough for white text in both themes. */
const BLOCK_COLORS = ['#3b82d6', '#e07b4f', '#7fb35a', '#c257b8', '#d4a72c', '#3fa9e0'];

export const blockColor = (index: number) => BLOCK_COLORS[index % BLOCK_COLORS.length];

/**
 * Brand colors of the tech stack logos, keyed by icon name. Logos whose brand
 * color is black or white (Next.js, Bun, Deno, ...) are left out and follow
 * the text color, so they stay visible in both themes.
 */
const ICON_COLORS: Record<string, string> = {
	'simple-icons:react': '#61dafb',
	'simple-icons:vuedotjs': '#42b883',
	'simple-icons:svelte': '#ff3e00',
	'simple-icons:solid': '#4f88c6',
	'simple-icons:angular': '#dd0031',
	'simple-icons:preact': '#8f5cf6',
	'simple-icons:lit': '#4d64ff',
	'simple-icons:astro': '#bc52ee',
	'simple-icons:typescript': '#3178c6',
	'simple-icons:javascript': '#e8c400',
	'simple-icons:vite': '#9467ff',
	'simple-icons:esbuild': '#ffcf00',
	'simple-icons:webpack': '#5aa7d8',
	'simple-icons:npm': '#cb3837',
	'simple-icons:pnpm': '#f69220',
	'simple-icons:yarn': '#2c8ebb',
	'simple-icons:css': '#663399',
	'simple-icons:sass': '#cc6699',
	'simple-icons:tailwindcss': '#06b6d4',
	'simple-icons:bootstrap': '#7952b3',
	'simple-icons:cssmodules': '#5aa7d8',
};

export const iconColor = (icon?: string) => (icon ? ICON_COLORS[icon] : undefined);

/**
 * Logos that have a colorful original, used instead of the one color version.
 * They look the same in both themes, so they need no brand color above.
 */
const COLORFUL_ICONS: Record<string, string> = {
	'simple-icons:bun': 'logos:bun',
};

export const displayIcon = (icon: string) => COLORFUL_ICONS[icon] ?? icon;
