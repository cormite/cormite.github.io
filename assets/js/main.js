'use strict';

const { LANGS, DEFAULT_LANG, LANG_STORAGE_KEY, CV_FILES, NAV_ITEMS, SOCIAL_LINKS, I18N } = globalThis.__SITE_CONTENT || {};

if (!LANGS || !DEFAULT_LANG || !LANG_STORAGE_KEY || !CV_FILES || !NAV_ITEMS || !SOCIAL_LINKS || !I18N) {
  throw new Error('Site content failed to load before main.js');
}

const CLASSNAMES = Object.freeze({
  desktopNavItem: 'text-white hover:text-accent px-3 py-2 rounded-md text-base font-semibold transition-colors',
  desktopNavCta: 'bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all transform hover:scale-105',
  mobileNavItem: 'block text-white hover:text-accent py-2 text-xl font-semibold',
  mobileNavCta: 'block text-accent py-2 text-xl font-bold'
});

const ICON_PATHS = Object.freeze({
  'fa-linkedin-in': 'M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3Zm6.89 5.5H8.91V20h3.23v-6.03c0-1.59.3-3.13 2.27-3.13 1.94 0 1.97 1.81 1.97 3.23V20h3.24v-6.6c0-3.24-.7-5.73-4.48-5.73-1.82 0-3.04 1-3.54 1.95h-.05V8.5Z',
  'fa-github': 'M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.2-3.37-1.2-.46-1.18-1.11-1.49-1.11-1.49-.9-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.33 1.11 2.9.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.09 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.07A9.3 9.3 0 0 1 12 6.87a9.3 9.3 0 0 1 2.5.35c1.9-1.35 2.74-1.07 2.74-1.07.56 1.42.21 2.47.1 2.73.64.73 1.03 1.66 1.03 2.8 0 3.96-2.35 4.82-4.59 5.07.36.32.69.94.69 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z',
  'fa-globe': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.02a15.7 15.7 0 0 0-1.24-5A8.03 8.03 0 0 1 19.93 11ZM12 4.04c.82 1 1.97 3.18 2.46 6H9.54c.49-2.82 1.64-5 2.46-6ZM4.33 6a15.7 15.7 0 0 0-1.24 5H.07A8.03 8.03 0 0 1 4.33 6ZM4.07 13h3.02c.17 1.83.6 3.52 1.24 5A8.03 8.03 0 0 1 4.07 13Zm5.47 0h4.92c-.49 2.82-1.64 5-2.46 6-.82-1-1.97-3.18-2.46-6Zm7.13 5c.64-1.48 1.07-3.17 1.24-5h3.02A8.03 8.03 0 0 1 16.67 18Z',
  'fa-trophy': 'M7 4V2h10v2h2a1 1 0 0 1 1 1v2a5 5 0 0 1-5 5h-.2A5.98 5.98 0 0 1 13 14.92V18h3v2H8v-2h3v-3.08A5.98 5.98 0 0 1 9.2 12H9A5 5 0 0 1 4 7V5a1 1 0 0 1 1-1h2Zm0 2H6v1a3 3 0 0 0 3 3h.08A6.02 6.02 0 0 1 7 6Zm10 0a6.02 6.02 0 0 1-2.08 4H15a3 3 0 0 0 3-3V6h-1Z',
  'fa-shield-alt': 'M12 2 4 5v5c0 5.25 3.4 10.17 8 12 4.6-1.83 8-6.75 8-12V5l-8-3Zm0 3.13 5 1.88v3c0 3.98-2.45 7.82-5 9.4-2.55-1.58-5-5.42-5-9.4v-3l5-1.88Z',
  'fa-server': 'M4 4h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 9h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm3-6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  'fa-chart-line': 'M4 19h16v2H2V4h2v15Zm2-3.5 4.5-4.5 2.5 2.5 5-6 1.5 1.25-6.4 7.7-2.6-2.6L7.4 17 6 15.5Z',
  'fa-cloud': 'M18.5 19h-11a4.5 4.5 0 0 1-.55-8.97A6.5 6.5 0 0 1 19 8.75 4.25 4.25 0 1 1 18.5 19Z',
  'fa-database': 'M12 3c-4.97 0-9 1.34-9 3s4.03 3 9 3 9-1.34 9-3-4.03-3-9-3Zm-9 7v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4c-2 1.4-5.67 2-9 2s-7-.6-9-2Zm0 6v4c0 1.66 4.03 3 9 3s9-1.34 9-3v-4c-2 1.4-5.67 2-9 2s-7-.6-9-2Z',
  'fa-map-marker-alt': 'M12 2a6 6 0 0 0-6 6c0 4.2 6 12 6 12s6-7.8 6-12a6 6 0 0 0-6-6Zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5Z',
  'fa-euro-sign': 'M14.9 5.3A5.5 5.5 0 0 0 8.7 8H6v2h2.1c-.04.33-.06.66-.06 1s.02.67.06 1H6v2h2.7a5.5 5.5 0 0 0 6.2 2.7l-.5-1.94A3.5 3.5 0 0 1 10.8 14h4.2v-2h-4.8a4.7 4.7 0 0 1 0-2H15V8h-4.2a3.5 3.5 0 0 1 3.6-.76l.5-1.94Z',
  'fa-users': 'M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1H3Zm13.5 0v-.5a5.5 5.5 0 0 0-2.1-4.33A4.96 4.96 0 0 1 21 20h-4.5Z',
  'fa-envelope': 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.2l9 6.3 9-6.3V7l-9 6.3L3 7Zm18 10V9.64l-8.43 5.9a1 1 0 0 1-1.14 0L3 9.64V17h18Z',
  'fa-download': 'M11 3h2v9.17l3.59-3.58L18 10l-6 6-6-6 1.41-1.41L11 12.17V3Zm-7 15h16v2H4v-2Z',
  'fa-award': 'M12 2a5 5 0 0 1 5 5c0 1.2-.43 2.3-1.14 3.14L18 22l-6-2-6 2 2.14-11.86A4.98 4.98 0 0 1 7 7a5 5 0 0 1 5-5Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  'fa-crown': 'M3 18h18l-1 3H4l-1-3Zm1-10 4.5 4L12 6l3.5 6L20 8l1 8H3l1-8Z',
  'fa-lock': 'M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 1 0-6 0v2Z',
  'fa-star': 'm12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.56L12 17.48 6.12 20.62l1.12-6.56L2.48 9.42l6.58-.96L12 2.5Z',
  'fa-chevron-down': 'm6 9 6 6 6-6',
  'fa-users-cog': 'M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm-6 9v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 4.22 2.32 5.5 5.5 0 0 0-.97 1.23A2.99 2.99 0 0 0 12 20H3Zm14.94-8.56-.5 1.06a4 4 0 0 1 .44.76l1.16.18.35 1.88-1.02.6a4 4 0 0 1-.03.88l.97.67-.48 1.84-1.18.05a4 4 0 0 1-.58.67l.29 1.14-1.7.86-.85-.82a4 4 0 0 1-.86-.02l-.79.88-1.74-.78.2-1.16a4 4 0 0 1-.64-.62l-1.18.03-.4-1.86 1-.64a4 4 0 0 1 0-.88l-1.02-.61.37-1.87 1.16-.16a4 4 0 0 1 .47-.74l-.46-1.07 1.54-1.13.94.7a4 4 0 0 1 .84-.18l.57-1.04 1.9.2.34 1.14c.28.09.54.22.79.37l1-.62 1.48 1.2Zm-3.09 2.06a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  'fa-paper-plane': 'M3 11.5 21 3l-4.5 18-4.7-6.3L3 11.5Zm8.1 1.5 3.14 4.2L17 6.4 6.25 11.47 11.1 13Z',
  'fa-info-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 12 6Zm1.5 11h-3v-1.5H11v-4h-1V10h2.5v5.5h1V17Z',
  'fa-user-tie': 'M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-5 18v-1a5 5 0 0 1 5-5 5 5 0 0 1 5 5v1H7Zm4-9h2l1.2 1.5L12 17l-2.2-4.5L11 11Z',
  'fa-calendar-alt': 'M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h3V2Zm12 8H5v10h14V10ZM5 8h14V6H5v2Z',
  'fa-check': 'm5 12 4 4 10-10',
  'fa-check-circle': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.1 13.6L7.3 12l1.4-1.4 2.2 2.2 4.4-4.4 1.4 1.4-5.8 5.8Z',
  'fa-bars': 'M4 7h16M4 12h16M4 17h16',
  'fa-times': 'm6 6 12 12M18 6 6 18'
});

