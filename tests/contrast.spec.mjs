import { test, expect } from 'playwright/test';
import { createRequire } from 'node:module';

// axe cannot decide contrast for text over gradients/blurs ("incomplete"). This test measures it from the
// rendered pixels instead: for every visible text element, it hides the text, samples the background behind
// it, and checks the WCAG ratio of the real text colour against the 5th-percentile-worst background pixel.
const sharp = createRequire(import.meta.url)('sharp');

const lum = (r, g, b) => {
  const f = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const x = lum(...a); const y = lum(...b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const FREEZE = 'html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important}.hero-canvas,.hero-spotlight{display:none!important}.reveal{opacity:1!important;transform:none!important}';

for (const path of ['/', '/es/', '/it/']) {
  test(`every text element meets WCAG AA contrast on ${path} (pixel-measured)`, async ({ page, viewport }) => {
    test.setTimeout(120_000);
    await page.addInitScript(() => localStorage.setItem('cormite-consent-v1', 'denied'));
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    await page.evaluate((css) => { const s = new CSSStyleSheet(); s.replaceSync(css); document.adoptedStyleSheets = [...document.adoptedStyleSheets, s]; }, FREEZE);
    await page.evaluate(() => {
      let i = 0;
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!n.textContent.trim()) continue;
        const e = n.parentElement;
        if (!e || e.closest('script,style,noscript,svg,canvas,#consent-banner')) continue;
        if (!e.dataset.cx) e.dataset.cx = String(i++);
      }
    });

    const failures = [];
    let sampled = 0;
    for (const handle of await page.$$('[data-cx]')) {
      const visible = await handle.evaluate((e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 6 && r.height > 6 && c.visibility !== 'hidden' && c.display !== 'none'; });
      if (!visible) continue;
      await handle.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const info = await handle.evaluate((e) => {
        const c = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        let op = 1;
        for (let n = e; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
        return { color: c.color, op, fs: parseFloat(c.fontSize), bold: parseInt(c.fontWeight, 10) >= 700, x: r.x, y: r.y, w: r.width, h: r.height, txt: e.textContent.trim().slice(0, 30), clipText: c.webkitBackgroundClip === 'text' };
      });
      if (info.clipText) continue; // gradient-filled display text: large type, checked visually
      const ins = 3;
      const clip = { x: Math.max(0, info.x + ins), y: Math.max(0, info.y + ins), width: Math.min(info.w - 2 * ins, viewport.width - info.x - ins), height: Math.min(info.h - 2 * ins, viewport.height - info.y - ins) };
      if (clip.width < 3 || clip.height < 3) continue;
      await handle.evaluate((e) => { e.dataset.cs = e.getAttribute('style') || ''; e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); });
      const png = await page.screenshot({ clip });
      await handle.evaluate((e) => { e.setAttribute('style', e.dataset.cs); });
      sampled += 1;
      const { data, info: im } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      const m = info.color.match(/[\d.]+/g).map(Number);
      const a = (m[3] === undefined ? 1 : m[3]) * info.op;
      const rs = [];
      for (let i = 0; i < data.length; i += im.channels * 3) {
        const bg = [data[i], data[i + 1], data[i + 2]];
        const fg = [0, 1, 2].map((k) => Math.round(m[k] * a + bg[k] * (1 - a)));
        rs.push(ratio(fg, bg));
      }
      rs.sort((x, y) => x - y);
      const p5 = rs[Math.floor(rs.length * 0.05)];
      const large = info.fs >= 24 || (info.fs >= 18.66 && info.bold);
      const need = large ? 3 : 4.5;
      if (p5 < need) failures.push(`${p5.toFixed(2)} < ${need}: "${info.txt}" (${info.fs}px ${info.color})`);
    }
    expect(sampled, 'should sample most text on the page').toBeGreaterThan(100);
    expect(failures).toEqual([]);
  });
}
