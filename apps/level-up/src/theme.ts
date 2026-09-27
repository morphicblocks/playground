// Colors Blockly and the favicon need as values; page colors live in style.css.
export const theme = {
  workspace: "#12303d",
  grid: "#1f4758",
  scrollbar: "#2c5a6d",
  // The favicon cannot read CSS variables, so it gets fixed colors.
  ink: "#e3f1f6",
  accent: "#35a8cf",
};

/** The logo: three rising steps, the last one in the accent color. */
export const logoSvg = (ink: string, accent: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">` +
  `<rect x="6" y="40" width="16" height="18" rx="3" fill="${ink}"/>` +
  `<rect x="24" y="26" width="16" height="32" rx="3" fill="${ink}" opacity=".75"/>` +
  `<rect x="42" y="10" width="16" height="48" rx="3" fill="${accent}"/></svg>`;
