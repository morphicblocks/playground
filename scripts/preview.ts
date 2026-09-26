#!/usr/bin/env bun
/**
 * `bun run preview`: build the whole playground, then serve it locally so the
 * gallery's cards open the real apps, exactly as deployed. PORT picks the port.
 */
import { networkInterfaces } from 'node:os';
import { serveDist } from './serve';

const root = new URL('..', import.meta.url).pathname;
const build = Bun.spawnSync(['bun', 'run', 'build'], { cwd: root, stdout: 'inherit', stderr: 'inherit' });
if (build.exitCode !== 0) process.exit(build.exitCode ?? 1);

const server = serveDist(Number(process.env.PORT ?? 4321));

// The server listens on every network interface, so phones on the same
// network can open it too, e.g. to test touch.
const network = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === 'IPv4' && !net.internal)
  .map((net) => `http://${net!.address}:${server.port}/`);
console.log(`\n▸ playground at http://localhost:${server.port}/`);
for (const url of network) console.log(`  on your network: ${url}`);
console.log('  (Ctrl+C to stop)');
