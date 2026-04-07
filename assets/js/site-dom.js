'use strict';

(function initSiteDom(global) {
  const { byId, setText, setHtml } = global.__SITE_UTILS || {};
  const { renderIconSvg } = global.__SITE_ICONS || {};

  if (!byId || !setText || !setHtml || !renderIconSvg) {
    throw new Error('Site DOM helpers require site-utils.js and site-icons.js');
  }

  const CLASSNAMES = Object.freeze({
    desktopNavItem: 'text-white hover:text-accent px-3 py-2 rounded-md text-base font-semibold transition-colors',
    desktopNavCta: 'bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all transform hover:scale-105',
    mobileNavItem: 'block text-white hover:text-accent py-2 text-xl font-semibold',
    mobileNavCta: 'block text-accent py-2 text-xl font-bold',
    heroSocialLink: 'w-12 h-12 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110',
    contactSocialLink: 'w-12 h-12 rounded-full bg-primary hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110'
  });

  function setButtonContent(id, iconName, text) {
    const button = byId(id);
    if (!button) return;
    button.innerHTML = `${renderIconSvg(iconName, 'mr-2', true)}${text}`;
  }

  function setInlineIconText(id, iconName, text) {
    const node = byId(id);
    if (!node) return;
    node.innerHTML = `${renderIconSvg(iconName, 'mr-2', true)}${text}`;
  }

  function setInputPlaceholder(id, value) {
    const field = byId(id);
    if (field) {
      field.placeholder = value;
    }
  }

  function setHref(id, value) {
    const node = byId(id);
    if (node) {
      node.setAttribute('href', value);
    }
  }

  function setAttr(id, name, value) {
    const node = byId(id);
    if (node) {
      node.setAttribute(name, value);
    }
  }

  global.__SITE_DOM = Object.freeze({
    CLASSNAMES,
    byId,
    setText,
    setHtml,
    setButtonContent,
    setInlineIconText,
    setInputPlaceholder,
    setHref,
    setAttr
  });
}(globalThis));
