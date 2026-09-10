// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

// The Astro config runs before `import.meta.env` exists, so read the shared
// .env at the repo root directly. Resolved from this file, not the working
// directory, so it holds wherever the build is started from.
const env = loadEnv(
	process.env.NODE_ENV ?? 'production',
	fileURLToPath(new URL('..', import.meta.url)),
	'PUBLIC_',
);

// The gallery is the playground's shell. Each app under apps/<id>/ is an
// independent project built separately and copied into dist/<id>/ by
// scripts/build-all.ts.
export default defineConfig({
	// Link previews and canonical tags both need an absolute URL.
	site: env.PUBLIC_SITE_URL || undefined,
	integrations: [icon()],
	vite: {
		// One .env at the repo root serves the whole playground.
		envDir: '..',
		// apps.json lives at the repo root, outside the gallery's Vite root.
		server: { fs: { allow: ['..'] } },
	},
});
