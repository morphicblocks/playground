import type { MorphicBehaviorMap, MorphicBehaviorProxy } from "morphic-blocks";

// Each block as JavaScript that does what the Python in the preview does, so
// Run prints what the Python would print. Variables are declared with `var`:
// like Python's, they then live for the whole program, and they stay inside
// the run instead of leaking into the page as globals.

// Helper names made unique per block, so nested loops never share them.
const own = (proxy: MorphicBehaviorProxy, name: string) =>
  `__${name}_${proxy.blockId.replace(/\W/g, "_")}`;

// A loop whose condition never becomes false would freeze the page, so every
// loop counts its rounds and gives up after this many, saying so in the output.
const MAX_ROUNDS = 1000;
const guard = (rounds: string) =>
  `  if (++${rounds} > ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n`;

export const behaviors: MorphicBehaviorMap = {
  // for _ in range(n): the count is worked out once, before the first round.
  repeat: (proxy) => {
    const rounds = own(proxy, "rounds");
    const end = own(proxy, "end");
    return (
      `for (var ${rounds} = 0, ${end} = ${proxy.inputs.TIMES || "0"}; ${rounds} < ${end};) {\n` +
      `${guard(rounds)}${proxy.inputs.DO || ""}}\n`
    );
  },

  // for i in range(a, b + 1): the bounds are fixed when the loop starts, and
  // changing i inside the body does not change the next round.
  count: (proxy) => {
    const rounds = own(proxy, "rounds");
    const value = own(proxy, "value");
    const end = own(proxy, "end");
    return (
      `var i, ${rounds} = 0;\n` +
      `for (var ${value} = ${proxy.inputs.FROM || "0"}, ${end} = ${proxy.inputs.TO || "0"} + 1; ${value} < ${end}; ${value}++) {\n` +
      `${guard(rounds)}  i = ${value};\n${proxy.inputs.DO || ""}}\n`
    );
  },

  while: (proxy) => {
    const rounds = own(proxy, "rounds");
    return (
      `var ${rounds} = 0;\n` +
      `while (${proxy.inputs.CONDITION || "false"}) {\n${guard(rounds)}${proxy.inputs.DO || ""}}\n`
    );
  },

  // Python prints booleans as True and False.
  print: (proxy) =>
    `console.log(((v) => (v === true ? "True" : v === false ? "False" : v))(${proxy.inputs.VALUE || '""'}));\n`,

  set: (proxy) => `var i = ${proxy.inputs.VALUE || "0"};\n`,

  change: (proxy) => `i += ${proxy.inputs.BY || "0"};\n`,

  variable: () => "i",

  compare: (proxy) => {
    const op = proxy.fields.OP === "==" ? "===" : proxy.fields.OP || "<";
    return `(${proxy.inputs.A || "0"} ${op} ${proxy.inputs.B || "0"})`;
  },

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",
};
