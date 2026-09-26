import { defineConfig } from "vite";

export default defineConfig({
  // Relative paths, so the build works at any address: standalone or under
  // a subpath such as /starter/.
  base: "./",
  // Blockly alone is about 800 kB (210 kB compressed), which is expected.
  build: { chunkSizeWarningLimit: 1000 },
});
