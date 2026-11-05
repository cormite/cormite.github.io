'use strict';

/*
 * Command menu (Cmd/Ctrl+K or "/"). Progressive enhancement: every action it offers also exists as a normal link
 * on the page, so nothing depends on it. Built lazily on first open from a native <dialog> (focus trap, Esc,
 * inert background and focus restore come from the platform), no libraries, no inline script or style.
 */
(function initSitePalette(global) {
  const doc = global.document;
  const content = global.__SITE_CONTENT || {};
  const render = global.__SITE_RENDER || {};
  const dom = global.__SITE_DOM || {};
  const utils = global.__SITE_UTILS || {};
  const { I18N, DEFAULT_LANG, NAV_ITEMS, SOCIAL_LINKS } = content;
  const { byId } = dom;
  const { prefersReducedMotion } = utils;

  if (!I18N || !NAV_ITEMS || !SOCIAL_LINKS || !byId || !render.getCurrentLanguage) {
    throw new Error('site-palette.js requires site-content.js, site-render.js and site-dom.js');
  }

  const LANGUAGE_NAMES = Object.freeze({ en: 'English', es: 'Español', it: 'Italiano' });
  let dialog = null;
  let input = null;
  let list = null;
  let empty = null;
  let items = [];
  let visible = [];
  let active = 0;
  let opener = null;
  let pending = null;
  let bound = false;

  const fold = (text) => String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

  function track(method) {
    const interactions = global.__SITE_INTERACTIONS;
    if (interactions && typeof interactions.trackEvent === 'function') interactions.trackEvent('palette_open', { method });
  }

  function goToSection(href) {
    const id = String(href).replace(/^.*#/, '');
    const target = id ? doc.getElementById(id) : null;
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (global.history && global.history.pushState) global.history.pushState(null, '', `#${id}`);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  function buildItems() {
    const content_ = I18N[render.getCurrentLanguage()] || I18N[DEFAULT_LANG];
    const ui = content_.staticText.ui;
    const out = [];

    NAV_ITEMS.forEach((item) => {
      out.push({ group: ui.paletteGroupGo, label: content_.nav[item.key], run: () => goToSection(item.href) });
    });

    doc.querySelectorAll('#nav-links-desktop .lang-btn').forEach((link) => {
      const lang = link.getAttribute('data-lang');
      if (!lang || link.getAttribute('aria-current') === 'true' || !LANGUAGE_NAMES[lang]) return;
      out.push({
        group: ui.paletteGroupLanguage,
        label: `${ui.paletteSwitchTo} ${LANGUAGE_NAMES[lang]}`,
        keywords: `${lang} ${LANGUAGE_NAMES[lang]}`,
        run: () => link.click()
      });
    });

    const cvLink = byId('hero-download-button');
    if (cvLink) out.push({ group: ui.paletteGroupLinks, label: ui.paletteDownloadCv, keywords: 'cv pdf resume curriculum', run: () => cvLink.click() });

    out.push({
      group: ui.paletteGroupLinks,
      label: `${ui.paletteEmail}: ${content_.profile.contactEmail}`,
      keywords: 'email mail correo contact contacto',
      run: () => { global.location.href = `mailto:${content_.profile.contactEmail}`; }
    });

    SOCIAL_LINKS.forEach((link) => {
      if (link.key === 'website') return;
      const label = ui.socialLinkLabels[link.key] || link.key;
      out.push({ group: ui.paletteGroupLinks, label, keywords: link.key, run: () => global.open(link.href, '_blank', 'noopener,noreferrer') });
    });

    return out;
  }

  function setActive(index, scroll) {
    if (!visible.length) {
      active = 0;
      input.removeAttribute('aria-activedescendant');
      return;
    }
    active = (index + visible.length) % visible.length;
    visible.forEach((entry, i) => entry.node.setAttribute('aria-selected', i === active ? 'true' : 'false'));
    const node = visible[active].node;
    input.setAttribute('aria-activedescendant', node.id);
    if (scroll) node.scrollIntoView({ block: 'nearest' });
  }

  function paintList(query) {
    const needle = fold(query).trim();
    list.textContent = '';
    visible = [];
    let lastGroup = null;
    items.forEach((item, index) => {
      if (needle && !fold(`${item.label} ${item.keywords || ''} ${item.group}`).includes(needle)) return;
      if (item.group !== lastGroup) {
        const heading = doc.createElement('li');
        heading.className = 'palette-group';
        heading.setAttribute('role', 'presentation');
        heading.textContent = item.group;
        list.appendChild(heading);
        lastGroup = item.group;
      }
      const node = doc.createElement('li');
      node.id = `palette-option-${index}`;
      node.className = 'palette-option';
      node.setAttribute('role', 'option');
      node.setAttribute('aria-selected', 'false');
      node.textContent = item.label;
      node.addEventListener('click', () => choose(item));
      node.addEventListener('pointermove', () => {
        const at = visible.findIndex((entry) => entry.item === item);
        if (at !== active) setActive(at, false);
      });
      list.appendChild(node);
      visible.push({ item, node });
    });
    empty.hidden = visible.length > 0;
    setActive(0, false);
  }

  function choose(item) {
    pending = item.run;
    dialog.close();
  }

  function build() {
    const ui = (I18N[render.getCurrentLanguage()] || I18N[DEFAULT_LANG]).staticText.ui;
    dialog = doc.createElement('dialog');
    dialog.className = 'palette';
    dialog.setAttribute('aria-labelledby', 'palette-title');

    const panel = doc.createElement('div');
    panel.className = 'palette-panel';

    const title = doc.createElement('h2');
    title.id = 'palette-title';
    title.className = 'sr-only';
    title.textContent = ui.paletteTitle;

    input = doc.createElement('input');
    input.type = 'text';
    input.className = 'palette-input';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-controls', 'palette-list');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-label', ui.paletteTitle);
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.placeholder = ui.palettePlaceholder;

    list = doc.createElement('ul');
    list.id = 'palette-list';
    list.className = 'palette-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', ui.paletteTitle);

    empty = doc.createElement('p');
    empty.className = 'palette-empty';
    empty.setAttribute('role', 'status');
    empty.hidden = true;
    empty.textContent = ui.paletteEmpty;

    const hint = doc.createElement('p');
    hint.className = 'palette-hint';
    hint.textContent = ui.paletteHint;

    panel.append(title, input, list, empty, hint);
    dialog.appendChild(panel);
    doc.body.appendChild(dialog);

    input.addEventListener('input', () => paintList(input.value));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(active + 1, true); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(active - 1, true); }
      else if (event.key === 'Home') { event.preventDefault(); setActive(0, true); }
      else if (event.key === 'End') { event.preventDefault(); setActive(visible.length - 1, true); }
      else if (event.key === 'Enter' && visible.length) { event.preventDefault(); choose(visible[active].item); }
    });
    dialog.addEventListener('mousedown', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      if (opener && typeof opener.focus === 'function' && doc.contains(opener)) opener.focus({ preventScroll: true });
      const run = pending;
      pending = null;
      if (run) run();
    });
  }

  function open(method) {
    if (dialog && dialog.open) return;
    const menu = byId('mobile-menu');
    if (menu && menu.classList.contains('open')) return;
    if (typeof doc.createElement('dialog').showModal !== 'function') return;
    if (!dialog) build();
    opener = doc.activeElement;
    items = buildItems();
    input.value = '';
    paintList('');
    dialog.showModal();
    input.focus();
    track(method);
  }

  function isEditable(node) {
    if (!(node instanceof global.HTMLElement)) return false;
    return node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName);
  }

  function init() {
    if (bound) return;
    bound = true;

    const button = byId('palette-btn');
    const kbd = byId('palette-kbd');
    const shortcut = /Mac|iPhone|iPad/.test(global.navigator.platform || global.navigator.userAgent || '') ? '⌘K' : 'Ctrl K';
    // The hint is generated content (CSS ::after from data-shortcut) so it is not duplicated as text; the shortcut is
    // announced through the accessible name instead.
    if (kbd) kbd.setAttribute('data-shortcut', shortcut);
    if (button && kbd && button.getAttribute('aria-label')) button.setAttribute('aria-label', `${button.getAttribute('aria-label')} (${shortcut})`);
    if (button) button.addEventListener('click', () => open('button'));

    doc.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && String(event.key).toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog && dialog.open) dialog.close(); else open('shortcut');
        return;
      }
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)) {
        event.preventDefault();
        open('slash');
      }
    });
  }

  global.__SITE_PALETTE = Object.freeze({ init });
}(globalThis));
