<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Level Up

One language, Python, at every level: the toolbox grows from print and values to variables, decisions, loops and functions, and Run shows what the program prints.

![Solid](https://img.shields.io/badge/Solid-2C4F7C?logo=solid&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)

| | |
|---|---|
| **Use case** | Learning in levels |
| **Stack** | Solid · Vite · Bun |
| **Styling** | Plain CSS |
| **Views** | Blocks |
| **Code shown** | Python |

## Run

```sh
bun install
bun run dev
```

`bun run build` writes a static site to `dist/`.
<!-- /generated:top -->

One language, Python, at every level. What changes from level to level is how much of Python the toolbox offers: output first, then variables and math, decisions, loops and finally functions. Going back down a level takes away the blocks that level does not have yet, after asking once.

## Where to look

- `src/App.tsx`: the level bar, the toolbox mounted again with each level's blocks, and the question before a lower level removes blocks
- `src/definitions.json`: the eighteen blocks in Python syntax; their category decides the level that brings them
- `src/behaviors.ts`: each block as JavaScript that does what its Python does (range, True and False, 10 / 2 printing 5.0, Python's error names) with a loop guard at 1,000 rounds
- `src/modes/py.css`: the one mode, Python on the block with a short hint under each toolbox tile

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
