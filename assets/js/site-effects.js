'use strict';

/*
 * Premium motion layer. Everything here is progressive enhancement:
 * - the page is fully usable without it,
 * - it is disabled for prefers-reduced-motion and data-saver users,
 * - it pauses when off-screen or when the tab is hidden.
 */
(function initSiteEffects(global) {
  const doc = global.document;
  const reduce = () => global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = () => Boolean(global.navigator && global.navigator.connection && global.navigator.connection.saveData);
  const finePointer = () => global.matchMedia && global.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Hero: constellation canvas + cursor spotlight + photo tilt ---------- */
  function setupHeroScene() {
    const hero = doc.getElementById('home');
    if (!hero) return;
    const layer = hero.firstElementChild;
    if (!layer) return;

    const canvas = doc.createElement('canvas');
    canvas.className = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    layer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spot = doc.createElement('div');
    spot.className = 'hero-spotlight';
    spot.setAttribute('aria-hidden', 'true');
    layer.appendChild(spot);

    let w = 0; let h = 0; let dpr = 1; let nodes = []; let raf = 0; let running = false;
    const pointer = { x: -9999, y: -9999, sx: 0.7, sy: 0.4 };
    const still = reduce() || saveData();

    function resize() {
      const rect = hero.getBoundingClientRect();
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(70, Math.round((w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.4, gold: Math.random() < 0.18
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const link = Math.min(150, w / 7);
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        if (!still) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
          const dx = a.x - pointer.x; const dy = a.y - pointer.y; const d2 = dx * dx + dy * dy;
          if (d2 < 14000) { const f = (1 - d2 / 14000) * 0.6; a.x += (dx / Math.sqrt(d2 || 1)) * f; a.y += (dy / Math.sqrt(d2 || 1)) * f; }
        }
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.2832);
        ctx.fillStyle = a.gold ? 'rgba(212,160,23,.85)' : 'rgba(255,255,255,.55)';
        ctx.fill();
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]; const dx = a.x - b.x; const dy = a.y - b.y; const d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) {
            ctx.strokeStyle = (a.gold || b.gold ? 'rgba(212,160,23,' : 'rgba(255,255,255,') + (0.22 * (1 - d / link)).toFixed(3) + ')';
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // Ease the spotlight toward the pointer.
      pointer.sx += ((pointer.x > -9000 ? pointer.x / w : 0.7) - pointer.sx) * 0.08;
      pointer.sy += ((pointer.y > -9000 ? pointer.y / h : 0.4) - pointer.sy) * 0.08;
      spot.style.setProperty('--mx', (pointer.sx * 100).toFixed(1) + '%');
      spot.style.setProperty('--my', (pointer.sy * 100).toFixed(1) + '%');
      if (running && !still) raf = global.requestAnimationFrame(frame);
    }

    let inView = true; // updated by the IntersectionObserver below
    function start() { if (running || still || !inView) return; running = true; raf = global.requestAnimationFrame(frame); }
    function stop() { running = false; global.cancelAnimationFrame(raf); }

    resize();
    frame();
    if (still) { global.addEventListener('resize', () => { resize(); frame(); }); return; }

    let resizeTimer = 0;
    global.addEventListener('resize', () => { global.clearTimeout(resizeTimer); resizeTimer = global.setTimeout(resize, 150); }, { passive: true });
    if ('IntersectionObserver' in global) {
      new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; inView && !doc.hidden ? start() : stop(); }, { threshold: 0 }).observe(hero);
    } else { start(); }
    // Coming back to the tab must not restart the animation when the hero is scrolled out of view (start() checks inView).
    doc.addEventListener('visibilitychange', () => { doc.hidden ? stop() : start(); });

    if (finePointer()) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
        tilt(e, r);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; untilt(); }, { passive: true });
    }

    const ring = hero.querySelector('.photo-ring');
    const stage = ring && ring.parentElement;
    // Tilt only reacts near the photo: full strength over it, fading to zero about one photo-width away.
    const TILT_MAX_DEG = 7;
    const TILT_REACH = 1.1; // in photo-widths measured from the photo centre
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    function tilt(e) {
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      const strength = clamp(1 - (Math.hypot(dx, dy) - 0.5) / (TILT_REACH - 0.5), 0, 1);
      if (strength === 0) { untilt(); return; }
      const ry = clamp(dx * 2, -1, 1) * TILT_MAX_DEG * strength;
      const rx = -clamp(dy * 2, -1, 1) * TILT_MAX_DEG * strength;
      stage.style.transform = 'perspective(900px) rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
    }
    function untilt() { if (stage) stage.style.transform = ''; }
  }

  /* ---------- Count-up impact numbers ---------- */
  function setupCounters() {
    const targets = ['hero-budget', 'hero-team-size', 'about-years-value']
      .map((id) => doc.getElementById(id)).filter(Boolean);
    if (!targets.length) return;

    const prepared = targets.map((el) => {
      const original = el.textContent;
      const m = original.match(/\d+(?:[.,]\d+)?/);
      if (!m) return null;
      const raw = m[0]; const value = parseFloat(raw.replace(',', '.'));
      const decimals = (raw.split(/[.,]/)[1] || '').length;
      return { el, original, start: m.index, raw, value, decimals };
    }).filter(Boolean);

    const apply = (item, v) => {
      const num = item.decimals ? v.toFixed(item.decimals) : String(Math.round(v));
      item.el.textContent = item.original.slice(0, item.start) + num + item.original.slice(item.start + item.raw.length);
    };

    if (reduce()) return; // original text already shows the final values

    const run = (item) => {
      const dur = 1400; const t0 = global.performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        apply(item, item.value * eased);
        if (t < 1) global.requestAnimationFrame(tick); else item.el.textContent = item.original;
      };
      global.requestAnimationFrame(tick);
    };

    // Reserve the final width so counting up from 0 never reflows the row.
    prepared.forEach((item) => {
      item.el.classList.add('count-up');
      item.el.style.minWidth = `${Math.ceil(item.el.getBoundingClientRect().width)}px`;
    });
    if (!('IntersectionObserver' in global)) return;

    // Off-screen numbers keep their real text until they scroll into view (crawler/screen-reader safe).
    const started = new Set();
    const begin = (item) => {
      if (started.has(item)) return;
      started.add(item);
      apply(item, 0);
      run(item);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const item = prepared.find((p) => p.el === entry.target);
        if (item) begin(item);
      });
    }, { threshold: 0.6 });
    prepared.forEach((item) => {
      const r = item.el.getBoundingClientRect();
      if (r.top < global.innerHeight && r.bottom > 0) apply(item, 0); // already on screen: avoid a flash of the final value
      io.observe(item.el);
    });
  }

  /* ---------- Scroll progress bar + timeline fill ---------- */
  function setupScrollLinked() {
    const bar = doc.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(bar);

    const timeline = doc.getElementById('experience-timeline');
    const line = doc.querySelector('.timeline-line');
    let ticking = false;
    // Where the browser can link an animation to scroll position itself (see styles.css), it moves the bar on the
    // compositor and this script does not touch it.
    const barByCss = Boolean(global.CSS && global.CSS.supports && global.CSS.supports('animation-timeline: scroll()'));

    function update() {
      ticking = false;
      const max = doc.documentElement.scrollHeight - global.innerHeight;
      if (!barByCss) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, global.scrollY / max) : 0).toFixed(4) + ')';
      if (timeline && line) {
        const r = timeline.getBoundingClientRect();
        const mid = global.innerHeight * 0.55;
        const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
        line.style.setProperty('--tl', p.toFixed(4));
        timeline.querySelectorAll('[data-aos]').forEach((n) => {
          const nr = n.getBoundingClientRect();
          n.classList.toggle('is-current', nr.top < mid && nr.bottom > mid);
        });
      }
    }
    global.addEventListener('scroll', () => { if (!ticking) { ticking = true; global.requestAnimationFrame(update); } }, { passive: true });
    global.addEventListener('resize', update, { passive: true });
    update();
  }

  function enhanceEffects() {
    setupHeroScene();
    setupCounters();
    setupScrollLinked();
  }

  global.__SITE_EFFECTS = Object.freeze({ enhanceEffects });
}(globalThis));
