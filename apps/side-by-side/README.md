<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Side by Side

Programs are built entirely in text, with no blocks on screen, and the same program can be read side by side in Go, C++, Java, Python and JavaScript.

![Vue](https://img.shields.io/badge/Vue-4FC08D?logo=vuedotjs&logoColor=white) ![Rsbuild](https://img.shields.io/badge/Rsbuild-555555) ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

| | |
|---|---|
| **Use case** | Text only editing |
| **Stack** | Vue · Rsbuild · npm |
| **Styling** | Scoped styles |
| **Views** | Text editor, Preview |
| **Code shown** | Go, C++, Java, Python, JavaScript |

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

There is no block workspace on screen: Blockly runs hidden and holds the program, while you edit it as text. Drag a snippet into the code on the left, click a value, a name or a type to change it, and read the same program in any of the five languages on the right.

## Where to look

- `src/definitions.json`: one code element per language, the dropdown `display` maps that turn one type choice into `int`, `std::string`, `String` or `str`, and the hidden "model" mode that keeps every field.
- `src/App.vue`: the `mount()` call without a workspace, the two language dropdowns wired to `setModes()`, and the Run button.
- `src/behaviors.ts`: every block as JavaScript with the same meaning, types ignored, loops stopped after 1,000 rounds.
- `src/modes/`: one small stylesheet per mode, for the snippet tiles.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
