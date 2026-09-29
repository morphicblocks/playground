<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { MorphicBlocks, type MorphicCodeEditorTheme } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import program from "./program.json";
import goCss from "./modes/in-go.css?raw";
import cppCss from "./modes/in-cpp.css?raw";
import javaCss from "./modes/in-java.css?raw";
import pythonCss from "./modes/in-python.css?raw";
import jsCss from "./modes/in-js.css?raw";
import modelCss from "./modes/model.css?raw";

// One mode per language, listed by the length of the name.
const languages = [
  { mode: "in-go", name: "Go" },
  { mode: "in-cpp", name: "C++" },
  { mode: "in-java", name: "Java" },
  { mode: "in-python", name: "Python" },
  { mode: "in-js", name: "JavaScript" },
];
const nameOf = (mode: string) => languages.find((l) => l.mode === mode)?.name ?? mode;

// Code views are dark by default; these match the mint colors of the page.
const mono = { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', fontSize: "14px", lineHeight: 1.65 };
const editorTheme: MorphicCodeEditorTheme = {
  ...mono,
  background: "#ffffff",
  foreground: "#17392f",
  gutterBackground: "#ffffff",
  gutterForeground: "#9cbfb2",
  selectionBackground: "#d3f0e3",
};
const previewTheme: MorphicCodeEditorTheme = { ...editorTheme, background: "#f4fbf7", gutterBackground: "#f4fbf7" };

const toolboxEl = ref<HTMLElement>();
const codespaceEl = ref<HTMLElement>();
const previewEl = ref<HTMLElement>();

// The preset in definitions.json starts with Python on the left, Java on the right.
const writeMode = ref("in-python");
const readMode = ref("in-java");
const output = ref<string[]>([]);
const error = ref<string | null>(null);

let engine: MorphicBlocks | undefined;

function run() {
  if (!engine) return;
  const result = engine.runJavaScript();
  output.value = result.output.map((line) => line.text);
  error.value = result.error?.message ?? null;
}

onMounted(() => {
  engine = new MorphicBlocks(definitions, behaviors);
  // No workspaceContainer: Blockly runs hidden and keeps the program as
  // blocks, while people only ever see and edit text.
  void engine.mount({
    codespaceContainer: codespaceEl.value!,
    previewContainer: previewEl.value!,
    // The toolbox is set up below, where it can drop its mode label.
    canvasToolbox: true,
    editorTheme,
    previewTheme,
    modeStyles: {
      "in-go": goCss,
      "in-cpp": cppCss,
      "in-java": javaCss,
      "in-python": pythonCss,
      "in-js": jsCss,
      model: modelCss,
    },
  });
  // The heading above the toolbox already names the language.
  engine.mountToolbox(toolboxEl.value!, { modeLabel: false });
  engine.loadWorkspace(program);
  // Show what the starting program prints; Run refreshes it later.
  run();
});

// The toolbox follows the language people write in. The hidden workspace
// stays in the "model" mode, so no field is ever lost when a language leaves
// one out (JavaScript has no type words).
watch([writeMode, readMode], ([write, read]) => {
  engine?.setModes({ codespaceMode: write, toolboxMode: write, previewMode: read });
});

onBeforeUnmount(() => engine?.dispose());
</script>

<template>
  <div class="page">
    <header class="masthead">
      <div class="title">
        <span class="mark" aria-hidden="true"><span>A</span><span>B</span></span>
        <div>
          <h1>Side by Side</h1>
          <p class="lede">
            A program built only from text: drag a snippet into the code, click a value to change it,
            and read the same program in another language beside it.
          </p>
        </div>
      </div>
      <p class="note">Snippets without a main function. Types are shown for comparison; Run does not check them.</p>
    </header>

    <main class="desk">
      <aside class="snippets" aria-label="Snippets">
        <h2>Snippets <span class="in">in {{ nameOf(writeMode) }}</span></h2>
        <div ref="toolboxEl" class="toolbox" />
      </aside>

      <section class="sheet write" aria-label="Code you write">
        <header class="sheet-head">
          <label>
            <span class="verb">Write in</span>
            <select v-model="writeMode" aria-label="Language you write in">
              <option v-for="l in languages" :key="l.mode" :value="l.mode">{{ l.name }}</option>
            </select>
          </label>
          <span class="tag">editable</span>
        </header>
        <div ref="codespaceEl" class="editor" />
      </section>

      <section class="sheet read" aria-label="The same program in another language">
        <header class="sheet-head">
          <label>
            <span class="verb">Read in</span>
            <select v-model="readMode" aria-label="Language you read in">
              <option v-for="l in languages" :key="l.mode" :value="l.mode">{{ l.name }}</option>
            </select>
          </label>
          <span class="tag">read only</span>
        </header>
        <div ref="previewEl" class="editor" />
      </section>

      <section class="console" aria-label="Output">
        <header class="console-head">
          <h2>Output</h2>
          <button type="button" class="run" @click="run">Run</button>
          <span class="aside">Output is shown as JavaScript</span>
        </header>
        <pre class="lines" aria-live="polite"><template v-if="output.length || error"><span
          v-for="(line, i) in output" :key="i" class="line">{{ line }}</span><span
          v-if="error" class="line error">{{ error }}</span></template><span
          v-else class="line empty">The program printed nothing.</span></pre>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
}

