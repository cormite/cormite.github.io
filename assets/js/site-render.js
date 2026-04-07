'use strict';

(function initSiteRender(global) {
  const siteContent = global.__SITE_CONTENT || {};
  const dom = global.__SITE_DOM || {};
  const utils = global.__SITE_UTILS || {};
  const icons = global.__SITE_ICONS || {};

  const { LANGS, DEFAULT_LANG, LANG_STORAGE_KEY, SITE_CONFIG, CV_FILES, NAV_ITEMS, SOCIAL_LINKS, I18N } = siteContent;
  const { CLASSNAMES, byId, setText, setHtml, setButtonContent, setInlineIconText, setInputPlaceholder, setHref, setAttr } = dom;
  const { getSafeStorage, getProtocol } = utils;
  const { renderIconSvg } = icons;

  const HERO_BADGE_LAYOUT = Object.freeze([
    Object.freeze({ key: 'actingCio', icon: 'fa-shield-alt', iconClass: 'text-accent', itemClass: 'hero-badge absolute -top-2 -left-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '0s' }),
    Object.freeze({ key: 'headOfIt', icon: 'fa-award', iconClass: 'text-accent', itemClass: 'hero-badge absolute -top-2 -right-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '0.5s' }),
    Object.freeze({ key: 'certifications', icon: 'fa-crown', iconClass: 'text-accent', itemClass: 'hero-badge absolute top-24 -left-20 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '1s' }),
    Object.freeze({ key: 'continuity', icon: 'fa-cloud', iconClass: 'text-accent', itemClass: 'hero-badge absolute top-24 -right-20 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '1.5s' }),
    Object.freeze({ key: 'infrastructure', icon: 'fa-server', iconClass: 'text-accent', itemClass: 'hero-badge absolute bottom-20 -left-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '2s' }),
    Object.freeze({ key: 'security', icon: 'fa-lock', iconClass: 'text-accent', itemClass: 'hero-badge absolute bottom-20 -right-16 bg-white rounded-full px-4 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold text-primary', delay: '2.5s' }),
    Object.freeze({ key: 'years', icon: 'fa-star', iconClass: 'text-white', itemClass: 'hero-badge absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-accent text-white rounded-full px-6 py-2 shadow-lg animate-float', textClass: 'text-sm font-bold', delay: '3s', textId: 'hero-years' })
  ]);

  const ABOUT_FEATURE_LAYOUT = Object.freeze([
    Object.freeze({ key: 'dataCenters', icon: 'fa-server' }),
    Object.freeze({ key: 'cybersecurity', icon: 'fa-shield-alt' }),
    Object.freeze({ key: 'cloud', icon: 'fa-cloud' }),
    Object.freeze({ key: 'leadership', icon: 'fa-users-cog' })
  ]);

  if (!LANGS || !DEFAULT_LANG || !LANG_STORAGE_KEY || !SITE_CONFIG || !CV_FILES || !NAV_ITEMS || !SOCIAL_LINKS || !I18N) {
    throw new Error('Site content failed to load before site-render.js');
  }

  if (!CLASSNAMES || !byId || !setText || !setHtml || !setButtonContent || !setInlineIconText || !setInputPlaceholder || !setHref || !setAttr || !getSafeStorage || !getProtocol || !renderIconSvg) {
    throw new Error('site-render.js requires site-dom.js, site-utils.js, and site-icons.js');
  }

  let currentLanguage = DEFAULT_LANG;
  let closeMobileMenuRef = null;

  function getCurrentLanguage() {
    return currentLanguage;
  }

  function setCurrentLanguage(lang) {
    currentLanguage = lang;
  }

  function registerMobileMenuCloser(callback) {
    closeMobileMenuRef = callback;
  }

  function closeMobileMenuIfOpen() {
    if (typeof closeMobileMenuRef === 'function') {
      closeMobileMenuRef(false);
    }
  }

  function getSelectedCvFile() {
    return CV_FILES[currentLanguage] || CV_FILES[DEFAULT_LANG];
  }

  function getCurrentBadgeLabel(content) {
    return content.staticText.ui.currentBadgeLabel;
  }

  function detectLanguage() {
    const url = new URL(global.location.href);
    const langParam = url.searchParams.get('lang');
    if (langParam && LANGS.includes(langParam)) return langParam;

    const storage = getSafeStorage();
    if (storage) {
      try {
        const stored = storage.getItem(LANG_STORAGE_KEY);
        if (stored && LANGS.includes(stored)) return stored;
      } catch (error) {
        // Ignore blocked storage.
      }
    }

    const browserLanguage = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    return LANGS.includes(browserLanguage) ? browserLanguage : DEFAULT_LANG;
  }

  function updateLanguageInUrl(lang) {
    if (getProtocol() === 'file:') return;
    const url = new URL(global.location.href);
    url.searchParams.set('lang', lang);
    global.history.replaceState({}, '', url.toString());
  }


function getLanguageUrl(lang) {
  if (lang === DEFAULT_LANG) return `${SITE_CONFIG.siteUrl}/`;
  return `${SITE_CONFIG.siteUrl}/?lang=${lang}`;
}

function setMetaContent(selector, value, attributeName = 'content') {
  const node = document.querySelector(selector);
  if (node) {
    node.setAttribute(attributeName, value);
  }
}

function updateAlternateLinks() {
  const links = {
    'link[rel="canonical"]': getLanguageUrl(currentLanguage),
    'link[rel="alternate"][hreflang="x-default"]': getLanguageUrl(DEFAULT_LANG),
    'link[rel="alternate"][hreflang="en"]': getLanguageUrl('en'),
    'link[rel="alternate"][hreflang="es"]': getLanguageUrl('es'),
    'link[rel="alternate"][hreflang="it"]': getLanguageUrl('it')
  };

  Object.entries(links).forEach(([selector, href]) => {
    const node = document.querySelector(selector);
    if (node) {
      node.setAttribute('href', href);
    }
  });
}

function buildStructuredData(content) {
  const sameAs = SOCIAL_LINKS.map((item) => item.href);
  const knowsLanguage = LANGS.map((lang) => I18N[lang]?.locale || lang);
  const languageUrl = getLanguageUrl(currentLanguage);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_CONFIG.siteName,
      url: `${SITE_CONFIG.siteUrl}/`,
      inLanguage: content.locale,
      description: content.meta.description
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE_CONFIG.siteName,
      url: languageUrl,
      image: SITE_CONFIG.defaultImage,
      jobTitle: content.profile.title,
      description: content.meta.description,
      email: `mailto:${content.profile.contactEmail}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: content.profile.location
      },
      knowsLanguage,
      sameAs
    }
  ];
}

function applyDocumentMetadata(content) {
  const languageUrl = getLanguageUrl(currentLanguage);
  const ogLocale = (content.locale || DEFAULT_LANG).replace('-', '_');

  document.documentElement.lang = currentLanguage;
  document.title = content.meta.title;

  setMetaContent('meta[name="description"]', content.meta.description);
  setMetaContent('meta[name="keywords"]', content.meta.keywords);
  setMetaContent('meta[name="author"]', SITE_CONFIG.author);
  setMetaContent('meta[name="robots"]', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setMetaContent('meta[property="og:title"]', content.meta.title);
  setMetaContent('meta[property="og:description"]', content.meta.description);
  setMetaContent('meta[property="og:type"]', 'website');
  setMetaContent('meta[property="og:url"]', languageUrl);
  setMetaContent('meta[property="og:image"]', SITE_CONFIG.defaultImage);
  setMetaContent('meta[property="og:site_name"]', SITE_CONFIG.siteName);
  setMetaContent('meta[property="og:locale"]', ogLocale);
  setMetaContent('meta[name="twitter:card"]', 'summary_large_image');
  setMetaContent('meta[name="twitter:title"]', content.meta.title);
  setMetaContent('meta[name="twitter:description"]', content.meta.description);
  setMetaContent('meta[name="twitter:image"]', SITE_CONFIG.defaultImage);

  updateAlternateLinks();

  const structuredDataNode = byId('structured-data');
  if (structuredDataNode) {
    structuredDataNode.textContent = JSON.stringify(buildStructuredData(content));
  }
}

  function languageButtonClass(lang) {
    const isActive = lang === currentLanguage;
    return [
      'lang-btn px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
      isActive
        ? 'bg-accent text-white border-accent'
        : 'bg-transparent text-white/80 border-white/20 hover:text-white hover:border-accent'
    ].join(' ');
  }

  function renderLanguageSwitcher(container, mobile, content) {
    const wrapper = document.createElement('div');
    wrapper.className = mobile ? 'pt-6 mt-6 border-t border-white/10 flex gap-2' : 'ml-6 flex gap-2';
    wrapper.setAttribute('aria-label', content.staticText.ui.languageSwitcherLabel);

    wrapper.innerHTML = LANGS.map((lang) => {
      const label = lang.toUpperCase();
      return `<button type="button" class="${languageButtonClass(lang)}" data-lang="${lang}" aria-pressed="${lang === currentLanguage}">${label}</button>`;
    }).join('');

    container.appendChild(wrapper);
  }

  function bindLanguageSwitchers() {
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
            // Ignore blocked storage writes.
          }
        }

        updateLanguageInUrl(lang);
        renderAll();
        closeMobileMenuIfOpen();
      });
    });
  }

  function renderNavigationLinks(content) {
    const desktopContainer = byId('nav-links-desktop');
    const mobileContainer = byId('nav-links-mobile');

    const renderLinks = (mobile) => NAV_ITEMS.map((item) => {
      const text = content.nav[item.key];
      const className = item.primary
        ? (mobile ? CLASSNAMES.mobileNavCta : CLASSNAMES.desktopNavCta)
        : (mobile ? CLASSNAMES.mobileNavItem : CLASSNAMES.desktopNavItem);
      return `<a href="${item.href}" class="${className}">${text}</a>`;
    }).join('');

    if (desktopContainer) {
      desktopContainer.innerHTML = renderLinks(false);
      renderLanguageSwitcher(desktopContainer, false, content);
    }

    if (mobileContainer) {
      mobileContainer.innerHTML = renderLinks(true);
      renderLanguageSwitcher(mobileContainer, true, content);
    }

    bindLanguageSwitchers();
  }

  function renderSocialLinks(content) {
    const heroContainer = byId('social-links-hero');
    const contactContainer = byId('social-links-contact');
    const socialLabel = content.staticText.ui.socialLinksLabel;

    const renderLinks = (className) => SOCIAL_LINKS.map((item) => {
      const label = content.staticText.ui.socialLinkLabels[item.key] || item.key;
      return (`<a href="${item.href}" target="_blank" rel="noopener noreferrer me" aria-label="${label}" class="${className}">` +
        renderIconSvg(item.iconClass.split(/\s+/).find((token) => token.startsWith('fa-')), '', true) +
        '</a>');
    }).join('');

    if (heroContainer) {
      heroContainer.setAttribute('aria-label', socialLabel);
      heroContainer.innerHTML = renderLinks(CLASSNAMES.heroSocialLink);
    }
    if (contactContainer) {
      contactContainer.setAttribute('aria-label', socialLabel);
      contactContainer.innerHTML = renderLinks(CLASSNAMES.contactSocialLink);
    }
  }

  function renderHeroBadges(content) {
    const container = byId('hero-badge-list');
    if (!container) return;

    const badges = content.profile.badges || {};
    container.setAttribute('aria-label', content.staticText.ui.heroBadgesLabel);
    container.innerHTML = HERO_BADGE_LAYOUT.map((item) => {
      const textId = item.textId ? ` id="${item.textId}"` : '';
      return (`<li class="${item.itemClass}" style="animation-delay: ${item.delay};">` +
        '<span class="flex items-center gap-2">' +
        renderIconSvg(item.icon, item.iconClass, true) +
        `<span${textId} class="${item.textClass}">${badges[item.key] || ''}</span>` +
        '</span></li>');
    }).join('');
  }

  function renderAboutFeatures(content) {
    const container = byId('about-feature-list');
    if (!container) return;

    const features = content.profile.features || {};
    container.setAttribute('aria-label', content.staticText.ui.aboutFeaturesLabel);
    container.innerHTML = ABOUT_FEATURE_LAYOUT.map((item) => {
      const feature = features[item.key];
      if (!feature) return '';
      return (`<li class="profile-feature-item flex items-start">` +
        '<div class="profile-feature-icon">' + renderIconSvg(item.icon, 'text-accent text-xl', true) + '</div>' +
        '<div>' +
        `<h3 class="font-bold text-primary text-lg">${feature.title}</h3>` +
        `<p class="text-sm text-soft-text">${feature.subtitle}</p>` +
        '</div></li>');
    }).join('');
  }

  function renderProfileText(content) {
    const profile = content.profile;
    setText('availability-text', profile.availability);
    setText('hero-title', profile.title);
    setText('hero-summary', profile.heroSummary);
    setText('hero-location', profile.location);
    setText('hero-budget', profile.budget);
    setText('hero-team-size', profile.teamSize);
    setText('about-years-value', profile.yearsExperience);
    setText('about-summary-1', profile.aboutSummary1);
    setText('about-summary-2', profile.aboutSummary2);
    setText('footer-role', profile.footerRole);

    const contactEmailValue = byId('contact-method-email-value');
    if (contactEmailValue) {
      contactEmailValue.textContent = profile.contactEmail;
      contactEmailValue.setAttribute('href', `mailto:${profile.contactEmail}`);
    }

    setText('contact-method-location-value', profile.location);

    const footerOpportunity = byId('footer-opportunity');
    if (footerOpportunity) {
      footerOpportunity.innerHTML = `${renderIconSvg('fa-user-tie', 'mr-2', true)}${profile.footerOpportunity}`;
    }
  }

  function renderStaticText(content) {
    const text = content.staticText;
    const ui = text.ui;
    const selectedCvFile = getSelectedCvFile();

    setText('skip-link', ui.skipLink);
    setAttr('navbar', 'aria-label', ui.primaryNavLabel);
    setAttr('brand-home-link', 'aria-label', ui.homeLinkLabel);
    setAttr('mobile-menu-btn', 'aria-label', ui.openMenuLabel);
    setAttr('mobile-menu', 'aria-label', ui.mobileNavLabel);
    setAttr('close-menu', 'aria-label', ui.closeMenuLabel);
    setAttr('hero-stat-list', 'aria-label', ui.heroStatsLabel);
    setAttr('scroll-to-about-link', 'aria-label', ui.scrollToAboutLabel);
    setAttr('contact-method-list', 'aria-label', ui.contactMethodsLabel);

    setButtonContent('hero-contact-button', 'fa-envelope', text.heroContactButton);
    setButtonContent('hero-download-button', 'fa-download', text.heroDownloadButton);
    setButtonContent('about-download-button', 'fa-download', text.aboutDownloadButton);
    setButtonContent('contact-form-submit-button', 'fa-paper-plane', text.contactSubmit);

    setHref('hero-download-button', selectedCvFile);
    setHref('about-download-button', selectedCvFile);

    setHtml('about-heading', text.aboutHeading);
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
    setText('contact-method-email-label', text.contactEmailLabel);
    setText('contact-method-location-label', text.contactLocationLabel);
    setText('contact-social-label', text.contactSocialLabel);
    setText('contact-form-heading', text.contactFormHeading);
    setText('contact-form-name-label', text.contactNameLabel);
    setText('contact-form-email-label', text.contactEmailInputLabel);
    setText('contact-form-message-label', text.contactMessageLabel);

    setInputPlaceholder('contact-name', text.contactNamePlaceholder);
    setInputPlaceholder('contact-email', text.contactEmailPlaceholder);
    setInputPlaceholder('contact-message', text.contactMessagePlaceholder);

    setInlineIconText('form-success', 'fa-info-circle', text.contactInfo);
    setInlineIconText('footer-references', 'fa-info-circle', text.footerReferences);
    setHtml('footer-copyright', `&copy; <span id="current-year"></span> ${text.footerCopyright}`);

    const footerUpdatedLabel = byId('footer-updated-label');
    if (footerUpdatedLabel) {
      footerUpdatedLabel.textContent = text.footerUpdated;
    }
  }

  function renderExperienceTimeline(content) {
    const container = byId('experience-timeline');
    if (!container) return;

    container.innerHTML = content.experienceTimeline.map((item, index) => {
      const isRight = index % 2 === 1;
      const delay = Math.min(index * 100, 400);
      const rolePaneOrder = isRight ? 'lg:order-2 order-1 lg:pl-12' : 'lg:text-right lg:pr-12';
      const summaryPaneOrder = isRight ? 'lg:text-right lg:pr-12 mb-4 lg:mb-0 lg:order-1 order-2' : 'lg:pl-12';
      const borderClass = item.current ? 'border-l-4 border-accent' : (isRight ? 'border-l-4 border-secondary lg:border-l-0 lg:border-r-4' : 'border-l-4 border-secondary');
      const dotClass = item.current ? 'bg-accent' : 'bg-secondary';
      const currentBadge = item.current ? getCurrentBadgeLabel(content) : '';

      const headerBlock = [
        '<div class="lg:text-right lg:pr-12 mb-4 lg:mb-0">',
        item.current ? `<div class="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold mb-2">${currentBadge}</div>` : '',
        `<h3 class="text-2xl font-bold text-primary">${item.role}</h3>`,
        `<p class="${item.current ? 'text-accent' : 'text-secondary'} font-semibold">${item.org}</p>`,
        `<p class="text-soft-text text-sm">${item.period}</p>`,
        '</div>'
      ].join('');

      const contentBlock = item.bullets
        ? '<div class="bg-light-bg p-6 rounded-2xl hover-card border-l-4 border-accent"><ul class="space-y-2 text-soft-text">' +
          item.bullets.map((bullet) => (
            '<li class="flex items-start">' + renderIconSvg('fa-check', 'text-accent mt-1 mr-2 flex-shrink-0', true) + `<span>${bullet}</span></li>`
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
  }

  function renderAchievements(content) {
    const container = byId('achievements-grid');
    if (!container) return;

    container.innerHTML = content.achievements.map((item) => {
      const iconName = item.iconClass.split(/\s+/).find((token) => token.startsWith('fa-'));
      const delayAttr = item.delay ? ` data-aos-delay="${item.delay}"` : '';
      return (
        `<article role="listitem" class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover-card group" data-aos="fade-up"${delayAttr}>` +
        '<div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">' +
        renderIconSvg(iconName, 'text-2xl text-accent group-hover:text-white transition-colors', true) +
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
      const iconName = group.iconClass.split(/\s+/).find((token) => token.startsWith('fa-'));
      const delayAttr = group.delay ? ` data-aos-delay="${group.delay}"` : '';
      const itemsHtml = group.items.map((item) => (
        '<li class="flex items-center text-soft-text">' + renderIconSvg('fa-check-circle', 'text-accent mr-3', true) + item + '</li>'
      )).join('');

      return (
        `<article role="listitem" class="bg-white rounded-2xl p-8 shadow-lg hover-card" data-aos="fade-up"${delayAttr}>` +
        '<div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">' +
        renderIconSvg(iconName, 'text-2xl text-primary', true) +
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

  function renderAll() {
    const content = I18N[currentLanguage] || I18N[DEFAULT_LANG];
    applyDocumentMetadata(content);
    renderNavigationLinks(content);
    renderSocialLinks(content);
    renderProfileText(content);
    renderHeroBadges(content);
    renderAboutFeatures(content);
    renderStaticText(content);
    renderExperienceTimeline(content);
    renderAchievements(content);
    renderSkills(content);
    renderCompetencies(content);
    setCurrentDate(content.locale);
  }

  global.__SITE_RENDER = Object.freeze({
    DEFAULT_LANG,
    I18N,
    detectLanguage,
    getCurrentLanguage,
    setCurrentLanguage,
    registerMobileMenuCloser,
    renderAll,
    getSelectedCvFile
  });
}(globalThis));
