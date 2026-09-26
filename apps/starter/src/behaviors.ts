import type { MorphicBehaviorMap } from "morphic-blocks";

// How each block turns into runnable JavaScript. `inputs` holds the code of
// the blocks plugged into a slot, `fields` a field's value as is, and `quoted`
// the same value as a string literal.
export const behaviors: MorphicBehaviorMap = {
  print: (proxy) => `console.log(${proxy.inputs.VALUE || '""'});\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  number: (proxy) => proxy.fields.NUM || "0",

  math: (proxy) => `${proxy.inputs.A || "0"} ${proxy.fields.OP || "+"} ${proxy.inputs.B || "0"}`,

  repeat: (proxy) =>
    `for (let i = 0; i < ${proxy.inputs.TIMES || "0"}; i++) {\n${proxy.inputs.DO || ""}}\n`,
};
