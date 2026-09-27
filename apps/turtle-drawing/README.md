<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Turtle Drawing

Picture blocks with no words steer a turtle that draws on a big canvas, so even children who cannot read yet can program a drawing.

![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?logo=yarn&logoColor=white)

| | |
|---|---|
| **Use case** | Blocks that drive a drawing |
| **Stack** | Svelte · Vite · Yarn |
| **Styling** | Tailwind |
| **Views** | Blocks, Preview |
| **Code shown** | Logo (turtle) |

## Run

```sh
yarn install
yarn dev
```

`yarn build` writes a static site to `dist/`.

## Deploy

The build is plain static files, so any static host can serve `dist/`. With Docker:

```sh
yarn build
docker run --rm -p 8080:80 -v "$PWD/dist":/usr/share/nginx/html:ro nginx:alpine
```

Then open http://localhost:8080.
<!-- /generated:top -->

The blocks show only pictures and numbers, so children who cannot read yet can still build a program. Behind the scenes the app turns the program into JavaScript, runs it with its own turtle, and plays the turtle's moves back on the canvas. Children never see code; a small `</>` button shows parents and teachers the same program in Logo, in a read only preview view.

## Where to look

- `src/definitions.json`: the five blocks, each with a toolbox icon, a picture template for the workspace and a Logo template for the preview.
- `src/behaviors.ts`: one line of hidden JavaScript per block, calling the turtle, and the pen block's dropdown of color boxes.
- `src/turtle.ts`: the turtle that records its moves, the loop guard, and why the app runs the code itself instead of `engine.runJavaScript()`.
- `src/App.svelte`: the mount call with the Logo preview, the floating panels, the step by step playback, and dragging and zooming the drawing.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
