import { readFileSync, writeFileSync } from 'node:fs';

const scriptFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptFile);
const target = path.resolve(scriptDir, '../assets/css/tailwind.css');
const source = readFileSync(target, 'utf8');
const sanitized = source.replace(/-webkit-text-size-adjust:100%;?/g, '');

if (sanitized !== source) {
  writeFileSync(target, sanitized);
}
