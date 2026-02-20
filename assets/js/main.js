'use strict';

const APP_CONFIG = Object.freeze({
  profile: Object.freeze({
    fullName: 'Carlos Fernández San Millán',
    title: 'Head of ICT & Acting CIO | Board Advisor',
    availability: 'Available for Executive & Advisory Opportunities',
    location: 'Milan, Italy',
    yearsExperience: '15+',
    technicalYears: '12+',
    budget: '14M € Budget Managed',
    teamSize: '25+ Team Size',
    heroSummary: 'Technology Executive with 15+ years leading enterprise IT, digital transformation, and research computing in mission-driven international organizations.',
    aboutSummary1: 'Senior technology executive with 15+ years leading enterprise IT, research computing, cybersecurity, and digital transformation in complex, mission-driven international organizations.',
    aboutSummary2: 'Proven track record of aligning technology strategy with institutional objectives, delivering measurable business outcomes, and building high-performing teams. Expertise spans IT governance, digital transformation, HPC/data center operations, cybersecurity frameworks, and research technology enablement.',
    footerRole: 'Technology Executive & Digital Transformation Leader',
    footerOpportunity: 'Open to on-prem and/or remote, Executive roles in Tech/Research Companies/Institutes',
    contactEmail: 'carlos.fernandez.san.millan@gmail.com'
  }),

  navItems: Object.freeze([
    Object.freeze({ href: '#home', label: 'Home' }),
    Object.freeze({ href: '#about', label: 'About' }),
    Object.freeze({ href: '#experience', label: 'Experience' }),
    Object.freeze({ href: '#achievements', label: 'Achievements' }),
    Object.freeze({ href: '#skills', label: 'Skills' }),
    Object.freeze({ href: '#contact', label: 'Contact', cta: true })
  ]),

  socialLinks: Object.freeze([
    Object.freeze({
      href: 'https://linkedin.com/in/carlosfernandezsanmillan',
      iconClass: 'fab fa-linkedin-in text-xl',
      label: 'LinkedIn'
    }),
    Object.freeze({
      href: 'https://github.com/Cormite',
      iconClass: 'fab fa-github text-xl',
      label: 'GitHub'
    }),
    Object.freeze({
      href: 'https://www.cormite.com',
      iconClass: 'fas fa-globe text-xl',
      label: 'Website'
    })
  ]),

  achievements: Object.freeze([
    Object.freeze({
      iconClass: 'fas fa-trophy',
      title: 'Strategy-to-Execution Transformation',
      descriptionHtml: 'Converted strategy into execution at Human Technopole, delivering <span class="text-accent font-bold">30%</span> efficiency improvement and <span class="text-accent font-bold">45%</span> manual-process reduction through targeted digital modernization and automation.',
      delay: 0
    }),
    Object.freeze({
      iconClass: 'fas fa-shield-alt',
      title: 'Cybersecurity & Control Maturity',
      descriptionHtml: 'Embedded GDPR-aligned security governance and operational controls across core services, contributing to a <span class="text-accent font-bold">60%</span> reduction in security incidents.',
      delay: 100
    }),
    Object.freeze({
      iconClass: 'fas fa-server',
      title: 'Scalable Operating Reliability',
      descriptionHtml: 'Stabilized and scaled infrastructure supporting <span class="text-accent font-bold">20PB+</span> scientific workloads while maintaining <span class="text-accent font-bold">99.99%</span> service reliability in production environments.',
      delay: 200
    }),
    Object.freeze({
      iconClass: 'fas fa-chart-line',
      title: 'Governance, Capital Efficiency & Vendor Performance',
      descriptionHtml: 'Restructured supplier governance and contract strategy to produce <span class="text-accent font-bold">40-60%</span> optimization in targeted agreements and improve service accountability.',
      delay: 300
    })
  ]),

  skillGroups: Object.freeze([
    Object.freeze({
      iconClass: 'fas fa-cloud',
      title: 'Infrastructure & Cloud',
      items: Object.freeze([
        'Endpoint management',
        'Collaboration stack (M365)',
        'SSO / MFA / identity integrations',
        'VMware vSphere/Horizon, OpenNebula, oVirt',
        'Linux & Windows Server',
        'Hybrid Cloud, Docker, Kubernetes'
      ]),
      delay: 0
    }),
    Object.freeze({
      iconClass: 'fas fa-database',
      title: 'Storage & Data',
      items: Object.freeze([
        'NetApp, Dell PowerScale, PowerStore, Unity',
        'vSAN, QNAP, Synology',
        'Veeam, TSM, Bacula',
        'HPC / Research Computing',
        'Backup, Business Continuity, Disaster Recovery'
      ]),
      delay: 100
    }),
    Object.freeze({
      iconClass: 'fas fa-shield-alt',
      title: 'Security & Operations',
      items: Object.freeze([
        'Cybersecurity frameworks / GDPR / compliance',
        'ITIL 4, PRINCE2, SMART',
        'IAM / RBAC / endpoint security',
        'Audit readiness & controls mapping',
        'Foreman, Puppet, Ansible, Zabbix, Python'
      ]),
      delay: 200
    })
  ]),

  competencies: Object.freeze([
    'Technology Strategy & Operating Model',
    'Executive Leadership (Head of ICT / Acting CIO)',
    'Board Advisory & Governance',
    'Digital Transformation Execution',
    'Cybersecurity & Risk Governance',
    'IT Governance & Compliance',
    'Cloud, Data Center & HPC Operations',
    'Virtualization & Storage Engineering',
    'Vendor & Contract Management',
    'Cross-Functional Stakeholder Leadership'
  ]),

  experienceTimeline: Object.freeze([
    Object.freeze({
      current: true,
      role: 'Head of ICT & Digitisation (Acting CIO)',
      org: 'Human Technopole',
      period: 'Jan 2023 - Present | Milan, Italy',
      bullets: Object.freeze([
        'Strategic ICT leadership across infrastructure, workplace, security, and enterprise platforms (25+ FTEs; 7 direct reports).',
        'Technology roadmap and execution governance aligned to institutional priorities and measurable outcomes.',
        '30% efficiency gain and 45% process reduction through digital transformation and automation.',
        '20PB+ scientific workloads supported with 99.99% service availability.'
      ])
    }),
    Object.freeze({
      role: 'Data Center Infrastructure Manager',
      org: 'Human Technopole',
      period: 'May 2022 - Dec 2022 | Milan, Italy',
      summary: 'Led high-performance infrastructure operations, backup/DR strategy, standards definition, network security, and data center procurement planning.'
    }),
    Object.freeze({
      role: 'Storage & Virtualisation Engineer',
      org: 'Human Technopole',
      period: 'Jan 2021 - May 2022 | Milan, Italy',
      summary: 'Managed PowerScale/NetApp storage and VMware/VDI platforms, plus Linux services supporting research computing operations.'
    }),
    Object.freeze({
      role: 'Systems & Virtualisation Engineer',
      org: 'European Molecular Biology Laboratory (EMBL)',
      period: 'Oct 2018 - Dec 2020 | Heidelberg, Germany',
      summary: 'Managed 28-host VMware cluster (650+ VMs), 18-node NetApp estate (~9PB), vSAN for GPU VDI, and infrastructure automation with Python/Puppet/Foreman/Zabbix.'
    }),
    Object.freeze({
      role: 'Systems Engineer',
      org: 'European Molecular Biology Laboratory (EMBL)',
      period: 'Oct 2012 - Oct 2018 | Heidelberg, Germany',
      summary: 'Delivered enterprise virtualization and storage lifecycle upgrades (ESX/ESXi 4.1 through 6.7) across multi-site environments.'
    }),
    Object.freeze({
      role: 'IT Manager',
      org: 'Digital Arts & Designers, S.L.',
      period: 'Jul 2010 - Sep 2012 | Las Palmas de Gran Canaria, Spain',
      summary: 'Managed IT projects, Linux/server administration, network operations, monitoring, and technical procurement/vendor relationships.'
    })
  ])
});

