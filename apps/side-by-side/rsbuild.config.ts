import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";

export default defineConfig({
  plugins: [pluginVue()],
  html: { template: "./index.html" },
  server: { port: 4804 },
  output: {
    // Relative paths, so the build works at any address: standalone or under
    // a subpath such as /side-by-side/.
    assetPrefix: "./",
  },
});