const FILLED_ICON_NAMES = new Set([
  'fa-linkedin-in', 'fa-github', 'fa-globe', 'fa-trophy', 'fa-shield-alt',
  'fa-server', 'fa-chart-line', 'fa-cloud', 'fa-database', 'fa-map-marker-alt',
  'fa-euro-sign', 'fa-users', 'fa-envelope', 'fa-download', 'fa-award',
  'fa-crown', 'fa-lock', 'fa-star', 'fa-users-cog', 'fa-paper-plane',
  'fa-info-circle', 'fa-user-tie', 'fa-calendar-alt', 'fa-check-circle'
]);

let currentLanguage = DEFAULT_LANG;
let closeMobileMenuRef = null;
let revealObserver = null;

function byId(id) {
  return document.getElementById(id);
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function renderIconSvg(iconName, className, decorative) {
  const path = ICON_PATHS[iconName];
  if (!path) return '';

  const vector = FILLED_ICON_NAMES.has(iconName)
    ? `<path d="${path}" fill="currentColor"></path>`
    : `<path d="${path}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>`;

  return `<svg class="icon ${className || ''}" viewBox="0 0 24 24"${decorative ? ' aria-hidden="true"' : ''} focusable="false">${vector}</svg>`;
}

function extractIconName(className) {
  return className.split(/\s+/).find((token) => token.startsWith('fa-') && token !== 'fas' && token !== 'fab' && token !== 'far') || '';
}

function upgradeLegacyIcons() {
  document.querySelectorAll('i').forEach((node) => {
    const className = node.getAttribute('class') || '';
    const iconName = extractIconName(className);
    if (!iconName) return;

    const remainingClasses = className
      .split(/\s+/)
      .filter((token) => token && !token.startsWith('fa'))
      .join(' ');

    const wrapper = document.createElement('span');
    wrapper.innerHTML = renderIconSvg(iconName, remainingClasses, node.getAttribute('aria-hidden') === 'true' || !node.hasAttribute('aria-label'));
    const svg = wrapper.firstElementChild;
    if (!svg) return;
    if (node.getAttribute('aria-label')) svg.setAttribute('aria-label', node.getAttribute('aria-label'));
    node.replaceWith(svg);
  });
}

function applyRevealState(node, visible) {
  node.classList.add('reveal');
  node.classList.add(`reveal-${node.getAttribute('data-aos') || 'fade-up'}`);
  if (visible) {
    node.classList.add('is-visible');
  } else {
    node.classList.remove('is-visible');
  }
}

function setupRevealAnimations() {
  const nodes = Array.from(document.querySelectorAll('[data-aos]'));
  if (!nodes.length) return;

  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  const revealImmediately = getProtocol() === 'file:' || prefersReducedMotion() || typeof IntersectionObserver === 'undefined';
  nodes.forEach((node) => {
    const delay = Number(node.getAttribute('data-aos-delay') || '0');
    node.style.transitionDelay = `${delay}ms`;
    applyRevealState(node, revealImmediately);
  });

  if (revealImmediately) return;

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      applyRevealState(entry.target, true);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  nodes.forEach((node) => revealObserver.observe(node));
}

function setText(id, value) {
  const node = byId(id);
  if (node) node.textContent = value;
}

function setHtml(id, value) {
  const node = byId(id);
  if (node) node.innerHTML = value;
}

function setButtonContent(id, iconName, text) {
  const node = byId(id);
  if (!node) return;
  node.innerHTML = `${renderIconSvg(iconName, 'mr-2', true)}${text}`;
}

function setInlineIconText(id, iconName, text) {
  const node = byId(id);
  if (!node) return;
  node.innerHTML = `${renderIconSvg(iconName, 'mr-2', true)}${text}`;
}

function getSelectedCvFile() {
  return CV_FILES[currentLanguage] || CV_FILES[DEFAULT_LANG];
}

function getCurrentBadgeLabel() {
  if (currentLanguage === 'es') return 'Actual';
  if (currentLanguage === 'it') return 'In corso';
  return 'Current';
}

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
    return;
  }
  callback();
}

function getSafeStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function getProtocol() {
  try {
    return window.location.protocol || '';
  } catch (error) {
    return '';
  }
}

function detectLanguage() {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (queryLang && LANGS.includes(queryLang)) return queryLang;

  const storage = getSafeStorage();
  const stored = storage ? storage.getItem(LANG_STORAGE_KEY) : null;
  if (stored && LANGS.includes(stored)) return stored;

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (LANGS.includes(browser)) return browser;

  return DEFAULT_LANG;
}

function updateLanguageInUrl(lang) {
  if (getProtocol() === 'file:') return;

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  } catch (error) {
    // Ignore URL/history updates in restricted contexts.
  }
}

function applyDocumentMetadata(content) {
  document.documentElement.lang = currentLanguage;
  document.title = content.meta.title;

  const description = document.querySelector('meta[name="description"]');
  const keywords = document.querySelector('meta[name="keywords"]');
  if (description) description.setAttribute('content', content.meta.description);
  if (keywords) keywords.setAttribute('content', content.meta.keywords);
}

function languageButtonClass(lang) {
  const active = lang === currentLanguage;
  return active
    ? 'px-2 py-1 rounded text-xs font-bold bg-accent text-white'
    : 'px-2 py-1 rounded text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10';
}

function renderLanguageSwitcher(container, mobile) {
  if (!container) return;
  const wrapperClass = mobile ? 'flex gap-2 pt-4 border-t border-white/20 mt-3' : 'flex gap-2 ml-4';
  container.insertAdjacentHTML('beforeend',
    `<div class="${wrapperClass}" aria-label="Language switcher">` +
      LANGS.map((lang) => `<button type="button" class="lang-btn ${languageButtonClass(lang)}" data-lang="${lang}" aria-label="Switch language to ${lang.toUpperCase()}">${lang.toUpperCase()}</button>`).join('') +
    '</div>'
  );
}

