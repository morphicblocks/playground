<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Embed Anywhere

A friendly tutorial article about loops with three small block editors placed between its paragraphs, each one the same reusable web component with a live Python preview and a Run button.

![Lit](https://img.shields.io/badge/Lit-324FFF?logo=lit&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)

| | |
|---|---|
| **Use case** | Embedding in any page |
| **Stack** | Lit · Vite · pnpm |
| **Styling** | Plain CSS |
| **Views** | Blocks, Preview |
| **Code shown** | Python |

## Run

```sh
pnpm install
pnpm dev
```

`pnpm build` writes a static site to `dist/`.
<!-- /generated:top -->

## Where to look

- `src/morphic-editor.ts`: the web component; every instance runs its own engine
- `index.html`: the article, with the editors configured by attributes
- `src/definitions.json`: the blocks, in plain words and in Python
- `src/behaviors.ts`: the same blocks as JavaScript for Run, with Python's meaning

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
