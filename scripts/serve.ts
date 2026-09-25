/**
 * Serve the built playground (dist/) the way nginx does in production:
 * folders answer with their index.html. Used by `bun run preview` and by
 * the check script.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const dist = fileURLToPath(new URL('../dist', import.meta.url));

/** Start the server; port 0 picks a free one. */
export function serveDist(port = 0) {
  return Bun.serve({
    port,
    fetch(request) {
      const path = decodeURIComponent(new URL(request.url).pathname);
      let file = join(dist, path);
      if (!file.startsWith(dist)) return new Response('Not found', { status: 404 });
      if (existsSync(file) && statSync(file).isDirectory()) {
        // Like nginx: /starter becomes /starter/, so relative paths resolve.
        if (!path.endsWith('/')) return Response.redirect(`${path}/`, 301);
        file = join(file, 'index.html');
      }
      return existsSync(file) ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
    },
  });
}
