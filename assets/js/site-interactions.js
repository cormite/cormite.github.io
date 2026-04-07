'use strict';

(function initSiteInteractions(global) {
  const render = global.__SITE_RENDER || {};
  const dom = global.__SITE_DOM || {};
  const utils = global.__SITE_UTILS || {};
  const icons = global.__SITE_ICONS || {};

  const { I18N, DEFAULT_LANG, getCurrentLanguage, registerMobileMenuCloser } = render;
  const { byId } = dom;
  const { prefersReducedMotion, getProtocol, safeEncode } = utils;
  const { upgradeLegacyIcons } = icons;

  if (!I18N || !DEFAULT_LANG || !getCurrentLanguage || !registerMobileMenuCloser || !byId || !prefersReducedMotion || !getProtocol || !safeEncode || !upgradeLegacyIcons) {
    throw new Error('site-interactions.js requires site-render.js, site-dom.js, site-utils.js, and site-icons.js');
  }

  let revealObserver = null;

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

  function setupNavbarScroll() {
    const navbar = byId('navbar');
    if (!navbar) return;

    const updateNavbarState = () => {
      if (global.scrollY > 50) {
        navbar.classList.add('glass', 'shadow-lg');
        navbar.classList.remove('bg-transparent');
      } else {
        navbar.classList.remove('glass', 'shadow-lg');
        navbar.classList.add('bg-transparent');
      }
    };

    global.addEventListener('scroll', updateNavbarState, { passive: true });
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

    registerMobileMenuCloser(closeMenu);

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

  function setupContactForm() {
    const form = byId('contact-form');
    const status = byId('form-success');
    const nameField = byId('contact-name');
    const emailField = byId('contact-email');
    const messageField = byId('contact-message');
    if (!form || !status || !nameField || !emailField || !messageField) return;
    if (form.getAttribute('data-bound') === 'true') return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const currentLanguage = getCurrentLanguage();
      const content = I18N[currentLanguage] || I18N[DEFAULT_LANG];
      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      const subjectText = currentLanguage === 'es'
        ? `Contacto web de ${name || 'visitante'}`
        : (currentLanguage === 'it' ? `Contatto web da ${name || 'visitatore'}` : `Website contact from ${name || 'visitor'}`);

      const bodyPrefix = currentLanguage === 'es'
        ? `Nombre: ${name}
Email: ${email}

Mensaje:
${message}`
        : (currentLanguage === 'it'
          ? `Nome: ${name}
Email: ${email}

Messaggio:
${message}`
          : `Name: ${name}
Email: ${email}

Message:
${message}`);

      const mailto = `mailto:${content.profile.contactEmail}?subject=${safeEncode(subjectText)}&body=${safeEncode(bodyPrefix)}`;
      global.location.href = mailto;
      status.classList.remove('hidden');
      form.reset();

      global.setTimeout(() => {
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

  function enhanceUi() {
    upgradeLegacyIcons();
    setupRevealAnimations();
    setupNavbarScroll();
    setupMobileMenu();
    setupContactForm();
    setupSmoothScroll();
  }

  global.__SITE_INTERACTIONS = Object.freeze({
    enhanceUi,
    refreshAnimatedUi: setupRevealAnimations
  });
}(globalThis));
