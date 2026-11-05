import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { JSDOM } from 'jsdom';
import { transformSync } from 'esbuild';
import { CSP } from './security-headers.mjs';

// Deterministic builds: set SOURCE_DATE (ISO 8601) to pin the generated date.
const BUILD_DATE = process.env.SOURCE_DATE ? new Date(process.env.SOURCE_DATE) : new Date();
if (Number.isNaN(BUILD_DATE.getTime())) throw new Error('Invalid SOURCE_DATE');

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
      primaryImageOfPage: SITE_CONFIG.portraitImage,
      inLanguage: content.locale,
      dateModified: BUILD_DATE.toISOString(),
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
      image: SITE_CONFIG.portraitImage,
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
  return `<div class="${wrapperClass}" role="group" aria-label="${label}">${links}</div>`;
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

    // Source order is always title -> description; `lg:order-*` swaps the sides on desktop.
    const headerPane = `<div class="${headerAlignmentClass} ${headerSpacingClass} mb-4 lg:mb-0${isRight ? ' lg:order-2' : ''}">${headerContent}</div>`;
    const contentPane = `<div class="${summaryAlignmentClass} ${summarySpacingClass}${isRight ? ' lg:order-1' : ''}">${summaryContent}</div>`;

    return `<li class="relative lg:grid lg:grid-cols-2 lg:gap-8 items-center" data-aos="fade-up"${delay ? ` data-aos-delay="${delay}"` : ''}>${headerPane}${contentPane}<div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 ${dotClass} rounded-full border-4 border-white shadow-lg"></div></li>`;
  }).join('');
}

function renderAchievements(content) {
  return content.achievements.map((item) => {
    const delayAttr = item.delay ? ` data-aos-delay="${item.delay}"` : '';
    const iconName = item.iconClass.split(/\s+/).find((token) => token.startsWith('fa-')) || 'fa-star';
    return `<li class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover-card group" data-aos="fade-up"${delayAttr}><div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">${iconMarkup(iconName, 'text-2xl text-accent group-hover:text-white transition-colors')}</div><h3 class="text-xl font-bold text-white mb-3">${item.title}</h3><p class="text-white/70 leading-relaxed">${item.descriptionHtml}</p></li>`;
  }).join('');
}

function renderSkills(content) {
  return content.skillGroups.map((group) => {
    const delayAttr = group.delay ? ` data-aos-delay="${group.delay}"` : '';
    const iconName = group.iconClass.split(/\s+/).find((token) => token.startsWith('fa-')) || 'fa-star';
    const itemsHtml = group.items.map((item) => `<li class="flex items-center text-soft-text">${iconMarkup('fa-check-circle', 'text-accent mr-3')}${item}</li>`).join('');
    return `<li class="bg-white rounded-2xl p-8 shadow-lg hover-card" data-aos="fade-up"${delayAttr}><div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">${iconMarkup(iconName, 'text-2xl text-primary')}</div><h3 class="text-xl font-bold text-primary mb-4">${group.title}</h3><ul class="space-y-3">${itemsHtml}</ul></li>`;
  }).join('');
}

