'use strict';

/*
 * Privacy-first analytics. Google Analytics 4 is NOT loaded until the visitor opts in.
 * Consent Mode v2 defaults to "denied" for everything; only analytics_storage is ever granted.
 */
(function initConsent(global) {
  const STORAGE_KEY = 'cormite-consent-v1';
  const content = global.__SITE_CONTENT || {};
  const render = global.__SITE_RENDER || {};
  const measurementId = content.SITE_CONFIG && content.SITE_CONFIG.googleAnalyticsId;
  const { I18N, DEFAULT_LANG, detectLanguage } = render;
  if (!measurementId || !I18N) return;

  const doc = global.document;
  let loaded = false;
  let banner = null;
  let returnFocusTo = null; // only set when the banner was reopened from the footer button

  function readChoice() {
    try { return global.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function writeChoice(value) {
    try { global.localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked: choice lasts for this page only */ }
  }

  function text() {
    const lang = (detectLanguage && detectLanguage()) || DEFAULT_LANG;
    const ui = (I18N[lang] || I18N[DEFAULT_LANG]).staticText.ui;
    return ui;
  }

  function bootstrapGtag() {
    global.dataLayer = global.dataLayer || [];
    global.gtag = function gtag() { global.dataLayer.push(arguments); };
    global.gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    });
  }

  function loadAnalytics() {
    if (loaded) { global['ga-disable-' + measurementId] = false; global.gtag('consent', 'update', { analytics_storage: 'granted' }); return; }
    loaded = true;
    bootstrapGtag();
    global.gtag('js', new Date());
    global.gtag('consent', 'update', { analytics_storage: 'granted' });
    global.gtag('config', measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = doc.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    doc.head.appendChild(script);
  }

  function revokeAnalytics() {
    global['ga-disable-' + measurementId] = true;
    if (typeof global.gtag === 'function') global.gtag('consent', 'update', { analytics_storage: 'denied' });
    // Remove first-party GA cookies (_ga, _ga_XXXX) on this host and parent domain.
    const host = global.location.hostname;
    const domains = [host, '.' + host, '.' + host.replace(/^www\./, '')];
    doc.cookie.split(';').map((c) => c.trim().split('=')[0]).filter((n) => /^_ga/.test(n)).forEach((name) => {
      domains.forEach((d) => { doc.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d; });
      doc.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
  }

  function closeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function choose(value) {
    writeChoice(value);
    if (value === 'granted') loadAnalytics(); else revokeAnalytics();
    closeBanner();
    // Give focus back only to the control that opened the banner, and never scroll to do it:
    // on a first visit nothing opened it, and the footer button is far below the fold.
    if (returnFocusTo) returnFocusTo.focus({ preventScroll: true });
    returnFocusTo = null;
  }

  function openBanner(opener) {
    if (banner) return;
    returnFocusTo = opener || null;
    const ui = text();
    banner = doc.createElement('section');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', ui.consentLabel);

    const p = doc.createElement('p');
    p.textContent = ui.consentText;

    const actions = doc.createElement('div');
    actions.className = 'consent-actions';
    const decline = doc.createElement('button');
    decline.type = 'button';
    decline.className = 'consent-btn consent-btn-secondary';
    decline.textContent = ui.consentDecline;
    decline.addEventListener('click', () => choose('denied'));
    const accept = doc.createElement('button');
    accept.type = 'button';
    accept.className = 'consent-btn consent-btn-primary';
    accept.textContent = ui.consentAccept;
    accept.addEventListener('click', () => choose('granted'));
    actions.append(decline, accept);

    banner.append(p, actions);
    doc.body.appendChild(banner);
  }

  function addFooterTrigger() {
    const footerText = doc.getElementById('footer-copyright');
    if (!footerText || doc.getElementById('privacy-settings-btn')) return;
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.id = 'privacy-settings-btn';
    btn.className = 'privacy-settings-btn';
    btn.textContent = text().consentSettings;
    btn.addEventListener('click', () => openBanner(btn));
    footerText.insertAdjacentElement('afterend', btn);
  }

  function init() {
    addFooterTrigger();
    const choice = readChoice();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') openBanner();
  }

  // A page the browser prerenders in the background (speculation rules) must not count as a visit, or ask for consent,
  // before the visitor actually arrives on it: wait for activation.
  function start() { if (doc.prerendering) doc.addEventListener('prerenderingchange', init, { once: true }); else init(); }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
}(globalThis));
