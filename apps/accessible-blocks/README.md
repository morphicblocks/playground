<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Accessible Blocks

The same program as symbols, plain words or Java, with settings for text size, a dark theme, high contrast, a font for dyslexia and explanations on every block.

![Preact](https://img.shields.io/badge/Preact-673AB8?logo=preact&logoColor=white) ![esbuild](https://img.shields.io/badge/esbuild-FFCF00?logo=esbuild&logoColor=000000) ![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)

| | |
|---|---|
| **Use case** | Accessibility |
| **Stack** | Preact · esbuild · Bun |
| **Styling** | Bootstrap |
| **Views** | Blocks, Preview |
| **Code shown** | Java, Plain words |

## Run

```sh
bun install
bun run dev
```

`bun run build` writes a static site to `dist/`.

## Deploy

The build is plain static files, so any static host can serve `dist/`. With Docker:

```sh
bun run build
docker run --rm -p 8080:80 -v "$PWD/dist":/usr/share/nginx/html:ro nginx:alpine
```

Then open http://localhost:8080.
<!-- /generated:top -->

The toolbar switches what the blocks say (a mode per level); the settings panel changes only how they look. Both are remembered in the browser.

## Where to look

- `src/definitions.json`: the symbols, words and Java elements, the six presets and the per mode dropdown `display` maps
- `src/App.tsx`: mounting the engine and applying a level or a look setting
- `src/modes/`: one stylesheet per mode, handed to the engine as text
- `scripts/build.ts`: the esbuild build, which loads mode stylesheets as text

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