function renderCompetencies(content) {
  return content.competencies.map((item) => `<li class="px-6 py-3 bg-white rounded-full text-primary font-semibold shadow-md hover:shadow-lg transition-shadow cursor-default border border-medium-gray">${item}</li>`).join('');
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
                <ul id="experience-timeline" role="list" class="space-y-12">${renderExperienceTimeline(content)}</ul>
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
            <ul id="achievements-grid" role="list" class="grid md:grid-cols-2 gap-8">${renderAchievements(content)}</ul>
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
            <ul id="skills-grid" role="list" class="grid md:grid-cols-3 gap-8">${renderSkills(content)}</ul>
            <div class="mt-16" data-aos="fade-up">
                <h3 id="competencies-heading" class="text-2xl font-bold text-primary text-center mb-8">${content.staticText.competenciesHeading}</h3>
                <ul id="competencies-tags" role="list" class="flex flex-wrap justify-center gap-3">${renderCompetencies(content)}</ul>
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

// ---------------------------------------------------------------------------
// Asset pipeline: one hashed JS bundle + one hashed CSS bundle (assets/dist)
// ---------------------------------------------------------------------------
const JS_ORDER = ['site-content', 'site-utils', 'site-icons', 'site-dom', 'site-render', 'site-interactions', 'site-effects', 'site-palette', 'consent', 'main'];
const CSS_ORDER = ['assets/css/tailwind.css', 'assets/css/styles.css'];
const distDir = path.join(rootDir, 'assets', 'dist');

function buildBundles() {
  const js = JS_ORDER.map((name) => fs.readFileSync(path.join(rootDir, 'assets/js', `${name}.js`), 'utf8')).join('\n;\n');
  const css = CSS_ORDER.map((file) => fs.readFileSync(path.join(rootDir, file), 'utf8')).join('\n');
  const jsOut = transformSync(js, { loader: 'js', minify: true, target: 'es2019', legalComments: 'none' }).code;
  const cssOut = transformSync(css, { loader: 'css', minify: true, legalComments: 'none' }).code;
  const hash = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
  const jsName = `app.${hash(jsOut)}.js`;
  const cssName = `site.${hash(cssOut)}.css`;

  fs.mkdirSync(distDir, { recursive: true });
  for (const old of fs.readdirSync(distDir)) fs.rmSync(path.join(distDir, old));
  fs.writeFileSync(path.join(distDir, jsName), jsOut);
  fs.writeFileSync(path.join(distDir, cssName), cssOut);
  return { js: `assets/dist/${jsName}`, css: `assets/dist/${cssName}` };
}

const FONT_FILES = [
  'assets/fonts/eb-garamond/eb-garamond-latin-400-normal.woff2',
  'assets/fonts/eb-garamond/eb-garamond-latin-600-normal.woff2',
  'assets/fonts/eb-garamond/eb-garamond-latin-700-normal.woff2',
  'assets/fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2'
];
const PHOTO_WIDTHS = [320, 640, 881];
const PHOTO_SIZE = { width: 881, height: 1011 };

function photoSet(prefix, ext) {
  return PHOTO_WIDTHS.map((w) => `${prefix}assets/img/photo-${w}.${ext} ${w}w`).join(', ');
}

function pictureMarkup(prefix, kind) {
  const hero = kind === 'hero';
  const sizes = hero ? '320px' : '(min-width: 1024px) 576px, calc(100vw - 2rem)';
  const alt = hero ? 'Carlos Fernández San Millán' : 'About Carlos';
  const imgAttrs = hero
    ? 'fetchpriority="high" decoding="async" class="w-full h-full object-cover"'
    : 'loading="lazy" decoding="async" class="rounded-2xl shadow-2xl w-full object-cover h-[500px]"';
  return `<source type="image/avif" srcset="${photoSet(prefix, 'avif')}" sizes="${sizes}">`
    + `<source type="image/webp" srcset="${photoSet(prefix, 'webp')}" sizes="${sizes}">`
    + `<img src="${prefix}assets/img/photo-640.jpg" srcset="${photoSet(prefix, 'jpg')}" sizes="${sizes}" width="${PHOTO_SIZE.width}" height="${PHOTO_SIZE.height}" alt="${alt}" ${imgAttrs}>`;
}

function splitKineticName(document) {
  const h1 = document.querySelector('#home h1');
  if (!h1) return;
  const label = h1.textContent.replace(/\s+/g, ' ').trim();
  let index = 0;
  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((token) => {
          if (!token) return;
          if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'kn-word';
          word.setAttribute('aria-hidden', 'true');
          Array.from(token).forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'kn-ch';
            c.setAttribute('style', `--i:${index}`);
            index += 1;
            c.textContent = ch;
            word.appendChild(c);
          });
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(h1);
  h1.setAttribute('aria-label', label);
}

function addHead(document, html) {
  document.head.insertAdjacentHTML('beforeend', html);
}

function ensureMeta(document, attr, key, value) {
  let node = document.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, key);
    document.head.appendChild(node);
  }
  node.setAttribute('content', value);
}