/* Blueprint layout in mint: a faint green grid, white sheets, square corners. */
.page {
  --bg: #e8f6ef;
  --grid: rgba(29, 134, 96, 0.08);
  --sheet: #ffffff;
  --sheet-dim: #f4fbf7;
  --ink: #17392f;
  --ink-soft: #55786c;
  --rule: #c7e6d8;
  --accent: #1d8660;
  --accent-soft: #d3f0e3;
  --radius: 2px;
  --font-text: "Avenir Next", "Segoe UI", system-ui, sans-serif;
  --font-display: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}

.page {
  /* The mode stylesheets read these for the toolbox tiles. */
  --font-label: var(--font-text);
  --font-code: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  box-sizing: border-box;
  min-height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 28px 26px;
  background:
    linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--bg);
  color: var(--ink);
  font-family: var(--font-text);
}

.page *,
.page *::before,
.page *::after {
  box-sizing: border-box;
}

/* Masthead */
.masthead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--rule);
}

.title {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Two halves, A and B, split by a line from top to bottom. */
.mark {
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 52px;
  height: 52px;
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--sheet);
  font: 700 15px var(--font-code);
  /* A frame in the ink color holds both halves together as one mark. */
  border: 3px solid var(--ink);
  box-sizing: border-box;
  overflow: hidden;
}

.mark > span {
  display: grid;
  place-items: center;
}

.mark > span + span {
  border-left: 2px solid var(--sheet);
}

h1 {
  margin: 0;
  font: 700 26px/1 var(--font-display);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.lede {
  margin: 6px 0 0;
  max-width: 62ch;
  font-size: 14.5px;
  color: var(--ink-soft);
}

.note {
  margin: 0;
  max-width: 46ch;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--ink-soft);
  text-align: right;
}

/* Desk: snippets on the left, the two sheets, output underneath */
.desk {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas:
    "snippets write read"
    "snippets console console";
  gap: 18px;
}

h2 {
  margin: 0;
  font: 700 11.5px var(--font-text);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.snippets {
  grid-area: snippets;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.in {
  color: var(--accent);
}

.toolbox {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* The toolbox tiles are built by the framework, so they are reached with :deep. */
.toolbox :deep([data-category]) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.toolbox :deep(.morphic-block) {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 7px 10px 8px;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--morphic-block-color, var(--ink));
  border-radius: var(--radius);
  cursor: grab;
  overflow: hidden;
  transition: transform 120ms ease, border-color 120ms ease;
}

.toolbox :deep(.morphic-block:hover) {
  transform: translateX(3px);
  border-color: var(--accent);
  border-left-color: var(--morphic-block-color, var(--ink));
}

/* An empty slot in a snippet, where a value or other snippets go. */
.toolbox :deep(.morphic-toolbox-slot) {
  display: inline-block;
  min-width: 18px;
  height: 1.1em;
  vertical-align: -0.2em;
  border: 1px dashed var(--ink-soft);
  border-radius: 3px;
}

/* Sheets */
.sheet {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  overflow: hidden;
}

.write {
  grid-area: write;
}

.read {
  grid-area: read;
  background: var(--sheet-dim);
}

/* A heavy rule on top of the sheet you write in, a dashed edge on the one you read. */
.write {
  border-top: 3px solid var(--accent);
}

.read {
  border-style: dashed;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--rule);
}

.sheet-head label {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.verb {
  font-size: 14px;
  color: var(--ink-soft);
}

select {
  appearance: none;
  padding: 4px 28px 4px 10px;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  background: var(--accent-soft)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E")
    no-repeat right 9px center;
  color: var(--ink);
  font: 700 16px var(--font-display);
  cursor: pointer;
}

select:focus-visible,
.run:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.tag {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.editor {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Output */
.console {
  grid-area: console;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.console-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.run {
  padding: 6px 20px;
  border: 0;
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--sheet);
  font: 700 14px var(--font-text);
  cursor: pointer;
}

.aside {
  font-size: 12.5px;
  color: var(--ink-soft);
}

.run::after {
  content: " \25B8";
}

.run:hover {
  filter: brightness(1.15);
}

.lines {
  margin: 0;
  height: 210px;
  overflow: auto;
  padding: 10px 14px;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  font: 13.5px/1.6 var(--font-code);
}

.line {
  display: block;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.line::before {
  content: "› ";
  color: var(--rule);
}

.error {
  color: #b3261e;
}

.empty {
  color: var(--ink-soft);
  font-style: italic;
}

/* Tablets: snippets across the top, sheets side by side */
@media (max-width: 1000px) {
  .desk {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto minmax(320px, 1fr) auto;
    grid-template-areas:
      "snippets snippets"
      "write read"
      "console console";
  }

  .toolbox {
    max-height: 210px;
  }

  /* Tiles side by side, so the strip stays short. */
  .toolbox :deep([data-category]) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  }
}

/* Phones: one column, the page scrolls */
@media (max-width: 700px) {
  .page {
    height: auto;
    padding: 16px 16px 24px;
  }

  .masthead {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .note {
    text-align: left;
  }

  .mark {
    width: 44px;
    height: 44px;
  }

  .desk {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-template-areas:
      "write"
      "snippets"
      "read"
      "console";
  }

  .editor {
    flex: none;
    height: 340px;
  }

  .toolbox {
    max-height: 240px;
  }
}
</style>
