<script lang="ts">
  import { onMount } from "svelte";
  import { MorphicBlocks } from "morphic-blocks";
  import definitions from "./definitions.json";
  import { behaviors } from "./behaviors";
  import program from "./program.json";
  import { recordProgram, type Pose, type Step } from "./turtle";
  import { penColor } from "./pens";
  import { StayInView } from "./stay-in-view";

  const START: Pose = { x: 0, y: 0, heading: 0, color: "ink" };
  const LINE_WIDTH = 5;

  let toolboxEl: HTMLDivElement;
  let workspaceEl: HTMLDivElement;
  let previewEl: HTMLDivElement;
  let spotEl: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let engine: MorphicBlocks;

  // Positions are relative to "home", the middle of the free paper area, so
  // the drawing moves along when the window changes size. `view` is how far
  // the paper was dragged and how much it was zoomed.
  let home = $state({ x: 0, y: 0 });
  let view = $state({ x: 0, y: 0, scale: 1 });
  let pose = $state<Pose>({ ...START });
  let running = $state(false);
  let message = $state("");
  let codeOpen = $state(false);

  type Line = { from: Pose; to: Pose };
  let lines: Line[] = [];
  let partial: Line | null = null;
  let frame = 0;

  function draw() {
    const ratio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(home.x + view.x, home.y + view.y);
    ctx.scale(view.scale, view.scale);
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = "round";
    for (const line of partial ? [...lines, partial] : lines) {
      ctx.strokeStyle = penColor(line.to.color);
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    }
  }

  // Zoom around a point on the screen, so what is under it stays put.
  function zoomAt(x: number, y: number, factor: number) {
    const scale = Math.min(4, Math.max(0.25, view.scale * factor));
    const wx = (x - home.x - view.x) / view.scale;
    const wy = (y - home.y - view.y) / view.scale;
    view = { x: x - home.x - wx * scale, y: y - home.y - wy * scale, scale };
    draw();
  }

  // One finger or the mouse drags the paper; two fingers also pinch to zoom.
  const pointers = new Map<number, { x: number; y: number }>();

  function onPointerDown(event: PointerEvent) {
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) return;
    const before = [...pointers.values()];
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...pointers.values()];
    const mid = (points: { x: number; y: number }[]) => ({
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    });
    if (after.length === 1) {
      view = { ...view, x: view.x + after[0].x - before[0].x, y: view.y + after[0].y - before[0].y };
      draw();
    } else if (after.length === 2) {
      const [a, b] = [mid(before), mid(after)];
      const spread = (p: { x: number; y: number }[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1;
      view = { ...view, x: view.x + b.x - a.x, y: view.y + b.y - a.y };
      zoomAt(b.x, b.y, spread(after) / spread(before));
    }
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
  }

  function layout() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    const rect = spotEl.getBoundingClientRect();
    home = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    draw();
  }

  // How long a step takes to play. Long programs play faster, so even a
  // big drawing is done within about ten seconds.
  function durations(steps: Step[]) {
    const base = steps.map((step) => {
      if (step.kind === "move") return Math.hypot(step.to.x - step.from.x, step.to.y - step.from.y) / 0.3;
      if (step.kind === "turn") return Math.abs(step.to.heading - step.from.heading) / 0.6;
      return 150;
    });
    const total = base.reduce((sum, ms) => sum + ms, 0);
    const speedUp = Math.max(1, total / 10000);
    return base.map((ms) => ms / speedUp);
  }

  function run() {
    if (running) return;
    message = "";
    const { steps, error } = recordProgram(engine.generateJavaScript(), pose);
    if (error) message = error.message;
    play(steps);
  }

  function play(steps: Step[]) {
    const times = durations(steps);
    let index = 0;
    let started = performance.now();
    running = true;

    const tick = (now: number) => {
      while (index < steps.length) {
        const step = steps[index];
        const t = Math.min(1, (now - started) / (times[index] || 1));
        if (step.kind === "color") {
          pose = step.to;
        } else {
          const at: Pose = {
            x: step.from.x + (step.to.x - step.from.x) * t,
            y: step.from.y + (step.to.y - step.from.y) * t,
            heading: step.from.heading + (step.to.heading - step.from.heading) * t,
            color: step.to.color,
          };
          pose = at;
          partial = step.kind === "move" ? { from: step.from, to: at } : null;
        }
        if (t < 1) break;
        if (step.kind === "move") lines.push({ from: step.from, to: step.to });
        partial = null;
        started += times[index];
        index++;
      }
      draw();
      if (index < steps.length) frame = requestAnimationFrame(tick);
      else running = false;
    };
    frame = requestAnimationFrame(tick);
  }

  function clear() {
    cancelAnimationFrame(frame);
    running = false;
    message = "";
    lines = [];
    partial = null;
    pose = { ...START };
    view = { x: 0, y: 0, scale: 1 };
    draw();
  }

  onMount(() => {
    engine = new MorphicBlocks(definitions, behaviors);
    void engine.mount({
      workspaceContainer: workspaceEl,
      // The program in Logo, shown read only in the </> popup.
      previewContainer: previewEl,
      previewTheme: {
        background: "#fffdf8",
        foreground: "#3b2f2a",
        gutterBackground: "#fbf3e4",
        gutterForeground: "#b9a88f",
        selectionBackground: "#f6e3c2",
        fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
        fontSize: "15px",
        lineHeight: 1.6,
      },
      // The toolbox is mounted below without its "Mode" label: this app
      // shows no words at all.
      canvasToolbox: true,
      modesFolder: import.meta.glob("./modes/*.css", { eager: true, query: "?inline" }),
      blockly: {
        renderer: "zelos",
        trashcan: true,
        zoom: { controls: true, startScale: 0.9 },
        move: { scrollbars: true, drag: true, wheel: true },
        // Keeps the view from wandering far away from the program.
        plugins: { metricsManager: StayInView },
        theme: {
          name: "turtle-drawing",
          base: "classic",
          componentStyles: {
            workspaceBackgroundColour: "#fffdf8",
            scrollbarColour: "#e3cfb2",
            scrollbarOpacity: 0.8,
          },
        },
      },
    });
    engine.mountToolbox(toolboxEl, { modeLabel: false });
    engine.loadWorkspace(program);
    engine.getWorkspace()?.scroll(0, 0);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * 0.0015));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") codeOpen = false;
    };
    window.addEventListener("keydown", onKey);

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(spotEl);
    return () => {
      observer.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(frame);
      engine.dispose();
    };
  });
