import * as Blockly from "blockly";
import type { MorphicBehaviorMap } from "morphic-blocks";
import { pens, penColor, type PenColor } from "./pens";

// A color box that the color fills completely, the picture of each choice.
const swatch = (color: string) => ({
  src:
    "data:image/svg+xml," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="32"><rect width="48" height="32" fill="${color}"/></svg>`),
  width: 48,
  height: 32,
  alt: "",
});

// The pen color dropdown. On the block, its whole box takes the chosen
// color (Blockly would draw it in the block's color around the picture).
// Its list gets a class, so app.css can style it as color boxes only.
class PenColorField extends Blockly.FieldDropdown {
  override applyColour() {
    super.applyColour();
    this.borderRect_?.setAttribute("fill", penColor(this.getValue() ?? "ink"));
    this.borderRect_?.setAttribute("stroke", "rgba(0, 0, 0, 0.3)");
  }

  protected override render_() {
    super.render_();
    this.applyColour();
  }

  protected override showEditor_(event?: MouseEvent) {
    super.showEditor_(event);
    this.menu_?.getElement()?.classList.add("pen-colors");
  }
}

// Each block becomes one call on the `turtle` the app passes in (see
// turtle.ts). Nothing here draws: the turtle only writes down its moves.
// Every loop round calls `loop()` first, which stops a program that would
// otherwise run for a very long time.
export const behaviors: MorphicBehaviorMap = {
  forward: (proxy) => `turtle.forward(${Number(proxy.fields.STEPS) || 0});\n`,

  left: (proxy) => `turtle.left(${Number(proxy.fields.ANGLE) || 0});\n`,

  right: (proxy) => `turtle.right(${Number(proxy.fields.ANGLE) || 0});\n`,

  pen: {
    // The definitions format gives dropdown choices text labels only, so the
    // pen block's %COLOR is left undeclared and its dropdown is built here.
    onViewApplied(block) {
      if (block.getField("COLOR")) return;
      const options = (Object.entries(pens) as [PenColor, string][]).map(
        ([name, color]): [ReturnType<typeof swatch>, string] => [swatch(color), name],
      );
      const field = new PenColorField(options);
      field.setValue("red");
      block.inputList[block.inputList.length - 1].appendField(field, "COLOR");
    },
    generate: (proxy) => `turtle.color(${proxy.quoted.COLOR || '"ink"'});\n`,
  },

  // The closing brace goes on its own line, so the code popup reads well.
  repeat: (proxy) => {
    const body = (proxy.inputs.DO || "").trimEnd();
    return `for (let i = 0; i < ${Number(proxy.fields.TIMES) || 0}; i++) {\n  loop();\n${body ? body + "\n" : ""}}\n`;
  },
};
