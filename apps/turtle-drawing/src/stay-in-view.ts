import * as Blockly from "blockly";

// Blockly lets the view scroll half a screen past the program on every side.
// This keeps the top left corner of the workspace as the edge, and allows
// only a little room beyond the blocks, so the program stays in view.
const ROOM = 24;

export class StayInView extends Blockly.MetricsManager {
  protected override getPaddedContent_(
    view: Blockly.MetricsManager.ContainerRegion,
    content: Blockly.MetricsManager.ContainerRegion,
  ) {
    return {
      top: Math.min(0, content.top - ROOM),
      left: Math.min(0, content.left - ROOM),
      bottom: Math.max(content.top + content.height + ROOM, view.height),
      right: Math.max(content.left + content.width + ROOM, view.width),
    };
  }
}
