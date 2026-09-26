import type { MorphicBehaviorMap, MorphicBehaviorProxy } from "morphic-blocks";

// Each block as JavaScript that does what its Python does, so Run prints what
// the Python would print. Variables use `var`: like Python's, they live for
// the whole program and stay inside the run instead of becoming page globals.

// Helper names made unique per block, so nested loops never share them.
const own = (proxy: MorphicBehaviorProxy, name: string) =>
  `__${name}_${proxy.blockId.replace(/\W/g, "_")}`;

// A very long loop would freeze the page, so every loop counts its rounds and
// gives up after this many, saying so in the output.
const MAX_ROUNDS = 1000;

// Python's == and != compare values without JavaScript's type juggling.
const operators: Record<string, string> = { "==": "===", "!=": "!==" };

export const behaviors: MorphicBehaviorMap = {
  // Python prints booleans as True and False.
  print: (proxy) =>
    `console.log(((v) => (v === true ? "True" : v === false ? "False" : v))(${proxy.inputs.VALUE || '""'}));\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",

  math: (proxy) => `${proxy.inputs.A || "0"} ${proxy.fields.OP || "+"} ${proxy.inputs.B || "0"}`,

  compare: (proxy) => {
    const op = proxy.fields.OP || ">";
    return `${proxy.inputs.A || "0"} ${operators[op] ?? op} ${proxy.inputs.B || "0"}`;
  },

  if: (proxy) => `if (${proxy.inputs.CONDITION || "false"}) {\n${proxy.inputs.DO || ""}}\n`,

  // for i in range(n): the count is worked out once, before the first round,
  // and i runs from 0 to n minus 1.
  repeat: (proxy) => {
    const end = own(proxy, "end");
    const round = own(proxy, "round");
    return (
      `var i;\n` +
      `for (var ${end} = ${proxy.inputs.TIMES || "0"}, ${round} = 0; ${round} < ${end}; ${round}++) {\n` +
      `  if (${round} >= ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n` +
      `  i = ${round};\n${proxy.inputs.DO || ""}}\n`
    );
  },

  set: (proxy) => `var ${proxy.fields.NAME || "score"} = ${proxy.inputs.VALUE || "0"};\n`,

  get: (proxy) => proxy.fields.NAME || "score",
};
