import type { MorphicBlocks, MorphicCodeEditorTheme, MorphicViewHandle } from "morphic-blocks";
import definitions from "./definitions.json";

// The explorer around the setup in main.ts: checkboxes choose what the toolbox
// tiles show, and each of the two panes chooses what kind of view it is and
// which language it shows. An app of your own needs none of this.

type Kind = "blocks" | "text" | "preview";

/** Every element a tile can show, in the order tiles list them. */
const TILE_ELEMENTS = ["title", "icon", "pseudocode", "javascript", "python", "hint"];

const LANGUAGES: Record<string, string> = {
  pseudocode: "pseudocode",
  javascript: "JavaScript",
  python: "Python",
};

interface Pane {
  kind: HTMLSelectElement;
  language: HTMLSelectElement;
  badge: HTMLElement;
  note: HTMLElement;
  view: HTMLElement;
  /** The view added for this pane; the first pane showing blocks holds the workspace instead. */
  handle?: MorphicViewHandle;
}

export function setUpExplorer(
  engine: MorphicBlocks,
  initialTheme: MorphicCodeEditorTheme,
): { setTheme(theme: MorphicCodeEditorTheme): void } {
  let theme = initialTheme;

  // The ticked elements become the tiles mode, which redraws the toolbox.
  const boxes = Array.from(document.querySelectorAll<HTMLInputElement>("#elements input"));
  const toolbox = document.getElementById("toolbox")!;
  // Only ever grows, so the panes do not jump when a language is unticked.
  let codeWidth = 0;
  const ticked = () => TILE_ELEMENTS.filter((name) => boxes.some((box) => box.value === name && box.checked));
  const showElements = () => {
    engine.setModeElements("tiles", ticked());
    // The framework publishes the widest block for the toolbox's width, but
    // not code shown as text, which does not wrap either. Measure that here.
    const lines = toolbox.querySelectorAll<HTMLElement>(".morphic-element-javascript, .morphic-element-python");
    codeWidth = Math.max(codeWidth, ...Array.from(lines, (line) => (line.offsetParent ? line.scrollWidth : 0)));
    toolbox.style.setProperty("--code-text-width", `${codeWidth}px`);
  };
  for (const box of boxes) box.addEventListener("change", showElements);

  showDefinitionOnHover(toolbox, ticked);

  const workspace = document.getElementById("workspace")!;
  const parking = document.getElementById("parking")!;
  const panes: Pane[] = Array.from(document.querySelectorAll<HTMLElement>(".view-pane"), (root) => ({
    kind: root.querySelector("[data-kind]")!,
    language: root.querySelector("[data-language]")!,
    badge: root.querySelector("[data-read-only]")!,
    note: root.querySelector(".note")!,
    view: root.querySelector(".view")!,
  }));

  const update = () => {
    // The workspace holds the program. It moves to the first pane that shows
    // blocks, and waits out of sight while none does.
    parking.append(workspace);
    const main = panes.find((pane) => pane.kind.value === "blocks");

    for (const pane of panes) {
      pane.handle?.dispose();
      pane.handle = undefined;
      const kind = pane.kind.value as Kind;
      const mode = `in-${pane.language.value}`;
      const language = LANGUAGES[pane.language.value];

      if (pane === main) {
        pane.view.replaceChildren(workspace);
        engine.setModes({ workspaceMode: mode });
        pane.badge.hidden = true;
        pane.note.textContent = `The workspace: blocks you can edit, each drawn from its ${language} element.`;
        continue;
      }

      const container = document.createElement("div");
      container.className = "fill";
      pane.view.replaceChildren(container);
      pane.handle = engine.addView({
        kind: kind === "blocks" ? "workspace" : kind === "text" ? "codespace" : "preview",
        container,
        mode,
        theme,
      });
      pane.badge.hidden = kind === "text";
      pane.note.textContent =
        kind === "blocks"
          ? `Another workspace: the same program as blocks from the ${language} element. It follows the first one and is read only.`
          : kind === "text"
            ? `A codespace: the program as ${language} text. Drag blocks in or around it, and click a value to change it.`
            : `A preview: the program as ${language} text, read only.`;
    }
  };

  for (const pane of panes) {
    pane.kind.addEventListener("change", update);
    pane.language.addEventListener("change", update);
  }
  update();

  return {
    // Text views take the page's colors when the theme changes.
    setTheme(next) {
      theme = next;
      for (const pane of panes) pane.handle?.setTheme(theme);
    },
  };
}

/**
 * Hovering over a tile shows how the block defines what the tile shows: the
 * block's "elements" in definitions.json, limited to the ticked ones.
 */
function showDefinitionOnHover(toolbox: HTMLElement, shown: () => string[]): void {
  const tip = document.createElement("div");
  tip.className = "element-tip";
  tip.hidden = true;
  const title = document.createElement("div");
  title.className = "element-tip-title";
  title.textContent = "Definition";
  const code = document.createElement("pre");
  tip.append(title, code);
  document.body.append(tip);

  toolbox.addEventListener("mouseover", (event) => {
    const tile = (event.target as Element).closest<HTMLElement>("[data-block-type]");
    const block = definitions.blocks.find((b) => b.identifier === tile?.dataset.blockType);
    if (!tile || !block) {
      tip.hidden = true;
      return;
    }
    const elements = block.elements as Record<string, string>;
    const active = Object.fromEntries(
      shown().filter((name) => name in elements).map((name) => [name, elements[name]]),
    );
    code.innerHTML = colored(`"elements": ${JSON.stringify(active, null, 2)}`);
    tip.hidden = false;
    // Beside the tile, kept inside the window.
    const box = tile.getBoundingClientRect();
    tip.style.left = `${box.right + 12}px`;
    tip.style.top = `${Math.max(8, Math.min(box.top, innerHeight - tip.offsetHeight - 8))}px`;
  });
  toolbox.addEventListener("mouseleave", () => (tip.hidden = true));
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * JSON with colors: keys, strings, and inside strings the template's slots
 * (%1, %NAME) and line breaks (\n), each in its own color.
 */
function colored(json: string): string {
  return json.replace(/("(?:[^"\\]|\\.)*")(\s*:)?|([{}\[\],])/g, (_match, text: string, colon: string, punct: string) => {
    if (punct) return `<span class="tok-punct">${punct}</span>`;
    if (colon) return `<span class="tok-key">${escapeHtml(text)}</span><span class="tok-punct">${colon}</span>`;
    const inner = escapeHtml(text)
      .replace(/%(\d+|[A-Z]+)/g, '<span class="tok-slot">$&</span>')
      .replace(/\\n/g, '<span class="tok-break">$&</span>');
    return `<span class="tok-string">${inner}</span>`;
  });
}
