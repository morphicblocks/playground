import { useEffect, useRef, useState } from "react";
import { MorphicBlocks, type MorphicPresetDefinition } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import program from "./program.json";
import styles from "./App.module.css";

const modesFolder = import.meta.glob("./modes/*.css", { eager: true, query: "?inline" });

// One short sentence per step, so the learner knows what changed.
const hints: Record<string, string> = {
  blocks: "Build with blocks in plain words, then press Run to see what the program prints.",
  "blocks-and-python": "Keep building in plain words. Next to it, the same program as Python blocks follows along.",
  "python-text": "Now the blocks speak Python, and the Python text beside them can be edited too.",
};

const editorTheme = {
  background: "#13141c",
  foreground: "#d5d9f0",
  gutterBackground: "#13141c",
  gutterForeground: "#4b5070",
  selectionBackground: "#2e3355",
  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  fontSize: "14px",
  lineHeight: 1.6,
};

type Output = { lines: string[]; error: string | null };

const blocklyBase = {
  // Served by the app itself (scripts/copy-blockly-media.mjs), so Blockly
  // never loads images or sounds from Google's server.
  media: "blockly-media/",
  grid: { spacing: 24, length: 2, colour: "#262a3d", snap: true },
  theme: {
    name: "block-to-text",
    base: "classic",
    componentStyles: {
      workspaceBackgroundColour: "#181a25",
      scrollbarColour: "#3a3f5c",
      scrollbarOpacity: 0.6,
    },
  },
};

export function App() {
  const toolboxRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const codespaceRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphicBlocks | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  const [preset, setPreset] = useState<MorphicPresetDefinition | null>(null);
  const [output, setOutput] = useState<Output>({ lines: [], error: null });

  const run = () => {
    const result = engineRef.current?.runJavaScript();
    if (!result) return;
    setOutput({ lines: result.output.map((line) => line.text), error: result.error?.message ?? null });
  };

  // Keep the end of the output in view: that is where an error shows up.
  useEffect(() => {
    const pre = outputRef.current;
    if (pre) pre.scrollTop = pre.scrollHeight;
  }, [output]);

  useEffect(() => {
    const engine = new MorphicBlocks(definitions, behaviors);
    engineRef.current = engine;
    void engine.mount({
      toolboxContainer: toolboxRef.current!,
      workspaceContainer: workspaceRef.current!,
      codespaceContainer: codespaceRef.current!,
      editorTheme,
      // The framework reports which views the preset shows; React lays them out.
      onPresetApplied: setPreset,
      modesFolder,
      blockly: { ...blocklyBase, trashcan: true, zoom: { controls: true, wheel: true, startScale: 0.95 } },
    });

    // One engine has one workspace, so the Python blocks of step 2 come from a
    // second, read only engine that shows a copy of the first one's program.
    // It never runs anything, so it needs no behaviors.
    const mirror = new MorphicBlocks(definitions);
    void mirror.mount({
      workspaceContainer: mirrorRef.current!,
      presets: [{ name: "mirror", toolbox: "py", workspace: "py" }],
      // No toolbox at all: the mirror only shows blocks. Without this a read
      // only workspace fails at mount (Blockly has no toolbox to update).
      canvasToolbox: true,
      modesFolder,
      blockly: { ...blocklyBase, readOnly: true, zoom: { wheel: true, startScale: 0.95 } },
    });

    // Copy the program after every real change (not selection or scrolling),
    // at most once per frame. Loading keeps the mirror's scroll position, so
    // its view stays put.
    let frame = 0;
    const copy = () => {
      frame = 0;
      mirror.loadWorkspace(engine.serializeWorkspace());
    };
    engine.getWorkspace()?.addChangeListener((event) => {
      if (!event.isUiEvent && !frame) frame = requestAnimationFrame(copy);
    });

    engine.loadWorkspace(program);
    // Blockly starts with its origin in the middle of the pane. Put the
    // program in the top left corner instead, so it stays in view when the
    // pane narrows in step 2.
    engine.getWorkspace()?.scroll(0, 0);
    // Show what the starting program prints; Run refreshes it later.
    run();
    return () => {
      cancelAnimationFrame(frame);
      mirror.dispose();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const step = preset?.name ?? "blocks";
  const layout = { blocks: styles.stepOne, "blocks-and-python": styles.stepTwo, "python-text": styles.stepThree }[step];

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <span className={styles.brand}>
          <span className={styles.dot} aria-hidden="true" />
          block_to_text.py
        </span>
        <nav className={styles.tabs} role="tablist" aria-label="Steps">
          {definitions.presets.map((p, i) => (
            <button
              key={p.name}
              type="button"
              role="tab"
              aria-selected={step === p.name}
              className={styles.tab}
              onClick={() => engineRef.current?.applyPreset(p.name)}
            >
              <span className={styles.step}>{i + 1}</span>
              {p.label}
            </button>
          ))}
        </nav>
      </header>

      <p className={styles.hint}>{hints[step]}</p>

      <main className={`${styles.grid} ${layout}`}>
        <section className={`${styles.pane} ${styles.toolbox}`} aria-label="Toolbox">
          <h2 className={styles.paneTitle}>Toolbox</h2>
          <div ref={toolboxRef} className={styles.toolboxBody} />
        </section>
        <section className={`${styles.pane} ${styles.workspace}`} aria-label="Blocks">
          <h2 className={styles.paneTitle}>{step === "python-text" ? "Python blocks" : "Blocks"}</h2>
          <div ref={workspaceRef} className={styles.fill} />
        </section>
        <section
          className={`${styles.pane} ${styles.mirror}`}
          aria-label="Python blocks mirror"
          hidden={step !== "blocks-and-python"}
        >
          <h2 className={styles.paneTitle}>Python blocks · follows along</h2>
          <div ref={mirrorRef} className={styles.fill} />
        </section>
        <section className={`${styles.pane} ${styles.code}`} aria-label="Python editor" hidden={!preset?.codespace}>
          <h2 className={styles.paneTitle}>main.py</h2>
          <div ref={codespaceRef} className={styles.fill} />
        </section>
        <section className={`${styles.pane} ${styles.output}`} aria-label="Output">
          <div className={styles.outputHead}>
            <h2 className={styles.paneTitle}>Output</h2>
            <button type="button" className={styles.run} onClick={run}>
              ▶ Run
            </button>
          </div>
          <pre ref={outputRef} className={styles.outputBody} aria-live="polite">
            {output.lines.join("\n")}
            {output.error && <span className={styles.error}>{`${output.lines.length ? "\n" : ""}Error: ${output.error}`}</span>}
            {!output.lines.length && !output.error && <span className={styles.quiet}>The program printed nothing.</span>}
          </pre>
        </section>
      </main>
    </div>
  );
}
