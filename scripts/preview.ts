#!/usr/bin/env bun
/**
 * `bun run preview`: build the whole playground, then serve it locally so the
 * gallery's cards open the real apps, exactly as deployed. PORT picks the port.
 */
import { serveDist } from './serve';

const root = new URL('..', import.meta.url).pathname;
const build = Bun.spawnSync(['bun', 'run', 'build'], { cwd: root, stdout: 'inherit', stderr: 'inherit' });
if (build.exitCode !== 0) process.exit(build.exitCode ?? 1);

const server = serveDist(Number(process.env.PORT ?? 4321));
console.log(`\n▸ playground at http://localhost:${server.port}/ (Ctrl+C to stop)`);
