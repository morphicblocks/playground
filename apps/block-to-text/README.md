<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Block to Text

One Python program moves step by step from plain word blocks to Python blocks to Python text, and Run shows what it prints.

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)

| | |
|---|---|
| **Use case** | Block to text transition |
| **Stack** | React · Vite · Bun |
| **Styling** | CSS modules |
| **Views** | Blocks, Text editor |
| **Code shown** | Python |

## Run

```sh
bun install
bun run dev
```

`bun run build` writes a static site to `dist/`.
<!-- /generated:top -->

## Where to look

- `src/definitions.json`: the blocks, the two modes (plain words and Python) and the three presets that make the steps
- `src/behaviors.ts`: each block as JavaScript that does what its Python does, so Run prints what the Python would print
- `src/App.tsx`: creates both engines in an effect, copies the program into the read only mirror after every change, runs the program and lays out the panes from `onPresetApplied`
- `src/program.json`: the starting program, in Blockly's own save format

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
