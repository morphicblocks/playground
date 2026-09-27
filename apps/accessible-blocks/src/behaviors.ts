import type { MorphicBehaviorMap, MorphicBehaviorProxy } from "morphic-blocks";

// Each block as JavaScript with the meaning its Java and plain words show.
// Boxes (variables) use `var`, so they live for the whole program.

// Helper names made unique per block, so nested loops never share them.
const own = (proxy: MorphicBehaviorProxy, name: string) =>
  `__${name}_${proxy.blockId.replace(/\W/g, "_")}`;

// A loop that never ends would freeze the page, so every loop gives up after
// this many rounds and says so in the output.
const MAX_ROUNDS = 1000;

const value = (proxy: MorphicBehaviorProxy, name: string, fallback = "0") =>
  proxy.inputs[name] || fallback;

// == compares values without JavaScript's type juggling, as Java does.
const operators: Record<string, string> = { "==": "===" };

export const behaviors: MorphicBehaviorMap = {
  say: (proxy) => `console.log(${value(proxy, "VALUE", '""')});\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",

  compare: (proxy) => {
    const op = proxy.fields.OP || "<";
    return `(${value(proxy, "A")} ${operators[op] ?? op} ${value(proxy, "B")})`;
  },

  make: (proxy) => `var ${proxy.fields.NAME || "score"} = ${value(proxy, "VALUE")};\n`,

  add: (proxy) => `${proxy.fields.NAME || "score"} += ${value(proxy, "VALUE")};\n`,

  get: (proxy) => proxy.fields.NAME || "score",

  if_else: (proxy) =>
    `if (${value(proxy, "CONDITION", "false")}) {\n${proxy.inputs.THEN || ""}} else {\n${proxy.inputs.ELSE || ""}}\n`,

  // The count is worked out once, before the first round, as Java does.
  repeat: (proxy) => {
    const rounds = own(proxy, "rounds");
    const end = own(proxy, "end");
    return (
      `for (var ${rounds} = 0, ${end} = ${value(proxy, "TIMES")}; ${rounds} < ${end}; ${rounds}++) {\n` +
      `  if (${rounds} >= ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n` +
      `${proxy.inputs.DO || ""}}\n`
    );
  },
};
