import type { NextConfig } from "next";

// The playground builds every app under its own subpath (BASE_PATH=/many-languages);
// unset, the app is served at the root.
const basePath = process.env.BASE_PATH ?? "";

const config: NextConfig = {
  // Plain static files in out/, no server needed.
  output: "export",
  basePath,
  // Each page becomes a folder with an index.html, which any static server finds.
  trailingSlash: true,
  // Blockly's media and the mode stylesheets are plain files, so the browser
  // code needs the base path to link them.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // The app is self contained; without this Next.js looks for lockfiles in
  // the folders above it and warns about the playground's own.
  turbopack: { root: import.meta.dirname },
};

export default config;
