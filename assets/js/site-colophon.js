'use strict';

/*
 * "How this page performed": a small panel that shows what THIS visit actually cost, read from the browser's own
 * Performance API (transfer size, requests, time to first byte, first and largest paint, layout shift, protocol,
 * cache state). Nothing is estimated and nothing is sent anywhere. Opened from the command menu or the footer button.
 * The budget shown is the one the test suite enforces (tests/performance.spec.mjs).
 */
(function initSiteColophon(global) {
  const doc = global.document;
  const content = global.__SITE_CONTENT || {};
  const render = global.__SITE_RENDER || {};
  const dom = global.__SITE_DOM || {};
  const { I18N, DEFAULT_LANG } = content;
  const { byId } = dom;

  if (!I18N || !byId || !render.getCurrentLanguage) throw new Error('site-colophon.js requires site-content.js, site-render.js and site-dom.js');

  const BUDGET = Object.freeze({ bytes: 200 * 1024, requests: 12 });
  const supports = (type) => Boolean(global.PerformanceObserver && (global.PerformanceObserver.supportedEntryTypes || []).includes(type));
  let dialog = null;
  let body = null;
  let opener = null;
  let largest = null;
  let shift = 0;

  // Start watching early (buffered: true replays what already happened), so the numbers are complete whenever the panel opens.
  function observe(type, onEntries) {
    if (!supports(type)) return;
    try { new global.PerformanceObserver((list) => onEntries(list.getEntries())).observe({ type, buffered: true }); } catch (e) { /* not available */ }
  }
  function startObservers() {
    observe('largest-contentful-paint', (entries) => { largest = entries[entries.length - 1].startTime; });
    observe('layout-shift', (entries) => { entries.forEach((e) => { if (!e.hadRecentInput) shift += e.value; }); });
  }

  function measure() {
    const perf = global.performance;
    const nav = (perf.getEntriesByType('navigation') || [])[0];
    const origin = global.location.origin;
    const own = (perf.getEntriesByType('resource') || []).filter((r) => r.name.startsWith(origin));
    const paint = (perf.getEntriesByName('first-contentful-paint') || [])[0];
    const script = (doc.querySelector('script[src*="app."]') || {}).src || '';
    const wire = nav ? nav.transferSize + own.reduce((sum, r) => sum + r.transferSize, 0) : 0;
    const activation = nav && nav.activationStart ? nav.activationStart : 0; // > 0: the page was prerendered and shown instantly
    return {
      bytes: wire,
      requests: own.length + 1,
      cached: Boolean(nav) && nav.transferSize === 0 && nav.decodedBodySize > 0,
      ttfb: nav ? Math.max(0, nav.responseStart - activation) : null,
      fcp: paint ? Math.max(0, paint.startTime - activation) : null,
      lcp: largest === null ? null : Math.max(0, largest - activation),
      cls: shift,
      protocol: nav ? nav.nextHopProtocol : '',
      prerendered: activation > 0,
      build: (script.match(/app\.([0-9a-f]+)\.js/) || [])[1] || ''
    };
  }

  const PROTOCOLS = Object.freeze({ h3: 'HTTP/3', h2: 'HTTP/2', 'http/1.1': 'HTTP/1.1' });

  function rows(ui, lang, m) {
    const number = (value, digits) => new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(value);
    const ms = (value) => (value === null ? '—' : `${number(value, 0)} ms`);
    const kb = m.bytes > 0 ? `${number(m.bytes / 1024, 1)} KB` : (m.cached ? ui.colophonFromCache : '—');
    return [
      [ui.colophonWeight, kb],
      [ui.colophonRequests, number(m.requests, 0)],
      [ui.colophonTtfb, ms(m.ttfb)],
      [ui.colophonFcp, ms(m.fcp)],
      [ui.colophonLcp, ms(m.lcp)],
      [ui.colophonCls, number(m.cls, 3)],
      [ui.colophonProtocol, PROTOCOLS[m.protocol] || m.protocol || '—'],
      [ui.colophonSource, m.prerendered ? ui.colophonPrerendered : (m.cached ? ui.colophonCache : ui.colophonNetwork)],
      [ui.colophonBuild, m.build || '—']
    ];
  }

  function paint() {
    const lang = render.getCurrentLanguage();
    const ui = (I18N[lang] || I18N[DEFAULT_LANG]).staticText.ui;
    const m = measure();
    body.textContent = '';

    const list = doc.createElement('dl');
    list.className = 'colophon-list';
    rows(ui, lang, m).forEach(([label, value]) => {
      const dt = doc.createElement('dt'); dt.textContent = label;
      const dd = doc.createElement('dd'); dd.textContent = value;
      list.append(dt, dd);
    });

    const meterLabel = doc.createElement('label');
    meterLabel.className = 'colophon-meter-label';
    meterLabel.setAttribute('for', 'colophon-meter');
    meterLabel.textContent = ui.colophonBudget;
    const meter = doc.createElement('meter');
    meter.id = 'colophon-meter';
    meter.className = 'colophon-meter';
    meter.min = 0; meter.max = BUDGET.bytes; meter.low = BUDGET.bytes * 0.75; meter.high = BUDGET.bytes * 0.9; meter.optimum = 0;
    meter.value = Math.min(m.bytes, BUDGET.bytes);
    meter.textContent = `${Math.round(m.bytes / 1024)} / ${BUDGET.bytes / 1024} KB`;
    meter.hidden = m.bytes === 0;
    meterLabel.hidden = m.bytes === 0;

    const note = doc.createElement('p');
    note.className = 'colophon-note';
    note.textContent = ui.colophonNote;
    body.append(list, meterLabel, meter, note);
  }

  function build() {
    const ui = (I18N[render.getCurrentLanguage()] || I18N[DEFAULT_LANG]).staticText.ui;
    dialog = doc.createElement('dialog');
    dialog.className = 'palette colophon';
    dialog.setAttribute('aria-labelledby', 'colophon-title');

    const panel = doc.createElement('div');
    panel.className = 'palette-panel colophon-panel';
    const title = doc.createElement('h2');
    title.id = 'colophon-title';
    title.className = 'colophon-title';
    title.textContent = ui.colophonTitle;
    const intro = doc.createElement('p');
    intro.className = 'colophon-intro';
    intro.textContent = ui.colophonIntro;
    body = doc.createElement('div');
    body.className = 'colophon-body';
    const close = doc.createElement('button');
    close.type = 'button';
    close.className = 'colophon-close';
    close.textContent = ui.colophonClose;
    close.addEventListener('click', () => dialog.close());

    panel.append(title, intro, body, close);
    dialog.appendChild(panel);
    doc.body.appendChild(dialog);
    dialog.addEventListener('mousedown', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      if (opener && typeof opener.focus === 'function' && doc.contains(opener)) opener.focus({ preventScroll: true });
    });
  }

  function open() {
    if (dialog && dialog.open) return;
    if (typeof doc.createElement('dialog').showModal !== 'function') return;
    if (!dialog) build();
    opener = doc.activeElement;
    paint();
    dialog.showModal();
    dialog.querySelector('.colophon-close').focus();
  }

  function init() {
    startObservers();
    const footerText = byId('footer-updated-line');
    if (!footerText || byId('colophon-btn')) return;
    const ui = (I18N[render.getCurrentLanguage()] || I18N[DEFAULT_LANG]).staticText.ui;
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.id = 'colophon-btn';
    btn.className = 'privacy-settings-btn';
    btn.textContent = ui.colophonOpen;
    btn.addEventListener('click', () => open());
    footerText.insertAdjacentElement('afterend', btn);
  }

  global.__SITE_COLOPHON = Object.freeze({ init, open });
}(globalThis));
