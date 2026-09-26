import { MorphicBlocks } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import "./style.css";

const byId = (id: string) => document.getElementById(id)!;

const engine = new MorphicBlocks(definitions, behaviors);

// One call sets up the toolbox, the workspace and the code view. The preset
// in definitions.json decides which mode each of them shows.
engine.mount({
  toolboxContainer: byId("toolbox"),
  workspaceContainer: byId("workspace"),
  codespaceContainer: byId("code"),
  modesFolder: import.meta.glob("./modes/*.css", { eager: true, query: "?inline" }),
  // Code views are dark by default; these colors match the light page.
  editorTheme: {
    background: "#ffffff",
    foreground: "#1f2933",
    gutterBackground: "#f7f8f9",
    gutterForeground: "#9aa3ab",
    selectionBackground: "#d3ebe7",
    fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
    fontSize: "14px",
  },
  // Blockly's images and sounds, the trash can icon included, are served by
  // the app itself (scripts/copy-blockly-media.mjs), never by Google.
  blockly: { trashcan: true, media: "blockly-media/" },
});

// Each ⓘ button opens its note; a second click closes it.
for (const button of document.querySelectorAll<HTMLButtonElement>(".info")) {
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    byId(button.getAttribute("aria-controls")!).hidden = !open;
  });
}

// Run the program and show what it printed.
byId("run").addEventListener("click", () => {
  const { output, error } = engine.runJavaScript();
  const lines = output.map((line) => line.text);
  if (error) lines.push(`Error: ${error.message}`);
  byId("output").textContent = lines.join("\n") || "The program printed nothing.";
});