function renderNavigationLinks(content) {
  const desktopContainer = byId('nav-links-desktop');
  const mobileContainer = byId('nav-links-mobile');

  const renderLinks = (mobile) => NAV_ITEMS.map((item) => {
    const className = item.cta
      ? (mobile ? CLASSNAMES.mobileNavCta : CLASSNAMES.desktopNavCta)
      : (mobile ? CLASSNAMES.mobileNavItem : CLASSNAMES.desktopNavItem);
    return `<a href="${item.href}" class="${className}">${content.nav[item.key]}</a>`;
  }).join('');

  if (desktopContainer) {
    desktopContainer.innerHTML = renderLinks(false);
    renderLanguageSwitcher(desktopContainer, false);
  }

  if (mobileContainer) {
    mobileContainer.innerHTML = renderLinks(true);
    renderLanguageSwitcher(mobileContainer, true);
  }

  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.getAttribute('data-lang');
      if (!lang || lang === currentLanguage || !LANGS.includes(lang)) return;
      currentLanguage = lang;
      const storage = getSafeStorage();
      if (storage) {
        try {
          storage.setItem(LANG_STORAGE_KEY, lang);
        } catch (error) {
          // Ignore storage writes when blocked by the browser.
        }
      }
      updateLanguageInUrl(lang);
      renderAll();
      if (closeMobileMenuRef) closeMobileMenuRef(false);
    });
  });
}

function renderSocialLinks() {
  const heroContainer = byId('social-links-hero');
  const contactContainer = byId('social-links-contact');

  const renderLinks = (className) => SOCIAL_LINKS.map((item) => (
    `<a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}" class="${className}">` +
    `<i class="${item.iconClass}" aria-hidden="true"></i>` +
    '</a>'
  )).join('');

  if (heroContainer) {
    heroContainer.innerHTML = renderLinks('w-12 h-12 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110');
  }
  if (contactContainer) {
    contactContainer.innerHTML = renderLinks('w-12 h-12 rounded-full bg-primary hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110');
  }
}

