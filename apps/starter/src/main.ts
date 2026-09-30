import { MorphicBlocks, type MorphicCodeEditorTheme } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import { setUpExplorer } from "./explorer";
import program from "./program.json";
import "./style.css";

const byId = (id: string) => document.getElementById(id)!;

// Three looks for the page. The CSS in style.css colors the page for each;
// text views take their colors from these editor themes.
const mono = 'ui-monospace, "SF Mono", Consolas, monospace';
const codeThemes: Record<string, MorphicCodeEditorTheme> = {
  light: {
    background: "#ffffff", foreground: "#000000", gutterBackground: "#f5f5f5",
    gutterForeground: "#666666", selectionBackground: "#cddcec", fontFamily: mono, fontSize: "15px",
  },
  sunrise: {
    background: "#fffaf2", foreground: "#33271d", gutterBackground: "#fbf1e3",
    gutterForeground: "#8f7a64", selectionBackground: "#f6d9c4", fontFamily: mono, fontSize: "15px",
  },
  dark: {
    background: "#1b2027", foreground: "#e6e9ec", gutterBackground: "#161b21",
    gutterForeground: "#8591a0", selectionBackground: "#24514a", fontFamily: mono, fontSize: "15px",
  },
};

// The chosen look is remembered in this browser.
const themePicker = byId("theme") as HTMLSelectElement;
const savedTheme = (() => {
  try {
    return localStorage.getItem("starter-theme");
  } catch {
    return null;
  }
})();
if (savedTheme && savedTheme in codeThemes) themePicker.value = savedTheme;
document.documentElement.dataset.theme = themePicker.value;

const engine = new MorphicBlocks(definitions, behaviors);

// One call sets up the toolbox and the workspace. The preset in
// definitions.json decides which mode each of them shows.
engine.mount({
  toolboxContainer: byId("toolbox"),
  workspaceContainer: byId("workspace"),
  modesFolder: import.meta.glob("./modes/*.css", { eager: true, query: "?inline" }),
  // The views the explorer adds follow the selection too.
  selectionSync: true,
  // The picker above the tiles says what they show, so no mode label.
  toolbox: { modeLabel: false },
  blockly: {
    trashcan: true,
    // The page's CSS paints the workspace, so it follows the theme.
    theme: { name: "starter", base: "classic", componentStyles: { workspaceBackgroundColour: "transparent" } },
  },
});
engine.loadWorkspace(program);

// Everything else on the page lets you explore: which elements the tiles
// show, and what kind of view each pane is, in which language.
const explorer = setUpExplorer(engine, codeThemes[themePicker.value]!);

themePicker.addEventListener("change", () => {
  document.documentElement.dataset.theme = themePicker.value;
  explorer.setTheme(codeThemes[themePicker.value]!);
  try {
    localStorage.setItem("starter-theme", themePicker.value);
  } catch {
    /* private mode: the theme applies for this visit */
  }
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
