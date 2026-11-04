// Generates responsive portrait variants (AVIF/WebP/JPG) from the source photo.
// Run manually when the photo changes: npm run build:images  (outputs are committed).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'docs/source-assets/new-photo.png');
const outDir = path.join(root, 'assets/img');
const WIDTHS = [320, 640, 881]; // 881 = native width of the source, never upscale

const base = sharp(source).flatten({ background: '#9a9aa0' });
for (const w of WIDTHS) {
  const img = base.clone().resize({ width: w, withoutEnlargement: true });
  await img.clone().avif({ quality: 55, effort: 7 }).toFile(path.join(outDir, `photo-${w}.avif`));
  await img.clone().webp({ quality: 80, effort: 6 }).toFile(path.join(outDir, `photo-${w}.webp`));
  await img.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(outDir, `photo-${w}.jpg`));
}
console.log('Responsive images written to assets/img');
