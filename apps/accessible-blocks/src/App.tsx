import { MorphicBlocks, type MorphicCodeEditorTheme } from "morphic-blocks";
import { useEffect, useRef, useState } from "preact/hooks";
import { behaviors } from "./behaviors";
import definitions from "./definitions.json";
import javaCss from "./modes/java.css";
import symbolsCss from "./modes/symbols.css";
import wordsCss from "./modes/words.css";
import program from "./program.json";
import { SIZE_MAX, SIZE_MIN, loadSettings, saveSettings, type Level, type Settings } from "./settings";

// Symbols, Words and Java are modes: they change what a block says. Each
// has a twin with "-help" that also shows the explanation on its tile, and
// definitions.json has a preset for every pair.
const levels: { id: Level; label: string; mode: string; preview: string }[] = [
  { id: "symbols", label: "Symbols", mode: "with-symbols", preview: "plain words" },
  { id: "words", label: "Words", mode: "in-words", preview: "Java" },
  { id: "java", label: "Java", mode: "in-java", preview: "plain words" },
];
const levelOf = (id: Level) => levels.find((level) => level.id === id)!;
const presetName = (settings: Settings) => (settings.help ? `${settings.level}-help` : settings.level);

const modeStyles = {
  "with-symbols": symbolsCss,
  "with-symbols-help": symbolsCss,
  "in-words": wordsCss,
  "in-words-help": wordsCss,
  "in-java": javaCss,
  "in-java-help": javaCss,
};

// The text size changes how things look, not what they say: Blockly's zoom
// for the workspace, CSS for everything else.
const scaleOf = (settings: Settings) => settings.size / 100;

// Code view colors per look; the page's own colors live in style.css.
const codeColors = {
  light: { background: "#fffdf8", foreground: "#111111", gutterBackground: "#f6f1e7", gutterForeground: "#6b6358", selectionBackground: "#efe3ff" },
  dark: { background: "#1d1928", foreground: "#ece7f5", gutterBackground: "#1d1928", gutterForeground: "#a197b5", selectionBackground: "#3d2e5c" },
  lightContrast: { background: "#ffffff", foreground: "#000000", gutterBackground: "#ffffff", gutterForeground: "#000000", selectionBackground: "#ffe066" },
  darkContrast: { background: "#000000", foreground: "#ffffff", gutterBackground: "#000000", gutterForeground: "#ffffff", selectionBackground: "#665200" },
};

function codeTheme(settings: Settings): MorphicCodeEditorTheme {
  const look = settings.dark ? (settings.contrast ? "darkContrast" : "dark") : settings.contrast ? "lightContrast" : "light";
  return {
    ...codeColors[look],
    fontFamily: settings.dyslexia ? '"OpenDyslexic", monospace' : 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    fontSize: `${Math.round(15 * scaleOf(settings))}px`,
    lineHeight: 1.6,
  };
}

/** Wait for the dyslexia font, so blocks are measured with it, not before. */
const dyslexiaFontReady = () =>
  Promise.all([document.fonts.load('400 16px "OpenDyslexic"'), document.fonts.load('700 16px "OpenDyslexic"')]);

