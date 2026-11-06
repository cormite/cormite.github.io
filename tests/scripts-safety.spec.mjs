import { test, expect } from 'playwright/test';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { copyProject } from './helpers/project-copy.mjs';

// Regression tests for problems found by the whole-project code review. Each runs the real script in a throwaway copy
// of the project, so nothing here can touch the working tree.

test.describe('assemble-site.mjs', () => {
  test('refuses an output folder that is, or contains, the project (it deletes its output folder)', () => {
    const copy = copyProject();
    try {
      for (const out of ['.', '..', '../..', '/']) {
        const run = spawnSync(process.execPath, ['scripts/assemble-site.mjs', '--out', out], { cwd: copy.dir, encoding: 'utf8' });
        expect(run.status, `--out ${out}`).not.toBe(0);
        expect(run.stderr).toContain('Refusing to use');
        expect(fs.existsSync(path.join(copy.dir, 'index.html')), `project survived --out ${out}`).toBe(true);
        expect(fs.existsSync(path.join(copy.dir, 'scripts', 'assemble-site.mjs'))).toBe(true);
      }
      const missing = spawnSync(process.execPath, ['scripts/assemble-site.mjs', '--out'], { cwd: copy.dir, encoding: 'utf8' });
      expect(missing.status).not.toBe(0);
      expect(missing.stderr).toContain('--out needs a folder');
    } finally {
      fs.rmSync(copy.parent, { recursive: true, force: true });
    }
  });

  test('checks the references of 404.html too', () => {
    const copy = copyProject();
    try {
      const file = path.join(copy.dir, '404.html');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('</head>', '<link rel="stylesheet" href="/assets/dist/does-not-exist.css"></head>'));
      const run = spawnSync(process.execPath, ['scripts/assemble-site.mjs', '--out', path.join(copy.parent, 'out')], { cwd: copy.dir, encoding: 'utf8' });
      expect(run.status).toBe(1);
      expect(run.stderr).toContain('404.html -> /assets/dist/does-not-exist.css');
    } finally {
      fs.rmSync(copy.parent, { recursive: true, force: true });
    }
  });
});

test.describe('serve.mjs (local preview server)', () => {
  const freePort = () => new Promise((resolve) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
  const get = (port, rawPath) => new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: rawPath }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); }).on('error', reject);
  });

  test('rejects malformed URLs and sibling-folder traversal without crashing, and answers only on loopback', async () => {
    const copy = copyProject();
    // A sibling folder whose name starts with the project folder's name: a bare startsWith(root) check would accept it.
    fs.mkdirSync(path.join(copy.parent, 'project-secret'));
    fs.writeFileSync(path.join(copy.parent, 'project-secret', 'secret.txt'), 'TOP SECRET');
    const port = await freePort();
    const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: copy.dir, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
      await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('exit', () => reject(new Error('server exited early'))); });
      expect(await get(port, '/')).toBe(200);
      expect(await get(port, '/%E0%A4%A'), 'malformed escape').toBe(400);
      // path.normalize already clamps ".." at the root of an absolute URL path, so this is defence in depth, not a live hole:
      // whatever the status, the sibling folder's file must never be served.
      expect([403, 404], 'sibling folder with the same name prefix').toContain(await get(port, '/..%2fproject-secret%2fsecret.txt'));
      expect(await get(port, '/'), 'still alive after the bad requests').toBe(200);
      expect(server.exitCode).toBeNull();

      // Not reachable through any non-loopback address of this machine (skipped when it has none).
      const external = Object.values(os.networkInterfaces()).flat().find((i) => i && i.family === 'IPv4' && !i.internal);
      if (external) {
        const refused = await new Promise((resolve) => {
          const socket = net.connect({ host: external.address, port }, () => { socket.destroy(); resolve(false); });
          socket.on('error', () => resolve(true));
        });
        expect(refused, `server answered on ${external.address}`).toBe(true);
      }
    } finally {
      server.kill();
      fs.rmSync(copy.parent, { recursive: true, force: true });
    }
  });
});

test.describe('build determinism', () => {
  // The footer's month and year used to come from the wall clock and the local time zone, so a rebuild with the pinned
  // SOURCE_DATE differed from the committed pages at a month or year boundary, failing the CI reproducibility check.
  test('footer date and year follow SOURCE_DATE in UTC, whatever the clock and time zone', () => {
    const copy = copyProject();
    try {
      const cases = [
        ['2026-10-31T23:30:00Z', 'Pacific/Auckland', 'Oct 2026', '2026'], // already November 1st in Auckland
        ['2026-12-31T23:30:00Z', 'Asia/Tokyo', 'Dec 2026', '2026'],       // already January 1st in Tokyo
        ['2027-01-01T00:30:00Z', 'America/Los_Angeles', 'Jan 2027', '2027'] // still December 31st in Los Angeles
      ];
      for (const [date, tz, month, year] of cases) {
        const run = spawnSync(process.execPath, ['scripts/build-static-pages.mjs'], { cwd: copy.dir, encoding: 'utf8', env: { ...process.env, SOURCE_DATE: date, TZ: tz } });
        expect(run.status, run.stderr).toBe(0);
        const html = fs.readFileSync(path.join(copy.dir, 'index.html'), 'utf8');
        expect(html, `${date} in ${tz}`).toContain(`id="current-date">${month}<`);
        expect(html, `${date} in ${tz}`).toContain(`id="current-year">${year}<`);
      }
    } finally {
      fs.rmSync(copy.parent, { recursive: true, force: true });
    }
  });
});

test('verify-live bounds every request with a timeout', () => {
  const script = fs.readFileSync('scripts/verify-live.mjs', 'utf8');
  expect(script).toMatch(/AbortSignal\.timeout\(\d+\)/);
});
