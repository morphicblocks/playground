import { LitElement, html } from "lit";
import { MorphicBlocks } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import { programs } from "./programs";

const modesFolder = import.meta.glob("./modes/*.css", { eager: true, query: "?inline" });

// The preview takes the colors of the page instead of the dark default.
const paperTheme = {
  background: "#fbf6ea",
  foreground: "#2e2620",
  gutterBackground: "#f3ead8",
  gutterForeground: "#a8977c",
  selectionBackground: "#ecd9b4",
  fontSize: "14px",
  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  lineHeight: 1.5,
};

/**
 * A small block editor with a live Python preview and a Run button, to drop
 * into any page:
 *
 *   <morphic-editor blocks="repeat,print,text,number" program="repeat"
 *                   height="300" caption="Figure 1"></morphic-editor>
 *
 * `blocks` lists the toolbox tiles, `program` names a starter program from
 * programs.ts, `height` sets the editor height in pixels and `caption` the
 * text under the figure. They are read once, when the editor is set up.
 * Every instance runs its own engine, so editors on one page never share
 * blocks.
 */
export class MorphicEditor extends LitElement {
  static properties = {
    blocks: { type: String },
    program: { type: String },
    height: { type: Number },
    caption: { type: String },
  };

  declare blocks: string;
  declare program: string;
  declare height: number;
  declare caption: string;

  private engine?: MorphicBlocks;

  constructor() {
    super();
    this.blocks = "";
    this.program = "";
    this.height = 300;
    this.caption = "";
  }

  // No Shadow DOM: Blockly and the framework put their stylesheets into the
  // document head, and those rules cannot reach inside a shadow root. Rendering
  // into the element itself keeps the editor styled by them, and lets the page
  // style it too.
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <figure class="editor" style="--editor-height: ${this.height}px">
        <div class="editor-toolbox" aria-label="Blocks to drag"></div>
        <div class="editor-panes">
          <div class="editor-workspace" aria-label="Your program"></div>
          <div class="editor-side">
            <div class="editor-preview" aria-label="The same program in Python"></div>
            <div class="editor-run">
              <div class="editor-run-head">
                <span>Output</span>
                <button type="button" @click=${this.run}>Run</button>
              </div>
              <pre class="editor-output" aria-live="polite"></pre>
            </div>
          </div>
        </div>
        ${this.caption ? html`<figcaption>${this.caption}</figcaption>` : null}
      </figure>
    `;
  }

  protected firstUpdated() {
    this.setUp();
  }

  // Moving the element in the page disconnects and reconnects it; the first
  // setup happens in firstUpdated, a later one here.
  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated && !this.engine) this.setUp();
  }

  private setUp() {
    const part = (name: string) => this.querySelector<HTMLElement>(`.editor-${name}`)!;
    const engine = new MorphicBlocks(definitions, behaviors);
    this.engine = engine;

    engine.mount({
      workspaceContainer: part("workspace"),
      previewContainer: part("preview"),
      previewTheme: paperTheme,
      // The toolbox is mounted below, so Blockly should not build its own.
      canvasToolbox: true,
      modesFolder,
      // Served by the app itself (scripts/copy-blockly-media.mjs), so Blockly
      // never loads images or sounds from Google's server.
      blockly: { media: "blockly-media/", trashcan: false },
    });

    // mount() always shows every block; each figure needs only its own few,
    // so the toolbox is set up separately with a subset.
    engine.mountToolbox(part("toolbox"), {
      blocks: this.blocks.split(",").map((id) => id.trim()).filter(Boolean),
      modeLabel: false,
    });

    const start = programs[this.program];
    if (start) engine.loadWorkspace(start);
    // The figure opens with its output already there, like a printed example.
    this.run();
  }

  // Arrow function, so Lit can pass it as the click handler as is.
  private run = () => {
    if (!this.engine) return;
    const { output, error } = this.engine.runJavaScript();
    const lines = output.map((line) => line.text);
    if (error) lines.push(`Error: ${error.message}`);
    this.querySelector(".editor-output")!.textContent = lines.join("\n") || "Nothing was printed.";
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.engine?.dispose();
    this.engine = undefined;
  }
}

customElements.define("morphic-editor", MorphicEditor);
