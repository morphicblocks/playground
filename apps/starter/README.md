<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Get Started

The place to get familiar with Morphic Blocks: choose what the toolbox tiles show, and turn each of two views into blocks, text or a preview in pseudocode, JavaScript or Python.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

| | |
|---|---|
| **Use case** | Starting point |
| **Stack** | TypeScript · Vite · npm |
| **Styling** | Plain CSS |
| **Views** | Blocks, Text editor, Preview |
| **Code shown** | JavaScript, Python, Pseudocode |

## Run

```sh
npm install
npm run dev
```

`npm run build` writes a static site to `dist/`.

## Deploy

The build is plain static files, so any static host can serve `dist/`. With Docker:

```sh
npm run build
docker run --rm -p 8080:80 -v "$PWD/dist":/usr/share/nginx/html:ro nginx:alpine
```

Then open http://localhost:8080.
<!-- /generated:top -->

Each of the eleven blocks has six elements: a title, an icon, a one sentence hint and its code in pseudocode, JavaScript and Python. The tiles mode decides what the toolbox shows, and the checkboxes change it while the app runs. Each of the two views picks a kind (blocks, text or preview) and a language, which is a mode of its own: `in-pseudocode`, `in-javascript` or `in-python`.

## Where to look

- `src/main.ts`: the whole setup: one `mount()` call, the Run button and the three themes (page colors in `src/style.css`, text view colors as editor themes).
- `src/explorer.ts`: the tile shaped element picker, the block definition shown when hovering over a tile (only the ticked elements), and the two switchable views (`setModeElements`, `addView`, `setModes`). Leave it out in an app of your own.
- `src/definitions.json`: the elements of each block, the four modes, the preset and the settings for each language (highlighting, `pass` for Python, how Python prints values).
- `src/behaviors.ts`: short functions that turn each block into runnable JavaScript.
- `src/program.json`: the program the workspace starts with.
- `src/modes/`: one CSS file per mode, named after it.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
