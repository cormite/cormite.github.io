import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SKIP = new Set(['node_modules', '.git', 'site', 'test-results', 'playwright-report', '_site', '_staging']);

// A throwaway copy of the project (node_modules linked, not copied), so a test can run the real build, assembler or
// server without touching the working tree. Remove it with fs.rmSync(copy.parent, { recursive: true, force: true }).
export function copyProject() {
  const root = process.cwd();
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'project-copy-'));
  const dir = path.join(parent, 'project');
  fs.cpSync(root, dir, { recursive: true, filter: (src) => !SKIP.has(path.basename(src)) || path.dirname(src) !== root });
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
  return { dir, parent };
}