const CLASSNAMES = Object.freeze({
  desktopNavItem: 'text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors',
  desktopNavCta: 'bg-accent hover:bg-accent-light text-white px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105',
  mobileNavItem: 'block text-white hover:text-accent py-2 text-lg',
  mobileNavCta: 'block text-accent py-2 text-lg font-bold'
});

function byId(id) {
  return document.getElementById(id);
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setText(id, value) {
  const node = byId(id);
  if (node) {
    node.textContent = value;
  }
}

function markDecorativeIcons() {
  document.querySelectorAll('i:not([aria-label])').forEach((icon) => {
    icon.setAttribute('aria-hidden', 'true');
  });
}

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
    return;
  }
  callback();
}

function renderNavigationLinks() {
  const desktopContainer = byId('nav-links-desktop');
  const mobileContainer = byId('nav-links-mobile');

  if (desktopContainer) {
    desktopContainer.innerHTML = APP_CONFIG.navItems.map((item) => {
      const className = item.cta ? CLASSNAMES.desktopNavCta : CLASSNAMES.desktopNavItem;
      return `<a href="${item.href}" class="${className}">${item.label}</a>`;
    }).join('');
  }

  if (mobileContainer) {
    mobileContainer.innerHTML = APP_CONFIG.navItems.map((item) => {
      const className = item.cta ? CLASSNAMES.mobileNavCta : CLASSNAMES.mobileNavItem;
      return `<a href="${item.href}" class="${className}">${item.label}</a>`;
    }).join('');
  }
}

