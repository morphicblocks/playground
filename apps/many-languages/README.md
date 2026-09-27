<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Many Languages

The same twelve blocks speak English, Deutsch, Español, Ελληνικά, 中文 and العربية: pick a language and the blocks, the toolbox and the pseudocode change while the program stays.

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

| | |
|---|---|
| **Use case** | Localization and right to left |
| **Stack** | Next.js · Next.js · npm |
| **Styling** | SCSS |
| **Views** | Blocks, Preview |
| **Code shown** | Pseudocode in 6 languages |

## Run

```sh
npm install
npm run dev
```

`npm run build` writes a static site to `out/`.

## Deploy

The build is plain static files, so any static host can serve `out/`. With Docker:

```sh
npm run build
docker run --rm -p 8080:80 -v "$PWD/out":/usr/share/nginx/html:ro nginx:alpine
```

Then open http://localhost:8080.
<!-- /generated:top -->

The same twelve blocks speak six languages. Each language is two modes: one for the blocks and toolbox tiles, one for its pseudocode, joined by a preset. Switching between left to right languages applies a preset; switching into or out of Arabic mounts the engine again with Blockly's `rtl` option and carries the program over with `serializeWorkspace()` and `loadWorkspace()`.

## Where to look

- `src/editor/definitions.json`: every block with a title, block text and pseudocode per language, two modes and one preset per language, and dropdown options whose shown words differ per language through `display`.
- `src/editor/Editor.tsx`: the `mount()` call, the language switch and the remount for right to left.
- `src/editor/languages.ts`: the words of the page around the blocks, per language.
- `public/modes/`: one stylesheet per language that picks a system font for its script.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
