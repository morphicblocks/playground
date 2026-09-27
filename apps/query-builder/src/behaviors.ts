import type { MorphicBehaviorMap } from "morphic-blocks";
import { columns } from "./planets";

// The blocks show SQL, but what runs is the JavaScript below. Each query
// copies the `planets` array, lets its clauses filter, sort and cut it, and
// pushes the rows with the picked columns onto `results`. The app's run
// function (main.ts) hands both names in. The connection checks in
// definitions.json keep the clauses in SQL's order (WHERE, ORDER BY, LIMIT),
// so running them top to bottom means what the SQL means.

const allColumns = JSON.stringify(columns.map((column) => column.name));
const isText = (name: string) => columns.some((c) => c.name === name && c.kind === "text");

export const behaviors: MorphicBehaviorMap = {
  select: (proxy) =>
    `{\n  let rows = [...planets];\n${proxy.inputs.CLAUSES ?? ""}\n` +
    `  results.push({ columns: ${proxy.inputs.COLUMNS || allColumns}, rows });\n}\n`,

  // Column picks are arrays of names, so a pair simply joins two arrays.
  all_columns: () => allColumns,
  column: (proxy) => JSON.stringify([proxy.fields.COL]),
  column_pair: (proxy) => `[...${proxy.inputs.FIRST || "[]"}, ...${proxy.inputs.SECOND || "[]"}]`,

  // An empty WHERE keeps every row, like a condition that is always true.
  where: (proxy) => `rows = rows.filter((row) => ${proxy.inputs.CONDITION || "true"});\n`,

  // Numbers sort by value and texts alphabetically, as SQL does.
  order_by: (proxy) => {
    const col = proxy.fields.COL;
    const [a, b] = proxy.fields.DIR === "desc" ? ["b", "a"] : ["a", "b"];
    return isText(col)
      ? `rows.sort((a, b) => ${a}.${col}.localeCompare(${b}.${col}));\n`
      : `rows.sort((a, b) => ${a}.${col} - ${b}.${col});\n`;
  },

  limit: (proxy) => `rows = rows.slice(0, ${Number(proxy.fields.N) || 0});\n`,

  compare_number: (proxy) => `row.${proxy.fields.COL} ${proxy.fields.OP} ${Number(proxy.fields.NUM) || 0}`,
  compare_text: (proxy) => `row.${proxy.fields.COL} ${proxy.fields.OP} ${proxy.quoted.TEXT}`,
  // LIKE 'M%' means "begins with M". Case sensitive here, as in PostgreSQL.
  starts_with: (proxy) => `row.${proxy.fields.COL}.startsWith(${proxy.quoted.TEXT})`,
  both: (proxy) => `${proxy.inputs.A || "true"} ${proxy.fields.LOGIC} ${proxy.inputs.B || "true"}`,
};
