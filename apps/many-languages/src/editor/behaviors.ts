import type { MorphicBehaviorMap, MorphicBehaviorProxy } from "morphic-blocks";

// Every language shows the same program, so one set of behaviors runs it:
// each block becomes JavaScript, whatever language its words are in.

// A loop that never ends would freeze the page, so every loop counts its
// rounds and stops after this many.
const MAX_ROUNDS = 1000;

// A counter name of its own per loop, so nested loops never share one.
const counter = (proxy: MorphicBehaviorProxy) => `__round_${proxy.blockId.replace(/\W/g, "_")}`;

// The dropdowns store the symbols every language shows (× ÷ − = ≠), so
// they need no per language display. Here they become JavaScript.
const operators: Record<string, string> = { "−": "-", "×": "*", "÷": "/", "=": "===", "≠": "!==" };
const operator = (symbol: string | undefined, fallback: string) =>
  symbol ? (operators[symbol] ?? symbol) : fallback;

export const behaviors: MorphicBehaviorMap = {
  print: (proxy) => `console.log(${proxy.inputs.VALUE || '""'});\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",

  bool: (proxy) => (proxy.fields.VALUE === "false" ? "false" : "true"),

  // `var` keeps a variable alive for the whole run, like in pseudocode.
  set: (proxy) => `var ${proxy.fields.NAME || "n"} = ${proxy.inputs.VALUE || "0"};\n`,

  get: (proxy) => proxy.fields.NAME || "n",

  math: (proxy) => `(${proxy.inputs.A || "0"} ${operator(proxy.fields.OP, "+")} ${proxy.inputs.B || "0"})`,

  compare: (proxy) => `(${proxy.inputs.A || "0"} ${operator(proxy.fields.OP, ">")} ${proxy.inputs.B || "0"})`,

  logic: (proxy) => `(${proxy.inputs.A || "false"} ${proxy.fields.OP || "&&"} ${proxy.inputs.B || "false"})`,

  if: (proxy) => `if (${proxy.inputs.CONDITION || "false"}) {\n${proxy.inputs.DO || ""}}\n`,

  ifelse: (proxy) =>
    `if (${proxy.inputs.CONDITION || "false"}) {\n${proxy.inputs.DO || ""}} else {\n${proxy.inputs.ELSE || ""}}\n`,

  repeat: (proxy) => {
    const round = counter(proxy);
    return (
      `for (var ${round} = 0; ${round} < ${proxy.inputs.TIMES || "0"}; ${round}++) {\n` +
      `  if (${round} >= ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n` +
      `${proxy.inputs.DO || ""}}\n`
    );
  },
};
