import type { MorphicBehaviorMap, MorphicBehaviorProxy } from "morphic-blocks";

// Each block as JavaScript with the same meaning as the five languages show.
// Types only exist in the text views: Run ignores them, just like the note in
// the page says. Variables use `var`, so they live for the whole program (or
// the whole function) wherever they were created, and never become page globals.

// Helper names made unique per block, so nested loops never share them.
const own = (proxy: MorphicBehaviorProxy, name: string) =>
  `__${name}_${proxy.blockId.replace(/\W/g, "_")}`;

// A loop that never ends would freeze the page, so every loop counts its
// rounds and gives up after this many, saying so in the output.
const MAX_ROUNDS = 1000;
const guard = (rounds: string) =>
  `  if (++${rounds} > ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n`;

// == and != compare values without JavaScript's type juggling, as they do in
// the typed languages.
const operators: Record<string, string> = { "==": "===", "!=": "!==" };

const value = (proxy: MorphicBehaviorProxy, name: string, fallback = "0") =>
  proxy.inputs[name] || fallback;

export const behaviors: MorphicBehaviorMap = {
  print: (proxy) => `console.log(${value(proxy, "VALUE", '""')});\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",

  bool: (proxy) => (proxy.fields.VALUE === "false" ? "false" : "true"),

  // Brackets keep the grouping the text views show, e.g. 2 * (3 + 4).
  math: (proxy) => `(${value(proxy, "A")} ${proxy.fields.OP || "+"} ${value(proxy, "B")})`,

  compare: (proxy) => {
    const op = proxy.fields.OP || "<";
    return `(${value(proxy, "A")} ${operators[op] ?? op} ${value(proxy, "B")})`;
  },

  declare: (proxy) => `var ${proxy.fields.NAME || "x"} = ${value(proxy, "VALUE")};\n`,

  assign: (proxy) => `${proxy.fields.NAME || "x"} = ${value(proxy, "VALUE")};\n`,

  variable: (proxy) => proxy.fields.NAME || "x",

  if: (proxy) => `if (${value(proxy, "CONDITION", "false")}) {\n${proxy.inputs.THEN || ""}}\n`,

  if_else: (proxy) =>
    `if (${value(proxy, "CONDITION", "false")}) {\n${proxy.inputs.THEN || ""}} else {\n${proxy.inputs.ELSE || ""}}\n`,

  // The count is worked out once, before the first round (as Python's range
  // does), and i runs from 0 to n minus 1 so the body can read it.
  repeat: (proxy) => {
    const rounds = own(proxy, "rounds");
    const end = own(proxy, "end");
    return (
      `for (var ${rounds} = 0, ${end} = ${value(proxy, "TIMES")}; ${rounds} < ${end}; ${rounds}++) {\n` +
      `  if (${rounds} >= ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n` +
      `  var i = ${rounds};\n${proxy.inputs.DO || ""}}\n`
    );
  },

  while: (proxy) => {
    const rounds = own(proxy, "rounds");
    return (
      `var ${rounds} = 0;\n` +
      `while (${value(proxy, "CONDITION", "false")}) {\n${guard(rounds)}${proxy.inputs.DO || ""}}\n`
    );
  },

  // A function declaration, so it can be called from anywhere in the program,
  // above or below its definition.
  function: (proxy) =>
    `function ${proxy.fields.NAME || "greet"}(${proxy.fields.PARAM || "name"}) {\n${proxy.inputs.BODY || ""}}\n`,

  call: (proxy) => `${proxy.fields.NAME || "greet"}(${proxy.inputs.ARG || ""})`,

  return: (proxy) => `return ${value(proxy, "VALUE")};\n`,
};
