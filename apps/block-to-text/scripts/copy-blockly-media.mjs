/**
 * Copies Blockly's images, cursors and sounds into public/blockly-media/, so
 * the app serves them itself instead of Blockly loading them from Google's
 * server. Runs before `dev` and `build`; the copy is not committed.
 */
import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Blockly comes with morphic-blocks, so look it up from there.
const require = createRequire(import.meta.url);
const blockly = dirname(require.resolve("blockly", { paths: [dirname(require.resolve("morphic-blocks"))] }));
cpSync(join(blockly, "media"), "public/blockly-media", { recursive: true });
