import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  // Relative paths, so the build works at any address: standalone or under
  // a subpath such as /turtle-drawing/.
  base: "./",
  // Blockly alone is about 800 kB (210 kB compressed), which is expected.
  build: { chunkSizeWarningLimit: 1000 },
});