function renderProfileText(content) {
  const profile = content.profile;
  setText('availability-text', profile.availability);
  setText('hero-title', profile.title);
  setText('hero-summary', profile.heroSummary);
  setText('hero-location', profile.location);
  setText('hero-budget', profile.budget);
  setText('hero-team-size', profile.teamSize);
  setText('hero-years', `${profile.yearsExperience} ${content.staticText.aboutYearsLabel}`);
  setText('about-years-value', profile.yearsExperience);
  setText('about-summary-1', profile.aboutSummary1);
  setText('about-summary-2', profile.aboutSummary2);
  setText('footer-role', profile.footerRole);

  const footerOpportunity = byId('footer-opportunity');
  if (footerOpportunity) {
    footerOpportunity.innerHTML = `${renderIconSvg('fa-user-tie', 'mr-2', true)}${profile.footerOpportunity}`;
  }
}

function renderStaticText(content) {
  const text = content.staticText;
  const selectedCvFile = getSelectedCvFile();

  setButtonContent('hero-contact-button', 'fa-envelope', text.heroContactButton);

  const heroDownloadButton = byId('hero-download-button');
  if (heroDownloadButton) {
    setButtonContent('hero-download-button', 'fa-download', text.heroDownloadButton);
    heroDownloadButton.setAttribute('href', selectedCvFile);
  }

  setHtml('about-heading', text.aboutHeading);
  const aboutDownloadButton = byId('about-download-button');
  if (aboutDownloadButton) {
    setButtonContent('about-download-button', 'fa-download', text.aboutDownloadButton);
    aboutDownloadButton.setAttribute('href', selectedCvFile);
  }

  setText('about-years-label', text.aboutYearsLabel);

  setHtml('experience-heading', text.experienceHeading);
  setText('experience-subtitle', text.experienceSubtitle);

  setHtml('achievements-heading', text.achievementsHeading);
  setText('achievements-subtitle', text.achievementsSubtitle);

  setHtml('skills-heading', text.skillsHeading);
  setText('skills-subtitle', text.skillsSubtitle);

  setText('competencies-heading', text.competenciesHeading);

  setHtml('contact-heading', text.contactHeading);
  setText('contact-intro', text.contactIntro);
  setText('contact-email-label', text.contactEmailLabel);
  setText('contact-location-label', text.contactLocationLabel);
  setText('contact-social-label', text.contactSocialLabel);
  setText('contact-form-heading', text.contactFormHeading);

  const nameLabel = document.querySelector('label[for="contact-name"]');
  const emailInputLabel = document.querySelector('label[for="contact-email"]');
  const messageLabel = document.querySelector('label[for="contact-message"]');
  if (nameLabel) nameLabel.textContent = text.contactNameLabel;
  if (emailInputLabel) emailInputLabel.textContent = text.contactEmailInputLabel;
  if (messageLabel) messageLabel.textContent = text.contactMessageLabel;

  const nameInput = byId('contact-name');
  const emailInput = byId('contact-email');
  const messageInput = byId('contact-message');
  if (nameInput) nameInput.placeholder = text.contactNamePlaceholder;
  if (emailInput) emailInput.placeholder = text.contactEmailPlaceholder;
  if (messageInput) messageInput.placeholder = text.contactMessagePlaceholder;

  setButtonContent('contact-submit-button', 'fa-paper-plane', text.contactSubmit);

  setInlineIconText('form-success', 'fa-info-circle', text.contactInfo);

  setInlineIconText('footer-references', 'fa-info-circle', text.footerReferences);

  const footerUpdatedLabel = byId('footer-updated-label');
  if (footerUpdatedLabel) {
    footerUpdatedLabel.textContent = text.footerUpdated;
  }
}

