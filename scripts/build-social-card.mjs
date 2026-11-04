// Renders the 1200x630 social/link-preview card with the site's own fonts.
// Run manually when branding changes: PW_CHANNEL=chrome npm run build:social
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const font = (p) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, p)).toString('base64')}`;
const photo = fs.readFileSync(path.join(root, 'assets/img/photo-881.jpg')).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Cormorant Garamond';src:url('${font('assets/fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2')}');font-weight:600}
@font-face{font-family:'EB Garamond';src:url('${font('assets/fonts/eb-garamond/eb-garamond-latin-400-normal.woff2')}');font-weight:400}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;font-family:'EB Garamond',Georgia,serif;color:#fff;
 background:radial-gradient(900px 600px at 85% 20%,rgba(30,58,138,.9),transparent 70%),linear-gradient(135deg,#0B1B3D 0%,#1E3A8A 55%,#0B1B3D 100%)}
.grid{position:absolute;inset:0;opacity:.12;background-image:radial-gradient(circle at 1px 1px,#fff 1px,transparent 0);background-size:40px 40px}
.glow{position:absolute;left:-120px;top:-100px;width:520px;height:520px;border-radius:50%;background:rgba(201,151,26,.14);filter:blur(80px)}
.photo{position:absolute;right:92px;top:95px;width:440px;height:440px;border-radius:50%;overflow:hidden;border:6px solid #C9971A;box-shadow:0 30px 80px rgba(0,0,0,.45)}
.photo img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.ring{position:absolute;right:72px;top:75px;width:480px;height:480px;border-radius:50%;border:2px solid rgba(201,151,26,.35)}
.txt{position:absolute;left:84px;top:120px;width:640px}
.pill{display:inline-block;padding:8px 18px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(255,255,255,.08);font-size:22px;margin-bottom:28px}
h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;font-size:86px;line-height:1.02;letter-spacing:.01em}
h1 b{color:#C9971A;font-weight:600}
.role{margin-top:24px;font-size:31px;color:#C9971A;line-height:1.25;white-space:nowrap}
.url{position:absolute;left:84px;bottom:48px;font-size:26px;color:rgba(255,255,255,.75);letter-spacing:.04em}
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="txt"><span class="pill">Technology Executive · Milan</span>
<h1>Carlos<br><b>Fernández</b><br>San Millán</h1>
<div class="role">Head of ICT &amp; Acting CIO | Board Advisor</div></div>
<div class="ring"></div><div class="photo"><img src="data:image/jpeg;base64,${photo}"></div>
<div class="url">www.cormite.com</div></body></html>`;

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'assets/og/og-card.jpg'), type: 'jpeg', quality: 88 });
await browser.close();
console.log('Social card written to assets/og/og-card.jpg');
