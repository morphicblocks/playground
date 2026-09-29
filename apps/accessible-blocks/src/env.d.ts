// Mode stylesheets arrive as text (see scripts/build.ts); other stylesheets
// are only imported for their effect.
declare module "*.css" {
  const css: string;
  export default css;
}

// Blockly's keyboard navigation for Blockly 11 ships without types; this
// app uses only these calls.
declare module "@blockly/keyboard-navigation" {
  import type { WorkspaceSvg } from "blockly";
  export class NavigationController {
    init(): void;
    addWorkspace(workspace: WorkspaceSvg): void;
    enable(workspace: WorkspaceSvg): void;
    dispose(): void;
    navigation: { focusWorkspace(workspace: WorkspaceSvg): void };
  }
}
