// The pen colors, by the names the programs use (turtle.color("blue"),
// "pen blue" in the Logo view).
export const pens = {
  ink: "#2b2d42",
  red: "#e63946",
  orange: "#f4842c",
  yellow: "#f2c230",
  green: "#2a9d5c",
  blue: "#3a86ff",
  purple: "#8e5ea2",
};

export type PenColor = keyof typeof pens;

/** The color a pen name draws with. */
export const penColor = (name: string) => pens[name as PenColor] ?? pens.ink;
