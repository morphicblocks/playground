// The turtle the generated program talks to. It draws nothing itself: it
// writes down every move, so the page can play them back step by step.

export type Pose = { x: number; y: number; heading: number; color: string };

export type Step =
  | { kind: "move"; from: Pose; to: Pose }
  | { kind: "turn"; from: Pose; to: Pose }
  | { kind: "color"; to: Pose };

export class LoopLimitError extends Error {}

/** More rounds than this, counted over all loops, stop the program. */
export const MAX_ROUNDS = 1000;

export function recordProgram(code: string, start: Pose) {
  const steps: Step[] = [];
  let pose = { ...start };
  const go = (kind: "move" | "turn", to: Pose) => {
    steps.push({ kind, from: pose, to });
    pose = to;
  };

  // Heading 0 points up; angles grow clockwise, like a compass.
  const turtle = {
    forward(distance: number) {
      const rad = (pose.heading * Math.PI) / 180;
      go("move", { ...pose, x: pose.x + Math.sin(rad) * distance, y: pose.y - Math.cos(rad) * distance });
    },
    right(angle: number) {
      go("turn", { ...pose, heading: pose.heading + angle });
    },
    left(angle: number) {
      go("turn", { ...pose, heading: pose.heading - angle });
    },
    color(color: string) {
      pose = { ...pose, color };
      steps.push({ kind: "color", to: pose });
    },
  };

  let rounds = 0;
  const loop = () => {
    if (++rounds > MAX_ROUNDS) throw new LoopLimitError(`stopped after ${MAX_ROUNDS} rounds, the loop may never end`);
  };

  // Why the app runs the code itself: engine.runJavaScript() hands the
  // program nothing but `console`, and this program needs a turtle (and the
  // loop counter). So the app takes the JavaScript from
  // engine.generateJavaScript() and runs it with its own names passed in.
  let error: Error | null = null;
  try {
    new Function("turtle", "loop", code)(turtle, loop);
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e));
  }
  return { steps, error };
}