function renderSocialLinks() {
  const heroContainer = byId('social-links-hero');
  const contactContainer = byId('social-links-contact');

  const renderLinks = (className) => APP_CONFIG.socialLinks.map((item) => (
    `<a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}" class="${className}">` +
    `<i class="${item.iconClass}" aria-hidden="true"></i>` +
    '</a>'
  )).join('');

  if (heroContainer) {
    heroContainer.innerHTML = renderLinks(
      'w-12 h-12 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110'
    );
  }
  if (contactContainer) {
    contactContainer.innerHTML = renderLinks(
      'w-12 h-12 rounded-full bg-primary hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110'
    );
  }
}

function renderProfileText() {
  const profile = APP_CONFIG.profile;
  setText('availability-text', profile.availability);
  setText('hero-title', profile.title);
  setText('hero-summary', profile.heroSummary);
  setText('hero-location', profile.location);
  setText('hero-budget', profile.budget);
  setText('hero-team-size', profile.teamSize);
  setText('hero-years', `${profile.yearsExperience} Years Experience`);
  setText('about-years-value', profile.yearsExperience);
  setText('about-summary-1', profile.aboutSummary1);
  setText('about-summary-2', profile.aboutSummary2);
  setText('footer-role', profile.footerRole);

  const footerOpportunity = byId('footer-opportunity');
  if (footerOpportunity) {
    footerOpportunity.innerHTML = `<i class="fas fa-user-tie mr-2"></i>${profile.footerOpportunity}`;
  }
}

