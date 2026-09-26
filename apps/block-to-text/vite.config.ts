import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative paths, so the build works at any address: standalone or under
  // a subpath such as /block-to-text/.
  base: "./",
  // Blockly alone is about 800 kB and React adds its share, so one bundle of
  // about 1 MB (280 kB compressed) is expected.
  build: { chunkSizeWarningLimit: 1100 },
});
