import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const scriptFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptFile);
const rootDir = path.resolve(scriptDir, '..');
const templatePath = path.join(rootDir, 'scripts', 'page-template.html');
const contentPath = path.join(rootDir, 'assets/js/site-content.js');

const HERO_BADGE_LAYOUT = [
  { key: 'actingCio', icon: 'fa-shield-alt', iconClass: 'text-accent', itemClass: 'hero-badge absolute -top-2 -left-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '0s' },
  { key: 'headOfIt', icon: 'fa-award', iconClass: 'text-accent', itemClass: 'hero-badge absolute -top-2 -right-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '0.5s' },
  { key: 'certifications', icon: 'fa-crown', iconClass: 'text-accent', itemClass: 'hero-badge absolute top-24 -left-20 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '1s' },
  { key: 'continuity', icon: 'fa-cloud', iconClass: 'text-accent', itemClass: 'hero-badge absolute top-24 -right-20 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '1.5s' },
  { key: 'infrastructure', icon: 'fa-server', iconClass: 'text-accent', itemClass: 'hero-badge absolute bottom-20 -left-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '2s' },
  { key: 'security', icon: 'fa-lock', iconClass: 'text-accent', itemClass: 'hero-badge absolute bottom-20 -right-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '2.5s' },
  { key: 'years', icon: 'fa-star', iconClass: 'text-white', itemClass: 'hero-badge absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-accent text-white rounded-full px-6 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold', delay: '3s', textId: 'hero-years' }
];

const ABOUT_FEATURE_LAYOUT = [
  { key: 'dataCenters', icon: 'fa-server' },
  { key: 'cybersecurity', icon: 'fa-shield-alt' },
  { key: 'cloud', icon: 'fa-cloud' },
  { key: 'leadership', icon: 'fa-users-cog' }
];

function loadSiteContent() {
  const sandbox = { globalThis: {} };
  sandbox.global = sandbox.globalThis;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(contentPath, 'utf8'), sandbox, { filename: 'site-content.js' });
  return sandbox.globalThis.__SITE_CONTENT;
}

function iconMarkup(name, className = '', hidden = true) {
  const classes = ['fas', name, className].filter(Boolean).join(' ');
  const aria = hidden ? ' aria-hidden="true"' : '';
  return `<i class="${classes}"${aria}></i>`;
}

function pathForLanguage(lang) {
  return lang === 'en' ? '/' : `/${lang}/`;
}

function canonicalUrl(siteConfig, lang) {
  return `${siteConfig.siteUrl}${pathForLanguage(lang)}`;
}

function relativePrefix(lang) {
  return lang === 'en' ? '' : '../';
}

function currentBadgeLabel(content) {
  return content.staticText.ui.currentBadgeLabel;
}

function collectKnowsAbout(content) {
  const topics = new Set(content.competencies);
  content.skillGroups.forEach((group) => {
    topics.add(group.title);
    group.items.forEach((item) => topics.add(item));
  });
  return Array.from(topics);
}

function buildStructuredData(siteContent, lang, content) {
  const { SITE_CONFIG, SOCIAL_LINKS, LANGS, I18N } = siteContent;
  const sameAs = SOCIAL_LINKS.map((item) => item.href);
  const knowsLanguage = LANGS.map((entry) => I18N[entry]?.locale || entry);
  const knowsAbout = collectKnowsAbout(content);
  const url = canonicalUrl(SITE_CONFIG, lang);
  const websiteId = `${SITE_CONFIG.siteUrl}/#website`;
  const personId = `${SITE_CONFIG.siteUrl}/#person`;
  const profileId = `${url}#profile`;
  const orgHumanTechnopoleId = `${SITE_CONFIG.siteUrl}/#human-technopole`;
  const orgEmblId = `${SITE_CONFIG.siteUrl}/#embl`;
  const currentRole = content.experienceTimeline[0];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_CONFIG.siteName,
      url: `${SITE_CONFIG.siteUrl}/`,
      inLanguage: content.locale,
      description: content.meta.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': profileId,
      url,
      name: content.meta.title,
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      mainEntity: { '@id': personId },
      primaryImageOfPage: SITE_CONFIG.defaultImage,
      inLanguage: content.locale,
      dateModified: new Date().toISOString(),
      description: content.meta.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name: SITE_CONFIG.siteName,
      givenName: 'Carlos',
      familyName: 'Fernández San Millán',
      url,
      image: SITE_CONFIG.defaultImage,
      jobTitle: content.profile.title,
      description: content.meta.description,
      email: `mailto:${content.profile.contactEmail}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: content.profile.location
      },
      worksFor: { '@id': orgHumanTechnopoleId },
      alumniOf: [{ '@id': orgEmblId }],
      knowsLanguage,
      knowsAbout,
      sameAs,
      mainEntityOfPage: { '@id': profileId }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': orgHumanTechnopoleId,
      name: currentRole?.org || 'Human Technopole'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': orgEmblId,
      name: 'European Molecular Biology Laboratory (EMBL)'
    }
  ];
}

function renderNavLinks(siteContent, lang, content, mobile = false) {
  return siteContent.NAV_ITEMS.map((item) => {
    const text = content.nav[item.key];
    const className = item.cta
      ? (mobile ? 'block text-accent py-2 text-xl font-bold' : 'bg-accent hover:bg-accent-light text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all transform hover:scale-105')
      : (mobile ? 'block text-white hover:text-accent py-2 text-xl font-semibold' : 'text-white hover:text-accent px-3 py-2 rounded-md text-base font-semibold transition-colors');
    return `<a href="${pathForLanguage(lang)}#${item.key}" class="${className}">${text}</a>`;
  }).join('');
}

function renderLanguageLinks(siteContent, currentLang, mobile = false, label = 'Language switcher') {
  const wrapperClass = mobile ? 'pt-6 mt-6 border-t border-white/10 flex gap-2' : 'ml-6 flex gap-2';
  const links = siteContent.LANGS.map((lang) => {
    const isActive = lang === currentLang;
    const className = [
      'lang-btn px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
      isActive
        ? 'bg-accent text-white border-accent'
        : 'bg-transparent text-white/80 border-white/20 hover:text-white hover:border-accent'
    ].join(' ');
    const ariaCurrent = isActive ? ' aria-current="true"' : '';
    return `<a href="${pathForLanguage(lang)}" class="${className}" data-lang="${lang}"${ariaCurrent}>${lang.toUpperCase()}</a>`;
  }).join('');
  return `<div class="${wrapperClass}" aria-label="${label}">${links}</div>`;
}

function renderSocialLinks(siteContent, content, hero = true) {
  const className = hero
    ? 'w-12 h-12 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110'
    : 'w-12 h-12 rounded-full bg-primary hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110';

  return siteContent.SOCIAL_LINKS.map((item) => {
    const label = content.staticText.ui.socialLinkLabels[item.key] || item.key;
    return `<a href="${item.href}" target="_blank" rel="noopener noreferrer me" aria-label="${label}" class="${className}"><i class="${item.iconClass}" aria-hidden="true"></i></a>`;
  }).join('');
}

function renderHeroBadges(content) {
  return HERO_BADGE_LAYOUT.map((item) => {
    const textId = item.textId ? ` id="${item.textId}"` : '';
    return `<li class="${item.itemClass}" style="animation-delay: ${item.delay};"><span class="flex items-center gap-2">${iconMarkup(item.icon, item.iconClass)}<span${textId} class="${item.textClass}">${content.profile.badges[item.key] || ''}</span></span></li>`;
  }).join('');
}

function renderAboutFeatures(content) {
  return ABOUT_FEATURE_LAYOUT.map((item) => {
    const feature = content.profile.features[item.key];
    if (!feature) return '';
    return `<li class="profile-feature-item flex items-start"><div class="profile-feature-icon">${iconMarkup(item.icon, 'text-accent text-xl')}</div><div><h3 class="font-bold text-primary text-lg">${feature.title}</h3><p class="text-sm text-soft-text">${feature.subtitle}</p></div></li>`;
  }).join('');
}

function renderExperienceTimeline(content) {
  return content.experienceTimeline.map((item, index) => {
    const isRight = index % 2 === 1;
    const delay = Math.min(index * 100, 400);
    const headerAlignmentClass = isRight ? '' : 'lg:text-right';
    const headerSpacingClass = isRight ? 'lg:pl-12' : 'lg:pr-12';
    const summaryAlignmentClass = isRight ? 'lg:text-right' : '';
    const summarySpacingClass = isRight ? 'lg:pr-12' : 'lg:pl-12';
    const borderClass = item.current ? 'border-l-4 border-accent' : (isRight ? 'border-l-4 border-secondary lg:border-l-0 lg:border-r-4' : 'border-l-4 border-secondary');
    const dotClass = item.current ? 'bg-accent' : 'bg-secondary';
    const currentBadge = item.current ? `<div class="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold mb-2">${currentBadgeLabel(content)}</div>` : '';
    const summaryContent = item.bullets
      ? `<div class="bg-light-bg p-6 rounded-2xl hover-card border-l-4 border-accent"><ul class="space-y-2 text-soft-text">${item.bullets.map((bullet) => `<li class="flex items-start">${iconMarkup('fa-check', 'text-accent mt-1 mr-2 flex-shrink-0')}<span>${bullet}</span></li>`).join('')}</ul></div>`
      : `<div class="bg-light-bg p-6 rounded-2xl hover-card ${borderClass}"><p class="text-soft-text">${item.summary}</p></div>`;
    const headerContent = `${currentBadge}<h3 class="text-2xl font-bold text-primary">${item.role}</h3><p class="${item.current ? 'text-accent' : 'text-secondary'} font-semibold">${item.org}</p><p class="text-soft-text text-sm">${item.period}</p>`;

    const leftPane = isRight
      ? `<div class="${summaryAlignmentClass} ${summarySpacingClass} mb-4 lg:mb-0 lg:order-1 order-2">${summaryContent}</div>`
      : `<div class="${headerAlignmentClass} ${headerSpacingClass} mb-4 lg:mb-0">${headerContent}</div>`;
    const rightPane = isRight
      ? `<div class="${headerAlignmentClass} ${headerSpacingClass} lg:order-2 order-1">${headerContent}</div>`
      : `<div class="${summaryAlignmentClass} ${summarySpacingClass}">${summaryContent}</div>`;

    return `<article role="listitem" class="relative lg:grid lg:grid-cols-2 lg:gap-8 items-center" data-aos="fade-up"${delay ? ` data-aos-delay="${delay}"` : ''}>${leftPane}${rightPane}<div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 ${dotClass} rounded-full border-4 border-white shadow-lg"></div></article>`;
  }).join('');
}

function renderAchievements(content) {
  return content.achievements.map((item) => {
    const delayAttr = item.delay ? ` data-aos-delay="${item.delay}"` : '';
    const iconName = item.iconClass.split(/\s+/).find((token) => token.startsWith('fa-')) || 'fa-star';
    return `<article role="listitem" class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover-card group" data-aos="fade-up"${delayAttr}><div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">${iconMarkup(iconName, 'text-2xl text-accent group-hover:text-white transition-colors')}</div><h3 class="text-xl font-bold text-white mb-3">${item.title}</h3><p class="text-white/70 leading-relaxed">${item.descriptionHtml}</p></article>`;
  }).join('');
}

function renderSkills(content) {
  return content.skillGroups.map((group) => {
    const delayAttr = group.delay ? ` data-aos-delay="${group.delay}"` : '';
    const iconName = group.iconClass.split(/\s+/).find((token) => token.startsWith('fa-')) || 'fa-star';
    const itemsHtml = group.items.map((item) => `<li class="flex items-center text-soft-text">${iconMarkup('fa-check-circle', 'text-accent mr-3')}${item}</li>`).join('');
    return `<article role="listitem" class="bg-white rounded-2xl p-8 shadow-lg hover-card" data-aos="fade-up"${delayAttr}><div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">${iconMarkup(iconName, 'text-2xl text-primary')}</div><h3 class="text-xl font-bold text-primary mb-4">${group.title}</h3><ul class="space-y-3">${itemsHtml}</ul></article>`;
  }).join('');
}

function renderCompetencies(content) {
  return content.competencies.map((item) => `<span role="listitem" class="px-6 py-3 bg-white rounded-full text-primary font-semibold shadow-md hover:shadow-lg transition-shadow cursor-default border border-medium-gray">${item}</span>`).join('');
}

function renderExperienceSection(content) {
  return `<section id="experience" aria-labelledby="experience-heading" class="py-24 bg-white relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-light-bg to-white"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16" data-aos="fade-up">
                <h2 id="experience-heading" class="section-display text-4xl font-bold text-primary mb-4">${content.staticText.experienceHeading}</h2>
                <p id="experience-subtitle" class="text-lg text-soft-text max-w-2xl mx-auto">${content.staticText.experienceSubtitle}</p>
            </div>
            <div class="relative">
                <div class="hidden lg:block timeline-line"></div>
                <div id="experience-timeline" role="list" class="space-y-12">${renderExperienceTimeline(content)}</div>
            </div>
        </div>
    </section>`;
}

function renderAchievementsSection(content) {
  return `<section id="achievements" aria-labelledby="achievements-heading" class="py-24 bg-primary relative overflow-hidden">
        <div class="absolute inset-0">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-secondary to-primary"></div>
            <div class="absolute top-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16" data-aos="fade-up">
                <h2 id="achievements-heading" class="section-display text-4xl font-bold text-white mb-4">${content.staticText.achievementsHeading}</h2>
                <p id="achievements-subtitle" class="text-lg text-white/70 max-w-2xl mx-auto">${content.staticText.achievementsSubtitle}</p>
            </div>
            <div id="achievements-grid" role="list" class="grid md:grid-cols-2 gap-8">${renderAchievements(content)}</div>
        </div>
    </section>`;
}

function renderSkillsSection(content) {
  return `<section id="skills" aria-labelledby="skills-heading" class="py-24 bg-light-bg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16" data-aos="fade-up">
                <h2 id="skills-heading" class="section-display text-4xl font-bold text-primary mb-4">${content.staticText.skillsHeading}</h2>
                <p id="skills-subtitle" class="text-lg text-soft-text max-w-2xl mx-auto">${content.staticText.skillsSubtitle}</p>
            </div>
            <div id="skills-grid" role="list" class="grid md:grid-cols-3 gap-8">${renderSkills(content)}</div>
            <div class="mt-16" data-aos="fade-up">
                <h3 id="competencies-heading" class="text-2xl font-bold text-primary text-center mb-8">${content.staticText.competenciesHeading}</h3>
                <div id="competencies-tags" role="list" class="flex flex-wrap justify-center gap-3">${renderCompetencies(content)}</div>
            </div>
        </div>
    </section>`;
}

function setMeta(document, selector, value, attribute = 'content') {
  const node = document.querySelector(selector);
  if (node) node.setAttribute(attribute, value);
}

function setText(document, id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function setHtml(document, id, value) {
  const node = document.getElementById(id);
  if (node) node.innerHTML = value;
}

function setPlaceholder(document, id, value) {
  const node = document.getElementById(id);
  if (node) node.setAttribute('placeholder', value);
}

function setHref(document, id, value) {
  const node = document.getElementById(id);
  if (node) node.setAttribute('href', value);
}

function setAria(document, id, value) {
  const node = document.getElementById(id);
  if (node) node.setAttribute('aria-label', value);
}

function injectGoogleAnalytics(document, siteContent) {
  const measurementId = siteContent.SITE_CONFIG.googleAnalyticsId;
  if (!measurementId) return;

  const existingLoader = document.querySelector('script[data-google-analytics="loader"]');
  const existingConfig = document.querySelector('script[data-google-analytics="config"]');
  if (existingLoader || existingConfig) return;

  const loader = document.createElement('script');
  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  loader.setAttribute('data-google-analytics', 'loader');

  const config = document.createElement('script');
  config.setAttribute('data-google-analytics', 'config');
  config.textContent = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    `gtag('config', '${measurementId}');`
  ].join('\n');

  const structuredData = document.getElementById('structured-data');
  if (structuredData && structuredData.parentNode) {
    structuredData.insertAdjacentElement('afterend', loader);
    loader.insertAdjacentElement('afterend', config);
    return;
  }

  document.head.appendChild(loader);
  document.head.appendChild(config);
}

function updateAssetPaths(document, lang) {
  const prefix = relativePrefix(lang);
  if (!prefix) return;

  document.querySelectorAll('link[href^="assets/"]').forEach((node) => {
    node.setAttribute('href', `${prefix}${node.getAttribute('href')}`);
  });
  document.querySelectorAll('script[src^="assets/"]').forEach((node) => {
    node.setAttribute('src', `${prefix}${node.getAttribute('src')}`);
  });
  document.querySelectorAll('source').forEach((node) => {
    const srcset = node.getAttribute('srcset');
    if (srcset === './photo.webp' || srcset === 'photo.webp') {
      node.setAttribute('srcset', `${prefix}photo.webp`);
    }
  });
  document.querySelectorAll('img').forEach((node) => {
    const src = node.getAttribute('src');
    if (src === './photo.jpg' || src === 'photo.jpg') {
      node.setAttribute('src', `${prefix}photo.jpg`);
    }
  });
  const preload = Array.from(document.querySelectorAll('link[rel="preload"]')).find((node) => {
    const href = node.getAttribute('href');
    return href === './photo.webp' || href === 'photo.webp';
  });
  if (preload) preload.setAttribute('href', `${prefix}photo.webp`);
}

function sanitizeTemplate(document) {
  [
    'nav-links-desktop', 'nav-links-mobile', 'social-links-hero', 'hero-badge-list', 'about-feature-list',
    'social-links-contact'
  ].forEach((id) => setHtml(document, id, ''));
}

function populateDocument(document, siteContent, lang) {
  const content = siteContent.I18N[lang];
  const currentDate = new Date().toLocaleDateString(content.locale, { month: 'short', year: 'numeric' });
  const currentYear = String(new Date().getFullYear());
  const canonical = canonicalUrl(siteContent.SITE_CONFIG, lang);
  const prefix = relativePrefix(lang);

  sanitizeTemplate(document);
  injectGoogleAnalytics(document, siteContent);

  document.documentElement.lang = lang;
  document.title = content.meta.title;
  setMeta(document, 'meta[name="description"]', content.meta.description);
  setMeta(document, 'meta[name="keywords"]', content.meta.keywords);
  setMeta(document, 'meta[name="author"]', siteContent.SITE_CONFIG.author);
  setMeta(document, 'meta[name="robots"]', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setMeta(document, 'meta[property="og:title"]', content.meta.title);
  setMeta(document, 'meta[property="og:description"]', content.meta.description);
  setMeta(document, 'meta[property="og:url"]', canonical);
  setMeta(document, 'meta[property="og:image"]', siteContent.SITE_CONFIG.defaultImage);
  setMeta(document, 'meta[property="og:site_name"]', siteContent.SITE_CONFIG.siteName);
  setMeta(document, 'meta[property="og:locale"]', content.locale.replace('-', '_'));
  setMeta(document, 'meta[property="og:image:alt"]', content.meta.title);
  setMeta(document, 'meta[name="twitter:title"]', content.meta.title);
  setMeta(document, 'meta[name="twitter:description"]', content.meta.description);
  setMeta(document, 'meta[name="twitter:image"]', siteContent.SITE_CONFIG.defaultImage);
  setMeta(document, 'meta[name="twitter:image:alt"]', content.meta.title);

  const canonicalNode = document.querySelector('link[rel="canonical"]');
  if (canonicalNode) canonicalNode.setAttribute('href', canonical);
  const alternate = {
    'x-default': `${siteContent.SITE_CONFIG.siteUrl}/`,
    en: `${siteContent.SITE_CONFIG.siteUrl}/`,
    es: `${siteContent.SITE_CONFIG.siteUrl}/es/`,
    it: `${siteContent.SITE_CONFIG.siteUrl}/it/`
  };
  Object.entries(alternate).forEach(([langKey, href]) => {
    const node = document.querySelector(`link[rel="alternate"][hreflang="${langKey}"]`);
    if (node) node.setAttribute('href', href);
  });

  const structured = document.getElementById('structured-data');
  if (structured) structured.textContent = JSON.stringify(buildStructuredData(siteContent, lang, content));

  setText(document, 'skip-link', content.staticText.ui.skipLink);
  setAria(document, 'navbar', content.staticText.ui.primaryNavLabel);
  setAria(document, 'brand-home-link', content.staticText.ui.homeLinkLabel);
  setHref(document, 'brand-home-link', `${pathForLanguage(lang)}#home`);
  setAria(document, 'mobile-menu-btn', content.staticText.ui.openMenuLabel);
  setAria(document, 'mobile-menu', content.staticText.ui.mobileNavLabel);
  setAria(document, 'close-menu', content.staticText.ui.closeMenuLabel);
  setAria(document, 'hero-stat-list', content.staticText.ui.heroStatsLabel);
  setAria(document, 'hero-badge-list', content.staticText.ui.heroBadgesLabel);
  setAria(document, 'scroll-to-about-link', content.staticText.ui.scrollToAboutLabel);
  setAria(document, 'contact-method-list', content.staticText.ui.contactMethodsLabel);
  setAria(document, 'social-links-hero', content.staticText.ui.socialLinksLabel);
  setAria(document, 'social-links-contact', content.staticText.ui.socialLinksLabel);
  setAria(document, 'about-feature-list', content.staticText.ui.aboutFeaturesLabel);
  setHref(document, 'scroll-to-about-link', `${pathForLanguage(lang)}#about`);

  setHtml(document, 'nav-links-desktop', `${renderNavLinks(siteContent, lang, content, false)}${renderLanguageLinks(siteContent, lang, false, content.staticText.ui.languageSwitcherLabel)}`);
  setHtml(document, 'nav-links-mobile', `${renderNavLinks(siteContent, lang, content, true)}${renderLanguageLinks(siteContent, lang, true, content.staticText.ui.languageSwitcherLabel)}`);

  setText(document, 'availability-text', content.profile.availability);
  setText(document, 'hero-title', content.profile.title);
  setText(document, 'hero-summary', content.profile.heroSummary);
  setText(document, 'hero-location', content.profile.location);
  setText(document, 'hero-budget', content.profile.budget);
  setText(document, 'hero-team-size', content.profile.teamSize);
  setHref(document, 'hero-contact-button', `mailto:${content.profile.contactEmail}`);
  setHtml(document, 'hero-contact-button', `${iconMarkup('fa-envelope', 'mr-2')}${content.staticText.heroContactButton}`);
  setHref(document, 'hero-download-button', `${prefix}carlos-fernandez-san-millan-${lang}.pdf`);
  setHtml(document, 'hero-download-button', `${iconMarkup('fa-download', 'mr-2')}${content.staticText.heroDownloadButton}`);
  setHtml(document, 'social-links-hero', renderSocialLinks(siteContent, content, true));
  setHtml(document, 'hero-badge-list', renderHeroBadges(content));

  setText(document, 'about-years-value', content.profile.yearsExperience);
  setText(document, 'about-years-label', content.staticText.aboutYearsLabel);
  setHtml(document, 'about-heading', content.staticText.aboutHeading);
  setText(document, 'about-summary-1', content.profile.aboutSummary1);
  setText(document, 'about-summary-2', content.profile.aboutSummary2);
  setHtml(document, 'about-feature-list', renderAboutFeatures(content));
  setHref(document, 'about-download-button', `${prefix}carlos-fernandez-san-millan-${lang}.pdf`);
  setHtml(document, 'about-download-button', `${iconMarkup('fa-download', 'mr-2')}${content.staticText.aboutDownloadButton}`);

  document.getElementById('experience').outerHTML = renderExperienceSection(content);
  document.getElementById('achievements').outerHTML = renderAchievementsSection(content);
  document.getElementById('skills').outerHTML = renderSkillsSection(content);

  setHtml(document, 'contact-heading', content.staticText.contactHeading);
  setText(document, 'contact-intro', content.staticText.contactIntro);
  setText(document, 'contact-method-email-label', content.staticText.contactEmailLabel);
  setHref(document, 'contact-method-email-value', `mailto:${content.profile.contactEmail}`);
  setText(document, 'contact-method-email-value', content.profile.contactEmail);
  setText(document, 'contact-method-location-label', content.staticText.contactLocationLabel);
  setText(document, 'contact-method-location-value', content.profile.location);
  setText(document, 'contact-social-label', content.staticText.contactSocialLabel);
  setHtml(document, 'social-links-contact', renderSocialLinks(siteContent, content, false));

  setText(document, 'contact-form-heading', content.staticText.contactFormHeading);
  setText(document, 'contact-form-name-label', content.staticText.contactNameLabel);
  setPlaceholder(document, 'contact-name', content.staticText.contactNamePlaceholder);
  setText(document, 'contact-form-email-label', content.staticText.contactEmailInputLabel);
  setPlaceholder(document, 'contact-email', content.staticText.contactEmailPlaceholder);
  setText(document, 'contact-form-message-label', content.staticText.contactMessageLabel);
  setPlaceholder(document, 'contact-message', content.staticText.contactMessagePlaceholder);
  setHtml(document, 'contact-form-submit-button', `${iconMarkup('fa-paper-plane', 'mr-2')}${content.staticText.contactSubmit}`);
  setHtml(document, 'form-success', `${iconMarkup('fa-info-circle', 'mr-2')}${content.staticText.contactInfo}`);

  setText(document, 'footer-role', content.profile.footerRole);
  setHtml(document, 'footer-references', `${iconMarkup('fa-info-circle', 'mr-2')}${content.staticText.footerReferences}`);
  setHtml(document, 'footer-opportunity', `${iconMarkup('fa-user-tie', 'mr-2')}${content.profile.footerOpportunity}`);
  setText(document, 'footer-updated-label', content.staticText.footerUpdated);
  setText(document, 'current-date', currentDate);
  setHtml(document, 'footer-copyright', `&copy; <span id="current-year">${currentYear}</span> ${content.staticText.footerCopyright}`);

  updateAssetPaths(document, lang);
}

function buildPage(siteContent, lang) {
  const template = fs.readFileSync(templatePath, 'utf8');
  const dom = new JSDOM(template);
  populateDocument(dom.window.document, siteContent, lang);
  return dom.serialize();
}

function writePage(filePath, html) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html);
}

const siteContent = loadSiteContent();
writePage(path.join(rootDir, 'index.html'), buildPage(siteContent, 'en'));
writePage(path.join(rootDir, 'es', 'index.html'), buildPage(siteContent, 'es'));
writePage(path.join(rootDir, 'it', 'index.html'), buildPage(siteContent, 'it'));