function renderExperienceTimeline() {
  const container = byId('experience-timeline');
  if (!container) {
    return;
  }

  const html = APP_CONFIG.experienceTimeline.map((item, index) => {
    const isRight = index % 2 === 1;
    const delay = Math.min(index * 100, 400);
    const rolePaneOrder = isRight ? 'lg:order-2 order-1 lg:pl-12' : 'lg:text-right lg:pr-12';
    const summaryPaneOrder = isRight
      ? 'lg:text-right lg:pr-12 mb-4 lg:mb-0 lg:order-1 order-2'
      : 'lg:pl-12';
    const borderClass = item.current
      ? 'border-l-4 border-accent'
      : (isRight ? 'border-l-4 border-secondary lg:border-l-0 lg:border-r-4' : 'border-l-4 border-secondary');
    const dotClass = item.current ? 'bg-accent' : 'bg-secondary';

    const headerBlock = (
      '<div class="lg:text-right lg:pr-12 mb-4 lg:mb-0">' +
      (item.current ? '<div class="inline-block bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold mb-2">Current</div>' : '') +
      `<h3 class="text-2xl font-bold text-primary">${item.role}</h3>` +
      `<p class="${item.current ? 'text-accent' : 'text-secondary'} font-semibold">${item.org}</p>` +
      `<p class="text-soft-text text-sm">${item.period}</p>` +
      '</div>'
    );

    const contentBlock = item.bullets
      ? '<div class="bg-light-bg p-6 rounded-2xl hover-card border-l-4 border-accent"><ul class="space-y-2 text-soft-text">' +
        item.bullets.map((bullet) => (
          '<li class="flex items-start">' +
          '<i class="fas fa-check text-accent mt-1 mr-2 flex-shrink-0" aria-hidden="true"></i>' +
          `<span>${bullet}</span>` +
          '</li>'
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

function renderAchievements() {
  const container = byId('achievements-grid');
  if (!container) {
    return;
  }

  container.innerHTML = APP_CONFIG.achievements.map((item) => {
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

function renderSkills() {
  const container = byId('skills-grid');
  if (!container) {
    return;
  }

  container.innerHTML = APP_CONFIG.skillGroups.map((group) => {
    const delayAttr = group.delay ? ` data-aos-delay="${group.delay}"` : '';
    const itemsHtml = group.items.map((item) => (
      '<li class="flex items-center text-soft-text">' +
      '<i class="fas fa-check-circle text-accent mr-3" aria-hidden="true"></i>' +
      item +
      '</li>'
    )).join('');

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

function renderCompetencies() {
  const container = byId('competencies-tags');
  if (!container) {
    return;
  }

  container.innerHTML = APP_CONFIG.competencies.map((item) => (
    '<span role="listitem" class="px-6 py-3 bg-white rounded-full text-primary font-semibold shadow-md hover:shadow-lg transition-shadow cursor-default border border-medium-gray">' +
    item +
    '</span>'
  )).join('');
}

function setCurrentDate() {
  const dateNode = byId('current-date');
  const yearNode = byId('current-year');
  if (!dateNode || !yearNode) {
    return;
  }

  const now = new Date();
  dateNode.textContent = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  yearNode.textContent = String(now.getFullYear());
}

function setupNavbarScroll() {
  const navbar = byId('navbar');
  if (!navbar) {
    return;
  }

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
  if (!mobileMenuBtn || !closeMenuBtn || !mobileMenu) {
    return;
  }

  const openMenu = () => {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    closeMenuBtn.focus();
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.focus();
  };

  mobileMenuBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }

    if (event.key !== 'Tab' || !mobileMenu.classList.contains('open')) {
      return;
    }

    const focusable = mobileMenu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) {
      return;
    }

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
  if (!form || !status || !nameField || !emailField || !messageField) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();

    const subject = encodeURIComponent(`Website contact from ${name || 'visitor'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailto = `mailto:${APP_CONFIG.profile.contactEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    status.classList.remove('hidden');
    form.reset();

    window.setTimeout(() => {
      status.classList.add('hidden');
    }, 5000);
  });
}

function setupSmoothScroll() {
  if (prefersReducedMotion()) {
    return;
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function onAnchorClick(event) {
      event.preventDefault();
      const targetSelector = this.getAttribute('href');
      if (!targetSelector) {
        return;
      }
      const target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initAOS() {
  if (typeof AOS === 'undefined') {
    return;
  }

  if (prefersReducedMotion()) {
    return;
  }

  AOS.init({
    duration: 800,
    once: true,
    offset: 100
  });
}

function bootstrap() {
  markDecorativeIcons();
  renderNavigationLinks();
  renderSocialLinks();
  renderProfileText();
  renderExperienceTimeline();
  renderAchievements();
  renderSkills();
  renderCompetencies();
  initAOS();
  setupNavbarScroll();
  setupMobileMenu();
  setupContactForm();
  setupSmoothScroll();
  setCurrentDate();
}

onReady(bootstrap);
