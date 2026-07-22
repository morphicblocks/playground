// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// The gallery is the playground's shell. Each app under apps/<id>/ is an
// independent project built separately and copied into dist/<id>/ by
// scripts/build-all.ts.
export default defineConfig({
	integrations: [icon()],
	vite: {
		// One .env at the repo root serves the whole playground.
		envDir: '..',
		// apps.json lives at the repo root, outside the gallery's Vite root.
		server: { fs: { allow: ['..'] } },
	},
});
