import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // Relative paths, so the build works at any address: standalone or under
  // a subpath such as /level-up/.
  base: "./",
  // Blockly alone is about 800 kB, so one bundle of about 900 kB (250 kB
  // compressed) is expected.
  build: { chunkSizeWarningLimit: 1100 },
});
