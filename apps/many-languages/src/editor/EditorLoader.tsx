"use client";

import dynamic from "next/dynamic";

// Blockly needs a browser, so the editor is never rendered on the server:
// the static page ships an empty frame and the editor loads in the browser.
const Editor = dynamic(() => import("./Editor"), { ssr: false });

export default function EditorLoader() {
  return <Editor />;
}