</script>

<!-- The paper: a patterned background and the canvas the turtle draws on,
     which can be dragged and zoomed. -->
<div class="paper fixed inset-0"></div>
<canvas
  bind:this={canvas}
  class="fixed inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
  aria-label="Drawing"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
></canvas>

<!-- The turtle, with a ring in the current pen color. -->
<div
  class="pointer-events-none fixed top-0 left-0 z-10 size-14"
  style="transform: translate({home.x + view.x + pose.x * view.scale - 28}px, {home.y + view.y + pose.y * view.scale - 28}px) scale({view.scale}) rotate({pose.heading}deg);"
>
  <div class="absolute inset-1 rounded-full opacity-30" style="background: {penColor(pose.color)};"></div>
  <img src="icons/turtle.svg" alt="" class="relative size-14" />
</div>

<div class="fixed inset-0 z-20 flex flex-col gap-3 p-3 pointer-events-none md:flex-row md:gap-4 md:p-5">
  <!-- The free paper area. The turtle's home is in its middle. -->
  <div class="relative min-h-0 flex-1 md:order-3">
    <!-- On phones the home spot stays clear of the buttons above it. -->
    <div bind:this={spotEl} class="absolute inset-x-0 top-20 bottom-0 md:top-0"></div>
    <div class="pointer-events-auto absolute top-0 right-0 flex gap-3">
      <button
        type="button"
        onclick={clear}
        aria-label="Clear"
        class="grid size-16 place-items-center rounded-full bg-wipe text-white shadow-[inset_0_-5px_0_var(--wipe-dark),0_6px_14px_var(--shadow)] transition active:translate-y-0.5 md:size-20"
      >
        <svg viewBox="0 0 32 32" class="size-8 md:size-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l8 8-11 11H9l-4-4z" /><path d="M12 12l8 8" /><path d="M15 25h12" /></svg>
      </button>
      <button
        type="button"
        onclick={run}
        disabled={running}
        aria-label="Run"
        class="grid size-16 place-items-center rounded-full bg-go text-white shadow-[inset_0_-5px_0_var(--go-dark),0_6px_14px_var(--shadow)] transition active:translate-y-0.5 disabled:opacity-60 md:size-20"
      >
        <svg viewBox="0 0 32 32" class="ml-1 size-8 md:size-10" fill="currentColor"><path d="M9 5.5v21a1.5 1.5 0 0 0 2.3 1.3l16-10.5a1.5 1.5 0 0 0 0-2.6l-16-10.5A1.5 1.5 0 0 0 9 5.5z" /></svg>
      </button>
    </div>
    <!-- Zoom buttons in the bottom right corner. -->
    <div class="pointer-events-auto absolute right-0 bottom-0 flex flex-col gap-2">
      <button type="button" aria-label="Zoom in" onclick={() => zoomAt(home.x, home.y, 1.25)} class="small-button">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      <button type="button" aria-label="Zoom out" onclick={() => zoomAt(home.x, home.y, 0.8)} class="small-button">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14" /></svg>
      </button>
    </div>
    {#if message}
      <div
        role="alert"
        class="pointer-events-auto absolute top-20 left-1/2 md:top-auto md:bottom-0 flex w-max max-w-full -translate-x-1/2 items-center gap-3 rounded-3xl bg-card px-4 py-3 font-bold shadow-lg ring-4 ring-wipe text-ink"
      >
        <img src="icons/turtle.svg" alt="" class="size-10 rotate-90" />
        <span>{message}</span>
      </div>
    {/if}
  </div>

  <!-- The toolbox column: one big tile per block, dragged onto the
       workspace, and at the bottom of the page the </> button for parents
       and teachers. -->
  <div class="pointer-events-none relative flex shrink-0 items-start gap-3 md:order-1 md:flex-col md:self-stretch">
    <div
      bind:this={toolboxEl}
      class="toolbox pointer-events-auto flex min-w-0 flex-1 justify-center gap-2.5 overflow-auto rounded-[28px] bg-card p-3 shadow-[0_10px_30px_var(--shadow)] md:flex-none md:flex-col md:justify-start"
      aria-label="Blocks"
    ></div>
    <!-- For parents and teachers: the program in Logo, a read only
         Morphic Blocks preview view. -->
    <div
      role="dialog"
      aria-label="The program in Logo"
      hidden={!codeOpen}
      class="pointer-events-auto absolute top-full right-0 z-30 mt-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-card shadow-[0_10px_30px_var(--shadow)] ring-1 ring-black/10 md:top-auto md:right-auto md:bottom-0 md:left-full md:mt-0 md:ml-4"
    >
      <button type="button" aria-label="Close" onclick={() => (codeOpen = false)} class="absolute top-2 right-2 z-10 grid size-9 place-items-center rounded-full border-2 border-ink/70 bg-card text-ink/70 hover:text-ink hover:border-ink">
        <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <div bind:this={previewEl} class="max-h-[min(16rem,30vh)] overflow-auto rounded-2xl py-2 pr-11"></div>
    </div>
    <div class="pointer-events-auto self-center md:mt-auto md:self-start">
      <button
        type="button"
        aria-label="Show the program in Logo"
        aria-expanded={codeOpen}
        onclick={() => (codeOpen = !codeOpen)}
        class="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink/70 bg-card font-mono text-sm font-bold text-ink/70 shadow-[0_6px_14px_var(--shadow)] hover:border-ink hover:text-ink"
      >
        &lt;/&gt;
      </button>
    </div>
  </div>

  <!-- The workspace, where the program is built. -->
  <div
    class="pointer-events-auto relative h-[42vh] shrink-0 overflow-hidden rounded-[28px] border-4 border-card bg-card shadow-[0_10px_30px_var(--shadow)] md:order-2 md:h-auto md:w-[380px]"
  >
    <div bind:this={workspaceEl} class="h-full w-full"></div>
  </div>
</div>
