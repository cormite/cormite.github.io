// Generates the favicon set from the site's own typography and palette.
// Run manually when branding changes: PW_CHANNEL=chrome npm run build:icons   (outputs are committed)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets/icons');
fs.mkdirSync(outDir, { recursive: true });

const font = (p) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, p)).toString('base64')}`;
const cormorant = font('assets/fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2');

// `pad` leaves a safe zone so the mark survives circular/squircle masks (maskable icons).
const html = (pad) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'CG';src:url('${cormorant}');font-weight:600}
*{margin:0}
body{width:512px;height:512px;display:grid;place-items:center;background:
 radial-gradient(420px 420px at 80% 12%,rgba(30,58,138,.95),transparent 70%),
 linear-gradient(135deg,#0B1B3D 0%,#1E3A8A 60%,#0B1B3D 100%)}
.mark{font-family:'CG',Georgia,serif;font-weight:600;color:#fff;font-size:${Math.round(300 * (1 - pad * 2))}px;line-height:1;letter-spacing:-.02em;transform:translateY(-3%)}
.mark i{font-style:normal;color:#D4A017}
</style><div class="mark">CF<i>.</i></div>`;

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
const render = async (pad) => {
  await page.setContent(html(pad), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ type: 'png' });
};
const any512 = await render(0.04);
const maskable512 = await render(0.2);
await browser.close();

const png = (buf, size) => sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
const files = {
  'icon-512.png': await png(any512, 512),
  'icon-192.png': await png(any512, 192),
  'icon-maskable-512.png': await png(maskable512, 512),
  'apple-touch-icon.png': await png(maskable512, 180), // iOS applies its own mask: keep the safe zone
  'favicon-32.png': await png(any512, 32),
  'favicon-16.png': await png(any512, 16)
};
for (const [name, buf] of Object.entries(files)) fs.writeFileSync(path.join(outDir, name), buf);

// favicon.ico: three PNG-compressed entries (16, 32, 48), valid for every browser released since 2010.
const sizes = [16, 32, 48];
const entries = await Promise.all(sizes.map((s) => png(any512, s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = 6 + entries.length * 16;
const dir = entries.map((buf, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
fs.writeFileSync(path.join(root, 'favicon.ico'), Buffer.concat([header, ...dir, ...entries]));

fs.writeFileSync(path.join(root, 'site.webmanifest'), JSON.stringify({
  name: 'Carlos Fernández San Millán',
  short_name: 'Carlos F.S.M.',
  description: 'Head of ICT & Acting CIO | Board Advisor',
  start_url: '/',
  display: 'browser',
  theme_color: '#0B1B3D',
  background_color: '#0B1B3D',
  icons: [
    { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/assets/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');
console.log('Icons, favicon.ico and site.webmanifest written');
