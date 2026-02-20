const NAV_ITEMS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#achievements', label: 'Achievements' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact', cta: true }
];

const SOCIAL_LINKS = [
  {
    href: 'https://linkedin.com/in/carlosfernandezsanmillan',
    iconClass: 'fab fa-linkedin-in text-xl',
    label: 'LinkedIn'
  },
  {
    href: 'https://github.com/Cormite',
    iconClass: 'fab fa-github text-xl',
    label: 'GitHub'
  },
  {
    href: '#',
    iconClass: 'fas fa-globe text-xl',
    label: 'Website'
  }
];

const ACHIEVEMENTS = [
  {
    iconClass: 'fas fa-trophy',
    title: 'Digital Transformation Leadership',
    descriptionHtml:
      'Led organization-wide digital transformation at Human Technopole, modernizing ICT infrastructure and implementing digital solutions that improved operational efficiency by <span class="text-accent font-bold">30%</span> and reduced manual processes by <span class="text-accent font-bold">45%</span>.',
    delay: 0
  },
  {
    iconClass: 'fas fa-shield-alt',
    title: 'Cybersecurity Framework',
    descriptionHtml:
      'Established comprehensive cybersecurity and data protection framework achieving full GDPR compliance, reducing security incidents by <span class="text-accent font-bold">60%</span> through proactive monitoring, controls, and staff training programs.',
    delay: 100
  },
  {
    iconClass: 'fas fa-server',
    title: 'Research Computing Enablement',
    descriptionHtml:
      'Designed and implemented HPC and data center infrastructure supporting cutting-edge genomic research, enabling processing of <span class="text-accent font-bold">20PB+</span> of scientific data with <span class="text-accent font-bold">99.99%</span> availability for international collaborations.',
    delay: 200
  },
  {
    iconClass: 'fas fa-chart-line',
    title: 'Financial Optimization',
    descriptionHtml:
      'Negotiated multi-year strategic agreements with technology vendors resulting in <span class="text-accent font-bold">40-60%</span> cost optimization while improving service levels and support capabilities across the ICT portfolio.',
    delay: 300
  }
];

const SKILL_GROUPS = [
  {
    iconClass: 'fas fa-cloud',
    title: 'Infrastructure & Cloud',
    items: [
      'VMware vSphere/Horizon',
      'Linux (RHEL, CentOS, Ubuntu)',
      'Windows Server',
      'Hybrid Cloud Architecture',
      'Docker, Kubernetes'
    ],
    delay: 0
  },
  {
    iconClass: 'fas fa-database',
    title: 'Storage & Data',
    items: [
      'NetApp, Dell PowerScale',
      'vSAN, Unity',
      'Veeam, TSM, Bacula',
      'HPC/Research Computing',
      'Data Governance'
    ],
    delay: 100
  },
  {
    iconClass: 'fas fa-shield-alt',
    title: 'Security & Operations',
    items: [
      'Cybersecurity Frameworks',
      'GDPR Compliance',
      'IAM, Endpoint Security',
      'ITIL 4, PRINCE2',
      'Automation (Ansible, Puppet)'
    ],
    delay: 200
  }
];

const COMPETENCIES = [
  'IT Strategy',
  'Digital Transformation',
  'Cybersecurity',
  'Risk Governance',
  'HPC Operations',
  'Enterprise Architecture',
  'Cloud Infrastructure',
  'Team Leadership',
  'Vendor Management',
  'Budget Planning'
];

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
    return;
  }

  callback();
}

function renderNavigationLinks() {
  const desktopContainer = document.getElementById('nav-links-desktop');
  const mobileContainer = document.getElementById('nav-links-mobile');

  if (desktopContainer) {
    desktopContainer.innerHTML = NAV_ITEMS.map((item) => {
      const className = item.cta
        ? 'bg-accent hover:bg-accent-light text-white px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105'
        : 'text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors';

      return `<a href="${item.href}" class="${className}">${item.label}</a>`;
    }).join('');
  }

  if (mobileContainer) {
    mobileContainer.innerHTML = NAV_ITEMS.map((item) => {
      const className = item.cta
        ? 'block text-accent py-2 text-lg font-bold'
        : 'block text-white hover:text-accent py-2 text-lg';

      return `<a href="${item.href}" class="${className}">${item.label}</a>`;
    }).join('');
  }
}

