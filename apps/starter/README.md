<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Get Started

The smallest setup that still shows what Morphic Blocks is made of: elements, modes and views, with one mount call and five short behaviors.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

| | |
|---|---|
| **Use case** | Starting point |
| **Stack** | TypeScript · Vite · npm |
| **Styling** | Plain CSS |
| **Views** | Blocks, Text editor |
| **Code shown** | JavaScript |

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

Each of the five blocks (print, text, number, math, repeat) has five elements: a title, an icon, a one sentence hint, pseudocode and JavaScript. Two modes pick from them: the blocks mode serves the toolbox (title, icon, block and hint) and the workspace, which draws only the mode's first code element, the pseudocode; the javascript mode fills the code view. The ⓘ button next to each pane names the mode it shows.

## Where to look

- `src/definitions.json`: the elements of each block, the three modes, the preset that assigns them to the views and the syntax highlighting for the JavaScript.
- `src/main.ts`: the single `mount()` call, the light code view theme and the Run button.
- `src/behaviors.ts`: five short functions that turn each block into runnable JavaScript.
- `src/modes/`: one CSS file per mode, named after it.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
