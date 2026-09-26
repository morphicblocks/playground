// Starter programs, one per step of the article. A <morphic-editor> picks one
// by name through its `program` attribute. The state is Blockly's own JSON,
// which is why block types carry the framework's "morphic:" prefix.

const block = (type: string, extra: Record<string, unknown> = {}) => ({
  type: `morphic:${type}`,
  ...extra,
});

const num = (value: number) => ({ block: block("number", { fields: { NUM: value } }) });

const program = (first: ReturnType<typeof block>) => ({
  blocks: { languageVersion: 0, blocks: [{ ...first, x: 24, y: 24 }] },
});

export const programs: Record<string, unknown> = {
  repeat: program(
    block("repeat", {
      inputs: {
        TIMES: num(3),
        DO: { block: block("print", { inputs: { VALUE: { block: block("text", { fields: { TEXT: "Hip hip hooray!" } }) } } }) },
      },
    }),
  ),

  count: program(
    block("count", {
      inputs: {
        FROM: num(1),
        TO: num(5),
        DO: { block: block("print", { inputs: { VALUE: { block: block("variable") } } }) },
      },
    }),
  ),

  while: program(
    block("set", {
      inputs: { VALUE: num(90) },
      next: {
        block: block("while", {
          inputs: {
            CONDITION: {
              block: block("compare", {
                fields: { OP: "<" },
                inputs: {
                  A: { block: block("variable") },
                  B: num(100),
                },
              }),
            },
            DO: {
              block: block("print", {
                inputs: { VALUE: { block: block("variable") } },
                next: {
                  block: block("change", {
                                  inputs: { BY: num(1) },
                  }),
                },
              }),
            },
          },
        }),
      },
    }),
  ),
};
