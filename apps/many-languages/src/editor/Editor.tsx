"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MorphicBlocks } from "morphic-blocks";
import definitions from "./definitions.json";
import { behaviors } from "./behaviors";
import program from "./program.json";
import { byCode, languages, type Language } from "./languages";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// One stylesheet per language mode, in public/modes/. Each mode serves the
// toolbox, the workspace and the preview.
const modeStyles = Object.fromEntries(languages.map(({ code }) => [code, `${base}/modes/${code}.css`]));

// Code views get VS Code's Dark+ colors, like the page.
const previewTheme = {
  background: "#1e1e1e",
  foreground: "#d4d4d4",
  gutterBackground: "#1e1e1e",
  gutterForeground: "#858585",
  selectionBackground: "#264f78",
  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "PingFang SC", monospace',
  fontSize: "14px",
  lineHeight: 1.7,
};

// Arabic letters join, and monospace fonts break them apart into fixed cells,
// so Arabic pseudocode is set in a proportional Arabic font. Switching into or
// out of Arabic mounts again, so the preview picks its font there. (Morphic
// Blocks 0.2.1 does not apply a theme's fontFamily yet, so for now the
// preview still shows CodeMirror's monospace font.)
const arabicPreviewTheme = {
  ...previewTheme,
  fontFamily: '"Geeza Pro", "Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif',
  fontSize: "16px",
};

type Output = { lines: string[]; error: string | null };

type Views = { toolbox: HTMLElement; workspace: HTMLElement; preview: HTMLElement };

function mountEngine(engine: MorphicBlocks, language: Language, views: Views) {
  const mounted = engine.mount({
    // The toolbox is mounted below, so Blockly builds none itself.
    canvasToolbox: true,
    workspaceContainer: views.workspace,
    previewContainer: views.preview,
    preset: language.preset,
    modeStyles,
    previewTheme: language.rtl ? arabicPreviewTheme : previewTheme,
    blockly: {
      // Blockly reads right to left only here, when it starts.
      rtl: language.rtl,
      // Served by the app itself (scripts/copy-blockly-media.mjs), never by Google.
      media: `${base}/blockly-media/`,
      trashcan: true,
      zoom: { controls: true, wheel: true, startScale: 0.9 },
      grid: { spacing: 24, length: 2, colour: "#2d2d2d", snap: true },
      theme: {
        name: "many-languages",
        base: "classic",
        componentStyles: {
          workspaceBackgroundColour: "#1e1e1e",
          scrollbarColour: "#5a5a5a",
          scrollbarOpacity: 0.7,
        },
      },
    },
  });
  // Mounted on its own because only this call can leave out the "Mode:"
  // label; mount() always shows it.
  engine.mountToolbox(views.toolbox, { modeLabel: false });
  return mounted;
}

// Blockly starts with its origin in the middle of the pane. Move the program
// to the corner where reading starts: top left, or top right in Arabic.
function showFromStart(engine: MorphicBlocks, language: Language) {
  const workspace = engine.getWorkspace();
  if (!workspace) return;
  const box = workspace.getBlocksBoundingBox();
  const width = workspace.getMetricsManager().getViewMetrics().width;
  const margin = 24 * workspace.scale;
  const x = language.rtl ? width - margin - box.right * workspace.scale : margin - box.left * workspace.scale;
  workspace.scroll(x, margin - box.top * workspace.scale);
}

// The page layout stays as it is in every language: only the content turns
// around. Each view and text element gets its own dir (see dir() below).
function applyLanguage(language: Language) {
  document.documentElement.lang = language.code;
}

export default function Editor() {
  const toolboxRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphicBlocks | null>(null);

  // A link such as #ar opens the app in that language.
  const [language, setLanguage] = useState<Language>(
    () => byCode(window.location.hash.slice(1)) ?? languages[0],
  );
  const [output, setOutput] = useState<Output | null>(null);

  const views = (): Views => ({
    toolbox: toolboxRef.current!,
    workspace: workspaceRef.current!,
    preview: previewRef.current!,
  });

  useEffect(() => {
    applyLanguage(language);
    const engine = new MorphicBlocks(definitions, behaviors);
    engineRef.current = engine;
    void mountEngine(engine, language, views());
    engine.loadWorkspace(program);
    showFromStart(engine, language);
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mounted once; later language changes go through choose().
  }, []);

  const choose = (next: Language) => {
    const engine = engineRef.current;
    if (!engine || next.code === language.code) return;
    applyLanguage(next);
    if (next.rtl !== language.rtl) {
      // Blockly cannot turn around a running workspace, so it starts again
      // in the new direction and gets the program back.
      const current = engine.serializeWorkspace();
      void mountEngine(engine, next, views());
      engine.loadWorkspace(current);
      showFromStart(engine, next);
    } else {
      engine.applyPreset(next.preset);
    }
    setLanguage(next);
    window.history.replaceState(null, "", `#${next.code}`);
  };

  const dir = language.rtl ? "rtl" : "ltr";

  const run = () => {
    const result = engineRef.current?.runJavaScript();
    if (result) setOutput({ lines: result.output.map((line) => line.text), error: result.error?.message ?? null });
  };

  return (
    <div className="page" style={{ "--line": language.line, "--line-ink": language.lineInk, "--line-text": language.lineText } as CSSProperties}>
      <header className="masthead">
        <p className="greetings" aria-hidden="true">
          {languages.map((l) => (
            <span key={l.code} lang={l.code}>
              <bdi>{l.hello}</bdi>
            </span>
          ))}
        </p>
        <h1>
          <bdi lang="en">Many Languages</bdi>
        </h1>
        <p className="intro" dir={dir}>
          {language.intro}
        </p>
        <nav className="switch" aria-label="Language">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              dir={l.rtl ? "rtl" : "ltr"}
              aria-pressed={l.code === language.code}
              onClick={() => choose(l)}
            >
              <span className="native">{l.name}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="desk">
        <section className="pane toolbox" aria-label={language.toolbox}>
          <h2 dir={dir}>{language.toolbox}</h2>
          <div ref={toolboxRef} className="toolbox-body" dir={dir} />
        </section>
        <section className="pane workspace" aria-label={language.blocks}>
          <h2 dir={dir}>{language.blocks}</h2>
          <div ref={workspaceRef} className="fill" dir={dir} />
        </section>
        <section className="pane preview" aria-label={language.pseudocode}>
          <h2 dir={dir}>{language.pseudocode}</h2>
          <div ref={previewRef} className="fill" dir={dir} />
        </section>
        <section className="pane output" aria-label={language.output}>
          <div className="output-head">
            <h2 dir={dir}>{language.output}</h2>
            <button type="button" className="run" onClick={run}>
              ▶ {language.run}
            </button>
          </div>
          <pre aria-live="polite" dir={dir}>
            {!output?.lines.length && !output?.error && <span className="quiet">{language.nothing}</span>}
            {output?.lines.join("\n")}
            {output?.error && (
              <span className="error">{`${output.lines.length ? "\n" : ""}${language.error}: ${output.error}`}</span>
            )}
          </pre>
        </section>
      </main>
    </div>
  );
}
