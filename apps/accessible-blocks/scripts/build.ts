/**
 * Builds the app into dist/ with esbuild: `bun run build`.
 * `bun run dev` serves it on http://localhost:8000 and rebuilds on changes.
 *
 * Everything the page loads sits next to index.html and is linked with a
 * relative path, so dist/ works at / and under any subpath.
 */
import { cpSync, rmSync } from "node:fs";
import * as esbuild from "esbuild";

const serve = process.argv.includes("--serve");

// Mode stylesheets are handed to the engine as text (`modeStyles`), which
// then adds them to the page itself; every other stylesheet is bundled.
const modeCssAsText: esbuild.Plugin = {
  name: "mode-css-as-text",
  setup(build) {
    build.onLoad({ filter: /[\\/]modes[\\/][^\\/]+\.css$/ }, async (args) => ({
      contents: await Bun.file(args.path).text(),
      loader: "text",
    }));
  },
};

rmSync("dist", { recursive: true, force: true });
cpSync("public", "dist", { recursive: true });

const options: esbuild.BuildOptions = {
  entryPoints: ["src/main.tsx"],
  entryNames: "app",
  outdir: "dist",
  bundle: true,
  format: "esm",
  // Keeps the lazily loaded code editor in its own file.
  splitting: true,
  chunkNames: "chunks/[name]-[hash]",
  assetNames: "assets/[name]-[hash]",
  loader: { ".woff": "file", ".woff2": "file" },
  jsx: "automatic",
  jsxImportSource: "preact",
  target: "es2022",
  minify: !serve,
  sourcemap: serve,
  plugins: [modeCssAsText],
};

if (serve) {
  const context = await esbuild.context(options);
  await context.watch();
  const { port } = await context.serve({ servedir: "dist", port: 8000 });
  console.log(`Serving on http://localhost:${port}`);
} else {
  await esbuild.build(options);
}