function renderSocialLinks() {
  const heroContainer = document.getElementById('social-links-hero');
  const contactContainer = document.getElementById('social-links-contact');

  if (heroContainer) {
    heroContainer.innerHTML = SOCIAL_LINKS.map((item) => (
      `<a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}" ` +
      'class="w-12 h-12 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110">' +
      `<i class="${item.iconClass}"></i>` +
      '</a>'
    )).join('');
  }

  if (contactContainer) {
    contactContainer.innerHTML = SOCIAL_LINKS.map((item) => (
      `<a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}" ` +
      'class="w-12 h-12 rounded-full bg-primary hover:bg-accent flex items-center justify-center text-white transition-all transform hover:scale-110">' +
      `<i class="${item.iconClass}"></i>` +
      '</a>'
    )).join('');
  }
}

function renderAchievements() {
  const container = document.getElementById('achievements-grid');
  if (!container) {
    return;
  }

  container.innerHTML = ACHIEVEMENTS.map((item) => {
    const delayAttr = item.delay ? ` data-aos-delay="${item.delay}"` : '';

    return (
      `<div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover-card group" data-aos="fade-up"${delayAttr}>` +
      '<div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">' +
      `<i class="${item.iconClass} text-2xl text-accent group-hover:text-white transition-colors"></i>` +
      '</div>' +
      `<h3 class="text-xl font-bold text-white mb-3">${item.title}</h3>` +
      `<p class="text-white/70 leading-relaxed">${item.descriptionHtml}</p>` +
      '</div>'
    );
  }).join('');
}

function renderSkills() {
  const container = document.getElementById('skills-grid');
  if (!container) {
    return;
  }

  container.innerHTML = SKILL_GROUPS.map((group) => {
    const delayAttr = group.delay ? ` data-aos-delay="${group.delay}"` : '';
    const itemsHtml = group.items.map((item) => (
      '<li class="flex items-center text-soft-text">' +
      '<i class="fas fa-check-circle text-accent mr-3"></i>' +
      item +
      '</li>'
    )).join('');

    return (
      `<div class="bg-white rounded-2xl p-8 shadow-lg hover-card" data-aos="fade-up"${delayAttr}>` +
      '<div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">' +
      `<i class="${group.iconClass} text-2xl text-primary"></i>` +
      '</div>' +
      `<h3 class="text-xl font-bold text-primary mb-4">${group.title}</h3>` +
      `<ul class="space-y-3">${itemsHtml}</ul>` +
      '</div>'
    );
  }).join('');
}

function renderCompetencies() {
  const container = document.getElementById('competencies-tags');
  if (!container) {
    return;
  }

  container.innerHTML = COMPETENCIES.map((item) => (
    '<span class="px-6 py-3 bg-white rounded-full text-primary font-semibold shadow-md hover:shadow-lg transition-shadow cursor-default border border-medium-gray">' +
    item +
    '</span>'
  )).join('');
}

function setCurrentDate() {
  const dateNode = document.getElementById('current-date');
  const yearNode = document.getElementById('current-year');

  if (!dateNode || !yearNode) {
    return;
  }

  const now = new Date();
  dateNode.textContent = now.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
  yearNode.textContent = String(now.getFullYear());
}

function setupNavbarScroll() {
  const navbar = document.getElementById('navbar');
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
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenuBtn || !closeMenuBtn || !mobileMenu) {
    return;
  }

  mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('open'));

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (!form || !formSuccess) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    formSuccess.classList.remove('hidden');

    window.setTimeout(() => {
      formSuccess.classList.add('hidden');
    }, 5000);
  });
}

function setupSmoothScroll() {
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

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
}

function initAOS() {
  if (typeof AOS === 'undefined') {
    return;
  }

  AOS.init({
    duration: 800,
    once: true,
    offset: 100
  });
}

onReady(() => {
  renderNavigationLinks();
  renderSocialLinks();
  renderAchievements();
  renderSkills();
  renderCompetencies();
  initAOS();
  setupNavbarScroll();
  setupMobileMenu();
  setupContactForm();
  setupSmoothScroll();
  setCurrentDate();
});
