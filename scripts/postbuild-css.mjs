import { readFileSync, writeFileSync } from 'node:fs';

const target = new URL('../assets/css/tailwind.css', import.meta.url);
const source = readFileSync(target, 'utf8');
const sanitized = source.replace(/-webkit-text-size-adjust:100%;?/g, '');

if (sanitized !== source) {
  writeFileSync(target, sanitized);
}