function renderExperienceTimeline(content) {
  const container = byId('experience-timeline');
  if (!container) return;

  const html = content.experienceTimeline.map((item, index) => {
    const isRight = index % 2 === 1;
    const delay = Math.min(index * 100, 400);
    const rolePaneOrder = isRight ? 'lg:order-2 order-1 lg:pl-12' : 'lg:text-right lg:pr-12';
    const summaryPaneOrder = isRight ? 'lg:text-right lg:pr-12 mb-4 lg:mb-0 lg:order-1 order-2' : 'lg:pl-12';
    const borderClass = item.current ? 'border-l-4 border-accent' : (isRight ? 'border-l-4 border-secondary lg:border-l-0 lg:border-r-4' : 'border-l-4 border-secondary');
    const dotClass = item.current ? 'bg-accent' : 'bg-secondary';

    const currentBadge = item.current ? getCurrentBadgeLabel() : '';
    const headerBlock = (
      '<div class="lg:text-right lg:pr-12 mb-4 lg:mb-0">' +
      (item.current ? `<div class="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold mb-2">${currentBadge}</div>` : '') +
      `<h3 class="text-2xl font-bold text-primary">${item.role}</h3>` +
      `<p class="${item.current ? 'text-accent' : 'text-secondary'} font-semibold">${item.org}</p>` +
      `<p class="text-soft-text text-sm">${item.period}</p>` +
      '</div>'
    );

    const contentBlock = item.bullets
      ? '<div class="bg-light-bg p-6 rounded-2xl hover-card border-l-4 border-accent"><ul class="space-y-2 text-soft-text">' +
        item.bullets.map((bullet) => (
          '<li class="flex items-start"><i class="fas fa-check text-accent mt-1 mr-2 flex-shrink-0" aria-hidden="true"></i><span>' + bullet + '</span></li>'
        )).join('') +
        '</ul></div>'
      : `<div class="bg-light-bg p-6 rounded-2xl hover-card ${borderClass}"><p class="text-soft-text">${item.summary}</p></div>`;

    return (
      `<article role="listitem" class="relative lg:grid lg:grid-cols-2 lg:gap-8 items-center" data-aos="fade-up"${delay ? ` data-aos-delay="${delay}"` : ''}>` +
      `<div class="${isRight ? summaryPaneOrder : rolePaneOrder} mb-4 lg:mb-0">${isRight ? contentBlock : headerBlock}</div>` +
      `<div class="${isRight ? rolePaneOrder : summaryPaneOrder}">${isRight ? headerBlock : contentBlock}</div>` +
      `<div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 ${dotClass} rounded-full border-4 border-white shadow-lg"></div>` +
      '</article>'
    );
  }).join('');

  container.innerHTML = html;
}

function renderAchievements(content) {
  const container = byId('achievements-grid');
  if (!container) return;

  container.innerHTML = content.achievements.map((item) => {
    const delayAttr = item.delay ? ` data-aos-delay="${item.delay}"` : '';
    return (
      `<article role="listitem" class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover-card group" data-aos="fade-up"${delayAttr}>` +
      '<div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">' +
      `<i class="${item.iconClass} text-2xl text-accent group-hover:text-white transition-colors" aria-hidden="true"></i>` +
      '</div>' +
      `<h3 class="text-xl font-bold text-white mb-3">${item.title}</h3>` +
      `<p class="text-white/70 leading-relaxed">${item.descriptionHtml}</p>` +
      '</article>'
    );
  }).join('');
}

function renderSkills(content) {
  const container = byId('skills-grid');
  if (!container) return;

  container.innerHTML = content.skillGroups.map((group) => {
    const delayAttr = group.delay ? ` data-aos-delay="${group.delay}"` : '';
    const itemsHtml = group.items.map((item) => '<li class="flex items-center text-soft-text"><i class="fas fa-check-circle text-accent mr-3" aria-hidden="true"></i>' + item + '</li>').join('');

    return (
      `<article role="listitem" class="bg-white rounded-2xl p-8 shadow-lg hover-card" data-aos="fade-up"${delayAttr}>` +
      '<div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">' +
      `<i class="${group.iconClass} text-2xl text-primary" aria-hidden="true"></i>` +
      '</div>' +
      `<h3 class="text-xl font-bold text-primary mb-4">${group.title}</h3>` +
      `<ul class="space-y-3">${itemsHtml}</ul>` +
      '</article>'
    );
  }).join('');
}