function injectPerformanceAndSecurity(document, prefix, bundles) {
  document.documentElement.setAttribute('data-prerendered', 'true');
  addHead(document, `\n<meta http-equiv="Content-Security-Policy" content="${CSP}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`);
  ensureMeta(document, 'property', 'og:image:width', '1200');
  ensureMeta(document, 'property', 'og:image:height', '630');
  ensureMeta(document, 'property', 'og:image:type', 'image/jpeg');
  addHead(document, [
    `\n<link rel="preload" as="image" type="image/avif" href="${prefix}assets/img/photo-640.avif" imagesrcset="${photoSet(prefix, 'avif')}" imagesizes="320px" fetchpriority="high">`,
    ...FONT_FILES.map((f) => `<link rel="preload" as="font" type="font/woff2" href="${prefix}${f}" crossorigin>`),
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">',
    '<link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192.png">',
    '<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    `<link rel="stylesheet" href="${prefix}${bundles.css}">`
  ].join('\n'));
  document.body.insertAdjacentHTML('beforeend', `\n<script src="${prefix}${bundles.js}" defer></script>\n`);
  document.querySelectorAll('picture[data-photo]').forEach((node) => {
    node.innerHTML = pictureMarkup(prefix, node.getAttribute('data-photo'));
    node.removeAttribute('data-photo');
  });
}

