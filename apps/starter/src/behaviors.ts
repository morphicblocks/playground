import type { MorphicBehaviorMap } from "morphic-blocks";

// How each block turns into runnable JavaScript, whichever language the views
// show. `inputs` holds the code of the blocks plugged into a slot, `fields` a
// field's value as is, and `quoted` the same value as a string literal.
export const behaviors: MorphicBehaviorMap = {
  print: (proxy) => `console.log(${proxy.inputs.VALUE || '""'});\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",

  boolean: (proxy) => proxy.fields.BOOL || "true",

  set: (proxy) => `let ${proxy.fields.NAME} = ${proxy.inputs.VALUE || "0"};\n`,

  change: (proxy) => `${proxy.fields.NAME} += ${proxy.inputs.BY || "0"};\n`,

  get: (proxy) => proxy.fields.NAME || "undefined",

  math: (proxy) => `${proxy.inputs.A || "0"} ${proxy.fields.OP || "+"} ${proxy.inputs.B || "0"}`,

  compare: (proxy) => `${proxy.inputs.A || "0"} ${proxy.fields.OP || ">"} ${proxy.inputs.B || "0"}`,

  if_else: (proxy) =>
    `if (${proxy.inputs.CONDITION || "false"}) {\n${proxy.inputs.THEN || ""}} else {\n${proxy.inputs.ELSE || ""}}\n`,

  repeat: (proxy) =>
    `for (let i = 0; i < ${proxy.inputs.TIMES || "0"}; i++) {\n${proxy.inputs.DO || ""}}\n`,
};