export function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [output, setOutput] = useState<{ lines: string[]; error?: string }>({ lines: [] });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const engine = useRef<MorphicBlocks>();
  // The settings the engine shows right now, to tell what changed.
  const applied = useRef<Settings>();
  const toolboxEl = useRef<HTMLDivElement>(null);
  const workspaceEl = useRef<HTMLDivElement>(null);
  const previewEl = useRef<HTMLDivElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const change = (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch }));

  const run = () => {
    const result = engine.current?.runJavaScript();
    if (!result) return;
    setOutput({ lines: result.output.map((line) => line.text), error: result.error?.message });
  };

  useEffect(() => {
    const created = new MorphicBlocks(definitions, behaviors);
    engine.current = created;
    const mounted = created.mount({
      workspaceContainer: workspaceEl.current!,
      previewContainer: previewEl.current!,
      preset: presetName(settings),
      modeStyles,
      previewTheme: codeTheme(settings),
      // The toolbox is mounted below, so Blockly builds none itself.
      canvasToolbox: true,
      blockly: {
        // Zelos has large, rounded blocks that are easy to hit.
        renderer: "zelos",
        trashcan: true,
        zoom: { controls: true, wheel: false, startScale: scaleOf(settings) },
        theme: {
          name: "accessible-blocks",
          base: "classic",
          // The page's CSS paints the workspace, so each look can change it.
          componentStyles: { workspaceBackgroundColour: "transparent", scrollbarColour: "#8a7fa3" },
        },
      },
    });
    // The toolbox is mounted on its own because only this call can leave out
    // the "Mode:" label; mount() always shows it.
    created.mountToolbox(toolboxEl.current!, { modeLabel: false });
    created.loadWorkspace(program);
    created.getWorkspace()?.scroll(0, 0);
    // Show what the starting program prints once everything is set up, so
    // the output matches the blocks on screen.
    void mounted.then(run);
    return () => created.dispose();
  }, []);

  // Every change of level or look goes through here, so the page, the modes
  // and Blockly always agree.
  useEffect(() => {
    saveSettings(settings);
    const root = document.documentElement;
    root.style.fontSize = `${settings.size}%`;
    root.style.setProperty("--tile-zoom", String(scaleOf(settings)));
    root.dataset.bsTheme = settings.dark ? "dark" : "light";
    root.classList.toggle("dark", settings.dark);
    root.classList.toggle("high-contrast", settings.contrast);
    root.classList.toggle("dyslexia", settings.dyslexia);

    let cancelled = false;
    void (async () => {
      if (settings.dyslexia) await dyslexiaFontReady();
      const current = engine.current;
      if (cancelled || !current) return;
      const before = applied.current;
      applied.current = settings;
      // Each level comes as a preset with and without explanations in the
      // toolbox, so one call switches every view.
      const preset = presetName(settings);
      if (current.getActivePreset()?.name !== preset) current.applyPreset(preset);
      // Setting the workspace mode again measures its blocks again, so a new
      // block font takes effect (also on load, when the font was saved as on
      // and arrived after the first measuring).
      if (before ? before.dyslexia !== settings.dyslexia : settings.dyslexia) {
        current.setModes({ workspaceMode: levelOf(settings.level).mode });
      }
      current.getWorkspace()?.setScale(scaleOf(settings));
      current.setPreviewTheme(codeTheme(settings));
    })();
    return () => {
      cancelled = true;
    };
  }, [settings]);

  // The settings panel is a dialog: Escape closes it, and focus moves into it
  // and back to its button.
  useEffect(() => {
    if (!settingsOpen) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSettingsOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      settingsButton.current?.focus();
    };
  }, [settingsOpen]);

  const level = levelOf(settings.level);

  return (
    <>
      <a class="skip-link" href="#workspace">
        Skip to your program
      </a>
      <div class="shell" inert={settingsOpen}>
        <header class="app-bar">
          <div class="brand">
            <img src="logo.svg" alt="" width="36" height="36" />
            <h1>Accessible Blocks</h1>
          </div>
          <div class="btn-group level-switch" role="radiogroup" aria-label="Show blocks as">
            {levels.map((option) => (
              <>
                <input
                  type="radio"
                  class="btn-check"
                  name="level"
                  id={`level-${option.id}`}
                  checked={settings.level === option.id}
                  onChange={() => change({ level: option.id })}
                />
                <label class="btn btn-level" for={`level-${option.id}`}>
                  {option.label}
                </label>
              </>
            ))}
          </div>
          <button
            ref={settingsButton}
            type="button"
            class="btn btn-settings"
            aria-expanded={settingsOpen}
            aria-controls="settings"
            onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
        </header>

        <main class="app-grid">
          <section class="pane toolbox-pane" aria-labelledby="toolbox-title">
            <h2 id="toolbox-title">Blocks</h2>
            <p class="pane-hint">Drag a block into your program.</p>
            <div ref={toolboxEl} class="toolbox" />
          </section>

          <section class="pane workspace-pane" aria-labelledby="workspace-title">
            <h2 id="workspace-title">Your program</h2>
            <div ref={workspaceEl} id="workspace" class="workspace" tabIndex={-1} />
          </section>

          <aside class="side">
            <section class="pane" aria-labelledby="preview-title">
              <h2 id="preview-title">The same program in {level.preview}</h2>
              <div ref={previewEl} class="preview" />
            </section>
            <section class="pane" aria-labelledby="output-title">
              <div class="output-head">
                <h2 id="output-title">Output</h2>
                <button type="button" class="btn btn-run" onClick={run}>
                  Run
                </button>
              </div>
              <pre class="output" aria-live="polite">
                {output.lines.join("\n")}
                {output.error && <span class="output-error">{`\n${output.error}`}</span>}
                {output.lines.length === 0 && !output.error && "The program showed nothing."}
              </pre>
            </section>
          </aside>
        </main>
      </div>

      <div
        id="settings"
        class={`offcanvas offcanvas-end settings${settingsOpen ? " show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}>
        <div class="offcanvas-header">
          <h2 id="settings-title" class="offcanvas-title">
            Settings
          </h2>
          <button
            ref={closeButton}
            type="button"
            class="btn-close"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
          />
        </div>
        <div class="offcanvas-body">
          <p class="settings-intro">
            Symbols, Words and Java change what the blocks say. These settings change how everything looks.
          </p>

          <div class="mb-4">
            <label class="form-label size-label" for="setting-size">
              Text size <output for="setting-size">{settings.size}%</output>
            </label>
            <input
              type="range"
              class="form-range"
              id="setting-size"
              min={SIZE_MIN}
              max={SIZE_MAX}
              step={10}
              value={settings.size}
              aria-valuetext={`${settings.size} percent`}
              onInput={(event) => change({ size: Number(event.currentTarget.value) })}
            />
          </div>

          {(
            [
              ["dark", "Dark theme", "Light text on a dark background."],
              ["contrast", "High contrast", "The strongest difference between text and background, with outlined blocks."],
              ["dyslexia", "Font for dyslexia", "OpenDyslexic, with heavier letter bottoms."],
              ["help", "Explain each block", "A short explanation under every block in the toolbox."],
            ] as const
          ).map(([key, label, hint]) => (
            <div class="form-check form-switch setting">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id={`setting-${key}`}
                aria-describedby={`setting-${key}-hint`}
                checked={settings[key]}
                onChange={(event) => change({ [key]: event.currentTarget.checked })}
              />
              <label class="form-check-label" for={`setting-${key}`}>
                {label}
              </label>
              <div id={`setting-${key}-hint`} class="form-text">
                {hint}
              </div>
            </div>
          ))}

          <p class="settings-note">
            The block colors are chosen so that people with color blindness can tell them apart, and every
            block also says what it does in words, so nothing depends on color alone.
          </p>
        </div>
      </div>
      {settingsOpen && <div class="offcanvas-backdrop fade show" onClick={() => setSettingsOpen(false)} />}
    </>
  );
}