function renderCompetencies(content) {
  const container = byId('competencies-tags');
  if (!container) return;

  container.innerHTML = content.competencies.map((item) => (
    '<span role="listitem" class="px-6 py-3 bg-white rounded-full text-primary font-semibold shadow-md hover:shadow-lg transition-shadow cursor-default border border-medium-gray">' +
    item +
    '</span>'
  )).join('');
}

function setCurrentDate(locale) {
  const dateNode = byId('current-date');
  const yearNode = byId('current-year');
  if (!dateNode || !yearNode) return;

  const now = new Date();
  dateNode.textContent = now.toLocaleDateString(locale || 'en-US', { month: 'short', year: 'numeric' });
  yearNode.textContent = String(now.getFullYear());
}

function setupNavbarScroll() {
  const navbar = byId('navbar');
  if (!navbar) return;

  const updateNavbarState = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('glass', 'shadow-lg');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('glass', 'shadow-lg');
      navbar.classList.add('bg-transparent');
    }
  };

  window.addEventListener('scroll', updateNavbarState, { passive: true });
  updateNavbarState();
}

function setupMobileMenu() {
  const mobileMenuBtn = byId('mobile-menu-btn');
  const closeMenuBtn = byId('close-menu');
  const mobileMenu = byId('mobile-menu');
  if (!mobileMenuBtn || !closeMenuBtn || !mobileMenu) return;

  const closeMenu = (focusTrigger = true) => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    if (focusTrigger) mobileMenuBtn.focus();
  };

  const openMenu = () => {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    closeMenuBtn.focus();
  };

  closeMobileMenuRef = closeMenu;

  mobileMenuBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', () => closeMenu(true));

  mobileMenu.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('a[href]')) {
      closeMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu(true);
    }

    if (event.key !== 'Tab' || !mobileMenu.classList.contains('open')) return;

    const focusable = mobileMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function setupContactForm(content) {
  const form = byId('contact-form');
  const status = byId('form-success');
  const nameField = byId('contact-name');
  const emailField = byId('contact-email');
  const messageField = byId('contact-message');
  if (!form || !status || !nameField || !emailField || !messageField) return;

  const previous = form.getAttribute('data-bound');
  if (previous === 'true') return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();

    const subjectText = currentLanguage === 'es'
      ? `Contacto web de ${name || 'visitante'}`
      : (currentLanguage === 'it' ? `Contatto web da ${name || 'visitatore'}` : `Website contact from ${name || 'visitor'}`);

    const bodyPrefix = currentLanguage === 'es'
      ? `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`
      : (currentLanguage === 'it' ? `Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}` : `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(bodyPrefix);
    const mailto = `mailto:${content.profile.contactEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    status.classList.remove('hidden');
    form.reset();

    window.setTimeout(() => {
      status.classList.add('hidden');
    }, 5000);
  });

  form.setAttribute('data-bound', 'true');
}

function setupSmoothScroll() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function onAnchorClick(event) {
      event.preventDefault();
      const targetSelector = this.getAttribute('href');
      if (!targetSelector) return;
      const target = document.querySelector(targetSelector);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderAll() {
  const content = I18N[currentLanguage] || I18N[DEFAULT_LANG];
  applyDocumentMetadata(content);
  renderNavigationLinks(content);
  renderSocialLinks();
  renderProfileText(content);
  renderStaticText(content);
  renderExperienceTimeline(content);
  renderAchievements(content);
  renderSkills(content);
  renderCompetencies(content);
  setCurrentDate(content.locale);
  setupContactForm(content);
  upgradeLegacyIcons();
  setupRevealAnimations();
}

function bootstrap() {
  try {
    currentLanguage = detectLanguage();
    renderAll();
    setupNavbarScroll();
    setupMobileMenu();
    setupSmoothScroll();
  } catch (error) {
    console.error('Site bootstrap failed:', error);
    currentLanguage = DEFAULT_LANG;
    renderAll();
  }
}

onReady(bootstrap);
