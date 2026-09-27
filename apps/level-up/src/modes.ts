// The mode stylesheets, one per mode, handed to mount() as a folder. This
// lives in a .ts file: Vite's dependency scan cannot read import.meta.glob
// inside a Solid .tsx file (it keeps the JSX and then fails to parse it).
export const modesFolder = import.meta.glob("./modes/*.css", { eager: true, query: "?inline" });