function build404(siteContent, bundles) {
  const base = siteContent.SITE_CONFIG.siteUrl;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="robots" content="noindex">
<title>Page not found | Carlos Fernández San Millán</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="stylesheet" href="/${bundles.css}">
</head>
<body class="font-sans antialiased bg-primary text-white on-dark">
<main class="min-h-screen flex items-center justify-center text-center px-6">
<div>
<p class="display-font text-accent text-5xl mb-4">404</p>
<h1 class="display-font text-4xl font-bold mb-4">This page does not exist</h1>
<p class="text-white/80 mb-8">The page you are looking for has moved or never existed.</p>
<a href="/" class="cta-button cta-button-primary">Back to the home page</a>
</div>
</main>
</body></html>
`;
}

function buildSitemap(siteContent) {
  const base = siteContent.SITE_CONFIG.siteUrl;
  const lastmod = BUILD_DATE.toISOString().slice(0, 10);
  const alternates = [['x-default', `${base}/`], ['en', `${base}/`], ['es', `${base}/es/`], ['it', `${base}/it/`]]
    .map(([l, h]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${h}" />`).join('\n');
  const urls = [['', '1.0'], ['es/', '0.9'], ['it/', '0.9']].map(([p, prio]) => `  <url>
    <loc>${base}/${p}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${prio}</priority>
${alternates}
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}


// ---------------------------------------------------------------------------
// Machine-readable files, generated from the same content so they cannot drift:
//   /llms.txt                    summary for AI assistants (llmstxt.org convention)
//   /.well-known/security.txt    RFC 9116 contact for vulnerability reports (expires after one year, renewed by every release)
// ---------------------------------------------------------------------------
// Text extraction by a real HTML parser (not a tag-stripping regular expression, which cannot be made safe).
function plainText(html) {
  const { document } = new JSDOM(`<body>${String(html)}</body>`).window;
  return document.body.textContent.replace(/\s+/g, ' ').trim();
}

function buildLlmsTxt(siteContent) {
  const { SITE_CONFIG, CV_FILES, SOCIAL_LINKS, I18N } = siteContent;
  const en = I18N.en;
  const base = SITE_CONFIG.siteUrl;
  const social = SOCIAL_LINKS.filter((item) => item.key !== 'website')
    .map((item) => `- [${en.staticText.ui.socialLinkLabels[item.key] || item.key}](${item.href})`).join('\n');
  const achievements = en.achievements.map((item) => `- **${item.title}.** ${plainText(item.descriptionHtml)}`).join('\n');
  return `# ${SITE_CONFIG.siteName}

> ${en.profile.title}. ${en.profile.heroSummary}

Based in ${en.profile.location}. ${en.profile.availability}. Contact: ${en.profile.contactEmail}

## Pages
- [English](${base}/): full profile, experience, achievements and skills
- [Español](${base}/es/): perfil completo en español
- [Italiano](${base}/it/): profilo completo in italiano

## Curriculum vitae (PDF)
- [English](${base}/${CV_FILES.en})
- [Español](${base}/${CV_FILES.es})
- [Italiano](${base}/${CV_FILES.it})

## Selected achievements
${achievements}

## Profiles
${social}

## Notes for assistants
- Facts on this site are stated by ${SITE_CONFIG.siteName} (the site owner); the CV PDFs and the LinkedIn profile carry the authoritative detail.
- For contact, use ${en.profile.contactEmail}.
`;
}

function buildSecurityTxt(siteContent) {
  const { SITE_CONFIG } = siteContent;
  // One year from the build DAY (midnight UTC): the build date is only known to the day when the CI reproducibility
  // check re-derives it from the committed page, so a time of day here would make that check fail.
  const expires = new Date(BUILD_DATE.getTime());
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  expires.setUTCHours(0, 0, 0, 0);
  return `Contact: mailto:security@${SITE_CONFIG.siteHost}
Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}
Preferred-Languages: en, es, it
Canonical: ${SITE_CONFIG.siteUrl}/.well-known/security.txt
`;
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

function populateDocument(document, siteContent, lang, bundles) {
  const content = siteContent.I18N[lang];
  const currentDate = BUILD_DATE.toLocaleDateString(content.locale, { month: 'short', year: 'numeric' });
  const currentYear = String(BUILD_DATE.getFullYear());
  const canonical = canonicalUrl(siteContent.SITE_CONFIG, lang);
  const prefix = relativePrefix(lang);

  sanitizeTemplate(document);

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
  injectPerformanceAndSecurity(document, prefix, bundles);
}

function buildPage(siteContent, lang, bundles) {
  const template = fs.readFileSync(templatePath, 'utf8');
  const pageUrl = `${siteContent.SITE_CONFIG.siteUrl}${lang === 'en' ? '/' : `/${lang}/`}`;
  const dom = new JSDOM(template, { url: pageUrl, runScripts: 'outside-only' });
  populateDocument(dom.window.document, siteContent, lang, bundles);

  // Single source of truth for page content: run the SAME renderer the browser used to run
  // (assets/js/site-render.js) at build time, so pre-rendered HTML is identical to what visitors
  // always saw, and the browser no longer has to re-render on load.
  ['site-content', 'site-utils', 'site-icons', 'site-dom', 'site-render'].forEach((name) => {
    dom.window.eval(fs.readFileSync(path.join(rootDir, 'assets/js', `${name}.js`), 'utf8'));
  });
  dom.window.__SITE_RENDER.setCurrentLanguage(lang);
  dom.window.__SITE_RENDER.renderAll();

  // The browser-side renderer writes bare CV file names, which 404 on /es/ and /it/ (a bug that
  // existed in production). Re-apply the correct, language-prefixed paths.
  ['hero-download-button', 'about-download-button'].forEach((id) => {
    setHref(dom.window.document, id, `${relativePrefix(lang)}carlos-fernandez-san-millan-${lang}.pdf`);
  });

  // Convert legacy <i class="fas ..."> icons to inline SVG now, so the browser never has to.
  dom.window.__SITE_ICONS.upgradeLegacyIcons();
  splitKineticName(dom.window.document);
  return dom.serialize();
}

function writePage(filePath, html) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html);
}

const siteContent = loadSiteContent();
const bundles = buildBundles();
writePage(path.join(rootDir, 'index.html'), buildPage(siteContent, 'en', bundles));
writePage(path.join(rootDir, 'es', 'index.html'), buildPage(siteContent, 'es', bundles));
writePage(path.join(rootDir, 'it', 'index.html'), buildPage(siteContent, 'it', bundles));
fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), buildSitemap(siteContent));
fs.writeFileSync(path.join(rootDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteContent.SITE_CONFIG.siteUrl}/sitemap.xml\n`);
fs.writeFileSync(path.join(rootDir, 'llms.txt'), buildLlmsTxt(siteContent));
fs.mkdirSync(path.join(rootDir, '.well-known'), { recursive: true });
fs.writeFileSync(path.join(rootDir, '.well-known', 'security.txt'), buildSecurityTxt(siteContent));
fs.writeFileSync(path.join(rootDir, 'CNAME'), siteContent.SITE_CONFIG.siteHost); // used only by the GitHub Pages rollback layout
fs.writeFileSync(path.join(rootDir, '404.html'), build404(siteContent, bundles));
