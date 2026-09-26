<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Starter

The smallest setup that still shows what Morphic Blocks is made of: elements, modes and views, with one mount call and five short behaviors.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

| | |
|---|---|
| **Use case** | Starting point |
| **Stack** | TypeScript · Vite · npm |
| **Styling** | Plain CSS |
| **Views** | Blocks, Text editor |
| **Code shown** | JavaScript |
| **Difficulty** | Beginner |

## Run

```sh
npm install
npm run dev
```

`npm run build` writes a static site to `dist/`.
<!-- /generated:top -->

Each of the five blocks (print, text, number, math, repeat) has five elements: a title, an icon, a one sentence hint, pseudocode and JavaScript. Three modes pick from them, one per view: the toolbox shows title, icon, block and hint; the workspace shows the pseudocode; the code view shows the JavaScript. The ⓘ button next to each pane names the mode it shows.

## Where to look

- `src/definitions.json`: the elements of each block, the three modes, the preset that assigns them to the views and the syntax highlighting for the JavaScript.
- `src/main.ts`: the single `mount()` call, the light code view theme and the Run button.
- `src/behaviors.ts`: five short functions that turn each block into runnable JavaScript.
- `src/modes/`: one CSS file per mode, named after it.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
