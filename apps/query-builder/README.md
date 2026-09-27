<!-- generated:top (made from apps.json by `bun run readmes`, edit apps.json instead) -->
# Query Builder

Blocks build a database query over a small table of planets and the text view shows it as real SQL, while Run quietly executes JavaScript with the same meaning and shows the rows as a table.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Deno](https://img.shields.io/badge/Deno-000000?logo=deno&logoColor=white)

| | |
|---|---|
| **Use case** | Output that is not JavaScript |
| **Stack** | TypeScript · Vite · Deno |
| **Styling** | Plain CSS |
| **Views** | Blocks, Text editor |
| **Code shown** | SQL |

## Run

```sh
deno install
deno task dev
```

`deno task build` writes a static site to `dist/`.
<!-- /generated:top -->

The blocks build a query over a small table of planets and the text view shows it as real SQL. Run does not run SQL, though: the same blocks also turn into JavaScript that filters, sorts and cuts the list with the same meaning, and the result appears as a table. The JavaScript tab shows that code. Connection checks keep the clauses in SQL's order, so WHERE, ORDER BY and LIMIT only fit in that sequence.

## Where to look

- `src/definitions.json`: the words and SQL element of each block, the dropdowns whose shown text differs per element, and the connection checks that order the clauses.
- `src/behaviors.ts`: the JavaScript each block runs as, with no SQL in it.
- `src/main.ts`: the mount call, the run function that hands the table in, and the results grid.
- `src/planets.ts`: the table the queries read.

<!-- generated:license -->
## License

MIT-0, see [LICENSE-APPS](https://github.com/morphicblocks/playground/blob/main/LICENSE-APPS).
<!-- /generated:license -->
