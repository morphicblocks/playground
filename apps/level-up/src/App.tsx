import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { MorphicBlocks, toCleanId } from "morphic-blocks";
import definitions from "./definitions.json";
import { logoSvg, theme } from "./theme";
import { behaviors } from "./behaviors";
import program from "./program.json";
import { modesFolder } from "./modes";

// Level n offers the blocks of the first n categories, so every level keeps
// everything before it.
const levels = [
  { topic: "Output", category: "Output" },
  { topic: "Variables and math", category: "Variables" },
  { topic: "Decisions", category: "Decisions" },
  { topic: "Loops", category: "Loops" },
  { topic: "Functions", category: "Functions" },
];
const colorOf = (category: string) => definitions.categories.find((c) => c.name === category)?.color;
const blocksUpTo = (level: number) => {
  const open = new Set(levels.slice(0, level).map((l) => l.category));
  return definitions.blocks.filter((b) => open.has(b.category)).map((b) => b.identifier);
};

// Asking once per browser session is enough; after a refresh the question is
// back, so a new learner at the same computer still sees it.
const SKIP_KEY = "level-up:skip-remove-dialog";
const readSkip = () => {
  try {
    return sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
};
const saveSkip = () => {
  try {
    sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    // Storage may be blocked; the dialog then simply keeps asking.
  }
};


// JavaScript's wording for mistakes it finds itself, in Python's words.
const pythonError = (error: Error) => {
  const message = error.message;
  if (error instanceof SyntaxError && /break/.test(message)) return "SyntaxError: 'break' outside loop";
  if (error instanceof RangeError) return "RecursionError: maximum recursion depth exceeded";
  return /^\w+Error:/.test(message) ? message : `Error: ${message}`;
};

// Blockly's block type, reached through the engine (Blockly is not a
// direct dependency of the app).
type Workspace = NonNullable<ReturnType<MorphicBlocks["getWorkspace"]>>;
type Block = ReturnType<Workspace["getAllBlocks"]>[number];
const insideDef = (block: Block | null): boolean =>
  !!block && (toCleanId(block.type) === "def" || insideDef(block.getSurroundParent()));

type Removal = { level: number; count: number; apply: () => void };

export function App() {
  let toolboxEl!: HTMLDivElement;
  let workspaceEl!: HTMLDivElement;
  let dialogEl!: HTMLDialogElement;
  let outputEl!: HTMLPreElement;
  let engine: MorphicBlocks | undefined;

  const [level, setLevel] = createSignal(1);
  const [lines, setLines] = createSignal<string[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal<Removal | null>(null);
  const [dontAsk, setDontAsk] = createSignal(false);

  const run = () => {
    if (!engine) return;
    // The program runs as the body of a JavaScript function, where a stray
    // return is allowed. Python refuses to start such a program, so do that.
    const stray = engine
      .getWorkspace()
      ?.getAllBlocks(false)
      .some((b) => toCleanId(b.type) === "return" && !insideDef(b));
    if (stray) {
      setLines([]);
      setError("SyntaxError: 'return' outside function");
      return;
    }
    const result = engine.runJavaScript();
    setLines(result.output.map((line) => line.text));
    setError(result.error ? pythonError(result.error) : null);
    // Keep the end in view: that is where an error shows up.
    queueMicrotask(() => (outputEl.scrollTop = outputEl.scrollHeight));
  };

  // mount() always shows every block, so the toolbox is set up on its own
  // with the level's subset, and set up again whenever the level changes.
  const showToolbox = (n: number) => {
    engine?.mountToolbox(toolboxEl, { blocks: blocksUpTo(n), modeLabel: false });
    const newest = levels[n - 1].category.toLowerCase();
    toolboxEl.dataset.newest = newest;
    // Bring the level's new blocks into view; the older ones sit above.
    const group = toolboxEl.querySelector<HTMLElement>(`[data-category="${newest}"]`);
    toolboxEl.scrollTop = group ? group.offsetTop : 0;
  };

  // Which blocks a lower level would take away: every block it does not
  // have, together with what sits inside it. Default values (shadows) do not
  // count; they belong to the block around them.
  const planRemoval = (n: number): Removal => {
    const workspace = engine!.getWorkspace()!;
    const allowed = new Set(blocksUpTo(n));
    const goes = (block: Block | null): boolean =>
      !!block && (!allowed.has(toCleanId(block.type)) || goes(block.getSurroundParent()));
    const doomed = workspace.getAllBlocks(false).filter((b) => !b.isShadow() && goes(b));
    const outermost = doomed.filter((b) => !allowed.has(toCleanId(b.type)) && !goes(b.getSurroundParent()));
    return {
      level: n,
      count: doomed.length,
      // A statement leaves a gap that the blocks below close; a value simply
      // leaves its slot (its default value comes back, if it has one).
      apply: () => outermost.forEach((b) => b.dispose(!!b.previousConnection)),
    };
  };

  const goTo = (n: number) => {
    if (n === level()) return;
    if (n < level()) {
      const removal = planRemoval(n);
      if (removal.count > 0 && !readSkip()) {
        setDontAsk(false);
        setPending(removal);
        dialogEl.showModal();
        return;
      }
      removal.apply();
    }
    setLevel(n);
    showToolbox(n);
  };

  const closeDialog = (confirmed: boolean) => {
    const removal = pending();
    dialogEl.close();
    setPending(null);
    if (!confirmed || !removal) return;
    if (dontAsk()) saveSkip();
    removal.apply();
    setLevel(removal.level);
    showToolbox(removal.level);
  };

  onMount(() => {
    engine = new MorphicBlocks(definitions, behaviors);
    void engine.mount({
      workspaceContainer: workspaceEl,
      // The toolbox is set up by showToolbox, so Blockly builds none itself.
      canvasToolbox: true,
      modesFolder,
      blockly: {
        renderer: "thrasos",
        trashcan: true,
        zoom: { controls: true, wheel: true, startScale: 1 },
        grid: { spacing: 28, length: 1, colour: theme.grid, snap: true },
        theme: {
          name: "level-up",
          base: "classic",
          componentStyles: {
            workspaceBackgroundColour: theme.workspace,
            scrollbarColour: theme.scrollbar,
            scrollbarOpacity: 0.7,
          },
        },
      },
    });
    showToolbox(level());
    engine.loadWorkspace(program);
    engine.getWorkspace()?.scroll(0, 0);
    // Show what the starting program prints; Run refreshes it later.
    run();
  });

  onCleanup(() => engine?.dispose());

  return (
    <div class="shell">
      <header class="top">
        <div class="brand">
          {/* The same logo as the favicon, colored by the page's CSS variables. */}
          <div class="logo" innerHTML={logoSvg("var(--ink)", "var(--accent)")} />
          <div class="brand-text">
            <span class="brand-name">Level Up</span>
            <span class="brand-sub">Python, one step at a time</span>
          </div>
        </div>
        <nav class="stairs" aria-label="Levels">
          <For each={levels}>
            {(item, i) => {
              const n = i() + 1;
              return (
                <button
                  type="button"
                  class="step"
                  classList={{ reached: n <= level(), current: n === level() }}
                  style={{ "--step-color": colorOf(item.category), "--rise": String(n) }}
                  aria-pressed={n === level()}
                  onClick={() => goTo(n)}
                >
                  <span class="step-number">Level {n}</span>
                  <span class="step-topic">{item.topic}</span>
                  <span class="step-bar" aria-hidden="true" />
                </button>
              );
            }}
          </For>
        </nav>
      </header>

      <main class="panes">
        <section class="pane toolbox" aria-label="Toolbox">
          <h2 class="pane-title">
            Blocks at level {level()}
          </h2>
          <div ref={toolboxEl} class="toolbox-body" />
        </section>

        <section class="pane workspace" aria-label="Your program">
          <h2 class="pane-title">Your program</h2>
          <div ref={workspaceEl} class="workspace-body" />
        </section>

        <section class="pane output" aria-label="Output">
          <div class="output-head">
            <h2 class="pane-title">Output</h2>
            <button type="button" class="run" onClick={run}>
              Run
            </button>
          </div>
          <pre ref={outputEl} class="output-body" aria-live="polite">
            {lines().join("\n")}
            <Show when={error()}>
              <span class="output-error">{`${lines().length ? "\n" : ""}${error()}`}</span>
            </Show>
            <Show when={!lines().length && !error()}>
              <span class="output-quiet">The program printed nothing.</span>
            </Show>
          </pre>
        </section>
      </main>

      <dialog
        ref={dialogEl}
        class="confirm"
        aria-labelledby="confirm-text"
        // Escape counts as Cancel.
        onCancel={(e) => {
          e.preventDefault();
          closeDialog(false);
        }}
      >
        <p id="confirm-text">
          Level {pending()?.level} removes {pending()?.count} {pending()?.count === 1 ? "block" : "blocks"} it does not
          have yet.
        </p>
        <label class="confirm-check">
          <input type="checkbox" checked={dontAsk()} onChange={(e) => setDontAsk(e.currentTarget.checked)} />
          Don't show this again
        </label>
        <div class="confirm-actions">
          <button type="button" class="quiet-button" onClick={() => closeDialog(false)}>
            Cancel
          </button>
          <button type="button" class="run" onClick={() => closeDialog(true)}>
            Continue
          </button>
        </div>
      </dialog>
    </div>
  );
}
