'use strict';

(function initSiteUtils(global) {
  function byId(id) {
    return document.getElementById(id);
  }

  function prefersReducedMotion() {
    return Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }

    callback();
  }

  function getSafeStorage() {
    try {
      return global.localStorage;
    } catch (error) {
      return null;
    }
  }

  function getProtocol() {
    return global.location && global.location.protocol ? global.location.protocol : 'file:';
  }

  function setText(id, value) {
    const node = byId(id);
    if (node) {
      node.textContent = value;
    }
  }

  function setHtml(id, value) {
    const node = byId(id);
    if (node) {
      node.innerHTML = value;
    }
  }

  function safeEncode(value) {
    return encodeURIComponent(value || '');
  }

  global.__SITE_UTILS = Object.freeze({
    byId,
    prefersReducedMotion,
    onReady,
    getSafeStorage,
    getProtocol,
    setText,
    setHtml,
    safeEncode
  });
}(globalThis));
