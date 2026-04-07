'use strict';

(function exposeSiteContent(global) {

const LANGS = Object.freeze(['en', 'es', 'it']);
const DEFAULT_LANG = 'en';
const LANG_STORAGE_KEY = 'site_lang';
const SITE_CONFIG = Object.freeze({
  siteUrl: 'https://www.cormite.com',
  siteName: 'Carlos Fernández San Millán',
  author: 'Carlos Fernández San Millán',
  defaultImage: 'https://www.cormite.com/photo.jpg'
});
const CV_FILES = Object.freeze({
  en: 'carlos-fernandez-san-millan-en.pdf',
  es: 'carlos-fernandez-san-millan-es.pdf',
  it: 'carlos-fernandez-san-millan-it.pdf'
});

const NAV_ITEMS = Object.freeze([
  Object.freeze({ href: '#home', key: 'home' }),
  Object.freeze({ href: '#about', key: 'about' }),
  Object.freeze({ href: '#experience', key: 'experience' }),
  Object.freeze({ href: '#achievements', key: 'achievements' }),
  Object.freeze({ href: '#skills', key: 'skills' }),
  Object.freeze({ href: '#contact', key: 'contact', cta: true })
]);

const SOCIAL_LINKS = Object.freeze([
  Object.freeze({ href: 'https://linkedin.com/in/carlosfernandezsanmillan', iconClass: 'fab fa-linkedin-in text-xl', key: 'linkedin' }),
  Object.freeze({ href: 'https://github.com/Cormite', iconClass: 'fab fa-github text-xl', key: 'github' }),
  Object.freeze({ href: 'https://www.cormite.com', iconClass: 'fas fa-globe text-xl', key: 'website' })
]);

const I18N = Object.freeze({
  en: Object.freeze({
    locale: 'en-US',
    meta: Object.freeze({
      title: 'Carlos Fernández San Millán | Head of ICT & Acting CIO',
      description: 'Carlos Fernández San Millán - Head of ICT & Acting CIO. Technology Executive specializing in Digital Transformation, Research Computing, Cybersecurity, and Board Advisory.',
      keywords: 'Head of ICT, Acting CIO, IT Strategy, Digital Transformation, Cybersecurity, Research Computing, Board Advisory, Technology Executive'
    }),
    nav: Object.freeze({ home: 'Home', about: 'About', experience: 'Experience', achievements: 'Achievements', skills: 'Skills', contact: 'Contact' }),
    profile: Object.freeze({
      title: 'Head of ICT & Acting CIO | Board Advisor',
      availability: 'Available for Executive & Advisory Opportunities',
      location: 'Milan, Italy',
      budget: '14M € Budget Managed',
      teamSize: '25+ Team Size',
      yearsExperience: '15+',
      heroSummary: 'Technology Executive with 15+ years leading enterprise IT, digital transformation, and research computing in mission-driven international organizations.',
      aboutSummary1: 'Senior technology executive with 15+ years leading enterprise IT, research computing, cybersecurity, and digital transformation in complex, mission-driven international organizations.',
      aboutSummary2: 'Proven track record of aligning technology strategy with institutional objectives, delivering measurable business outcomes, and building high-performing teams. Expertise spans IT governance, digital transformation, HPC/data center operations, cybersecurity frameworks, and research technology enablement.',
      footerRole: 'Technology Executive & Digital Transformation Leader',
      footerOpportunity: 'Open to on-prem and/or remote, Executive roles in Tech/Research Companies/Institutes',
      contactEmail: 'carlos.fernandez.san.millan@gmail.com',
      badges: Object.freeze({
        actingCio: 'Acting CIO',
        headOfIt: 'Head of IT',
        certifications: 'SMART, PRINCE2, ITILv4',
        continuity: 'Business continuity',
        infrastructure: 'Data Center<br>HPC<br>Hybrid-Cloud',
        security: 'Cybersecurity<br>NIS2<br>GDPR<br>Compliance',
        years: '15+ Years Experience'
      }),
      features: Object.freeze({
        dataCenters: Object.freeze({ title: 'Data Centers', subtitle: 'HPC & Enterprise' }),
        cybersecurity: Object.freeze({ title: 'Cybersecurity', subtitle: 'GDPR & Compliance' }),
        cloud: Object.freeze({ title: 'Cloud', subtitle: 'Hybrid Architecture' }),
        leadership: Object.freeze({ title: 'Leadership', subtitle: '25+ FTEs Managed' })
      })
    }),
    staticText: Object.freeze({
      heroContactButton: 'Get In Touch',
      heroDownloadButton: 'Download CV',
      aboutHeading: 'Let Me <span class="text-accent">Introduce</span> Myself',
      aboutDownloadButton: 'Download CV',
      aboutYearsLabel: 'Years Experience',
      experienceHeading: 'Professional <span class="text-accent">Experience</span>',
      experienceSubtitle: 'A track record of leadership in world-class research institutions and enterprise environments.',
      achievementsHeading: 'Key Strategic <span class="text-accent">Achievements</span>',
      achievementsSubtitle: 'Measurable impact across digital transformation, cybersecurity, and financial optimization.',
      skillsHeading: 'Technology <span class="text-accent">Landscape</span>',
      skillsSubtitle: 'Expertise across infrastructure, cloud, storage, security, and operations.',
      competenciesHeading: 'Core Competencies',
      contactHeading: 'Let\'s <span class="text-accent">Connect</span>',
      contactIntro: 'I\'m always interested in hearing about new projects, opportunities, and challenges in the technology leadership space.',
      contactEmailLabel: 'Email',
      contactLocationLabel: 'Location',
      contactSocialLabel: 'Connect on social media:',
      contactFormHeading: 'Send a Message',
      contactNameLabel: 'Name',
      contactNamePlaceholder: 'Your name',
      contactEmailInputLabel: 'Email',
      contactEmailPlaceholder: 'your@email.com',
      contactMessageLabel: 'Message',
      contactMessagePlaceholder: 'Your message...',
      contactSubmit: 'Open Email Draft',
      contactInfo: 'This website does not send messages directly. Your email client will open with a prefilled draft to send.',
      footerReferences: 'References available upon request',
      footerUpdated: 'Updated:',
      footerCopyright: 'Carlos Fernández San Millán. All rights reserved.',
      ui: Object.freeze({
        skipLink: 'Skip to main content',
        primaryNavLabel: 'Primary',
        homeLinkLabel: 'Carlos Fernandez San Millan home',
        openMenuLabel: 'Open navigation menu',
        mobileNavLabel: 'Mobile navigation',
        closeMenuLabel: 'Close navigation menu',
        heroStatsLabel: 'Executive metrics',
        heroBadgesLabel: 'Executive strengths',
        socialLinksLabel: 'Social links',
        aboutFeaturesLabel: 'Core profile highlights',
        contactMethodsLabel: 'Primary contact methods',
        scrollToAboutLabel: 'Scroll to About section',
        languageSwitcherLabel: 'Language switcher',
        currentBadgeLabel: 'Current Role',
        socialLinkLabels: Object.freeze({
          linkedin: 'LinkedIn',
          github: 'GitHub',
          website: 'Website'
        })
      })
    }),
    achievements: Object.freeze([
      Object.freeze({ iconClass: 'fas fa-trophy', title: 'Strategy-to-Execution Transformation', descriptionHtml: 'Converted strategy into execution at Human Technopole, delivering <span class="text-accent font-bold">30%</span> efficiency improvement and <span class="text-accent font-bold">45%</span> manual-process reduction through targeted digital modernization and automation.', delay: 0 }),
      Object.freeze({ iconClass: 'fas fa-shield-alt', title: 'Cybersecurity & Control Maturity', descriptionHtml: 'Embedded GDPR-aligned security governance and operational controls across core services, contributing to a <span class="text-accent font-bold">60%</span> reduction in security incidents.', delay: 100 }),
      Object.freeze({ iconClass: 'fas fa-server', title: 'Scalable Operating Reliability', descriptionHtml: 'Stabilized and scaled infrastructure supporting <span class="text-accent font-bold">20PB+</span> scientific workloads while maintaining <span class="text-accent font-bold">99.99%</span> service reliability in production environments.', delay: 200 }),
      Object.freeze({ iconClass: 'fas fa-chart-line', title: 'Governance, Capital Efficiency & Vendor Performance', descriptionHtml: 'Restructured supplier governance and contract strategy to produce <span class="text-accent font-bold">40-60%</span> optimization in targeted agreements and improve service accountability.', delay: 300 })
    ]),
    skillGroups: Object.freeze([
      Object.freeze({ iconClass: 'fas fa-cloud', title: 'Infrastructure & Cloud', items: Object.freeze(['Endpoint management', 'Collaboration stack (M365)', 'SSO / MFA / identity integrations', 'VMware vSphere/Horizon, OpenNebula, oVirt', 'Linux & Windows Server', 'Hybrid Cloud, Docker, Kubernetes']), delay: 0 }),
      Object.freeze({ iconClass: 'fas fa-database', title: 'Storage & Data', items: Object.freeze(['NetApp, Dell PowerScale, PowerStore, Unity', 'vSAN, QNAP, Synology', 'Veeam, TSM, Bacula', 'HPC / Research Computing', 'Backup, Business Continuity, Disaster Recovery']), delay: 100 }),
      Object.freeze({ iconClass: 'fas fa-shield-alt', title: 'Security & Operations', items: Object.freeze(['Cybersecurity frameworks / GDPR / compliance', 'ITIL 4, PRINCE2, SMART', 'IAM / RBAC / endpoint security', 'Audit readiness & controls mapping', 'Foreman, Puppet, Ansible, Zabbix, Python']), delay: 200 })
    ]),
    competencies: Object.freeze(['Technology Strategy & Operating Model', 'Executive Leadership (Head of ICT / Acting CIO)', 'Board Advisory & Governance', 'Digital Transformation Execution', 'Cybersecurity & Risk Governance', 'IT Governance & Compliance', 'Cloud, Data Center & HPC Operations', 'Virtualization & Storage Engineering', 'Vendor & Contract Management', 'Cross-Functional Stakeholder Leadership']),
    experienceTimeline: Object.freeze([
      Object.freeze({ current: true, role: 'Head of ICT & Digitisation (Acting CIO)', org: 'Human Technopole', period: 'Jan 2023 - Present | Milan, Italy', bullets: Object.freeze(['Strategic ICT leadership across infrastructure, workplace, security, and enterprise platforms (25+ FTEs; 7 direct reports).', 'Technology roadmap and execution governance aligned to institutional priorities and measurable outcomes.', '30% efficiency gain and 45% process reduction through digital transformation and automation.', '20PB+ scientific workloads supported with 99.99% service availability.']) }),
      Object.freeze({ role: 'Data Center Infrastructure Manager', org: 'Human Technopole', period: 'May 2022 - Dec 2022 | Milan, Italy', summary: 'Led high-performance infrastructure operations, backup/DR strategy, standards definition, network security, and data center procurement planning.' }),
      Object.freeze({ role: 'Storage & Virtualisation Engineer', org: 'Human Technopole', period: 'Jan 2021 - May 2022 | Milan, Italy', summary: 'Managed PowerScale/NetApp storage and VMware/VDI platforms, plus Linux services supporting research computing operations.' }),
      Object.freeze({ role: 'Systems & Virtualisation Engineer', org: 'European Molecular Biology Laboratory (EMBL)', period: 'Oct 2018 - Dec 2020 | Heidelberg, Germany', summary: 'Managed 28-host VMware cluster (650+ VMs), 18-node NetApp estate (~9PB), vSAN for GPU VDI, and infrastructure automation with Python/Puppet/Foreman/Zabbix.' }),
      Object.freeze({ role: 'Systems Engineer', org: 'European Molecular Biology Laboratory (EMBL)', period: 'Oct 2012 - Oct 2018 | Heidelberg, Germany', summary: 'Delivered enterprise virtualization and storage lifecycle upgrades (ESX/ESXi 4.1 through 6.7) across multi-site environments.' }),
      Object.freeze({ role: 'IT Manager', org: 'Digital Arts & Designers, S.L.', period: 'Jul 2010 - Sep 2012 | Las Palmas de Gran Canaria, Spain', summary: 'Managed IT projects, Linux/server administration, network operations, monitoring, and technical procurement/vendor relationships.' })
    ])
  }),
  es: Object.freeze({
    locale: 'es-ES',
    meta: Object.freeze({
      title: 'Carlos Fernández San Millán | Responsable de TIC y CIO en funciones',
      description: 'Carlos Fernández San Millán - Responsable de TIC y CIO en funciones. Ejecutivo tecnológico especializado en Transformación Digital, Computación Científica, Ciberseguridad y Asesoría de Consejo.',
      keywords: 'Responsable de TIC, CIO en funciones, Estrategia TI, Transformación Digital, Ciberseguridad, Computación Científica, Asesoría de Consejo'
    }),
    nav: Object.freeze({ home: 'Inicio', about: 'Perfil', experience: 'Experiencia', achievements: 'Logros', skills: 'Capacidades', contact: 'Contacto' }),
    profile: Object.freeze({
      title: 'Responsable de TIC y CIO en funciones | Board Advisor',
      availability: 'Disponible para oportunidades ejecutivas y de asesoría',
      location: 'Milán, Italia',
      budget: 'Presupuesto gestionado: 14M €',
      teamSize: 'Equipo de 25+',
      yearsExperience: '15+',
      heroSummary: 'Ejecutivo tecnológico con más de 15 años liderando TI corporativa, transformación digital y computación científica en organizaciones internacionales orientadas a misión.',
      aboutSummary1: 'Ejecutivo senior de tecnología con más de 15 años liderando TI corporativa, computación científica, ciberseguridad y transformación digital en organizaciones complejas e internacionales.',
      aboutSummary2: 'Trayectoria demostrada alineando la estrategia tecnológica con objetivos institucionales, entregando resultados medibles y construyendo equipos de alto rendimiento. Experiencia en gobierno TI, transformación digital, operaciones de HPC/data center y marcos de ciberseguridad.',
      footerRole: 'Ejecutivo Tecnológico y Líder de Transformación Digital',
      footerOpportunity: 'Disponible para roles ejecutivos presenciales y/o remotos en empresas e institutos de tecnología e investigación',
      contactEmail: 'carlos.fernandez.san.millan@gmail.com',
      badges: Object.freeze({
        actingCio: 'CIO en funciones',
        headOfIt: 'Responsable de TI',
        certifications: 'SMART, PRINCE2, ITILv4',
        continuity: 'Continuidad de negocio',
        infrastructure: 'Centro de Datos<br>HPC<br>Cloud Híbrido',
        security: 'Ciberseguridad<br>NIS2<br>GDPR<br>Compliance',
        years: '15+ años de experiencia'
      }),
      features: Object.freeze({
        dataCenters: Object.freeze({ title: 'Centros de Datos', subtitle: 'HPC y Enterprise' }),
        cybersecurity: Object.freeze({ title: 'Ciberseguridad', subtitle: 'GDPR y Compliance' }),
        cloud: Object.freeze({ title: 'Cloud', subtitle: 'Arquitectura Híbrida' }),
        leadership: Object.freeze({ title: 'Liderazgo', subtitle: '25+ FTE gestionados' })
      })
    }),
    staticText: Object.freeze({
      heroContactButton: 'Contactar',
      heroDownloadButton: 'Descargar CV',
      aboutHeading: '<span class="text-accent">Presentación</span> Profesional',
      aboutDownloadButton: 'Descargar CV',
      aboutYearsLabel: 'Años de experiencia',
      experienceHeading: '<span class="text-accent">Experiencia</span> Profesional',
      experienceSubtitle: 'Trayectoria de liderazgo en instituciones de investigación de referencia y entornos corporativos complejos.',
      achievementsHeading: '<span class="text-accent">Logros</span> Estratégicos',
      achievementsSubtitle: 'Impacto medible en transformación digital, ciberseguridad y optimización financiera.',
      skillsHeading: '<span class="text-accent">Panorama</span> Tecnológico',
      skillsSubtitle: 'Experiencia en infraestructura, cloud, almacenamiento, seguridad y operaciones.',
      competenciesHeading: 'Competencias Clave',
      contactHeading: '<span class="text-accent">Conectemos</span>',
      contactIntro: 'Me interesa conocer nuevos proyectos, oportunidades y retos dentro del liderazgo tecnológico.',
      contactEmailLabel: 'Correo',
      contactLocationLabel: 'Ubicación',
      contactSocialLabel: 'Conecta en redes:',
      contactFormHeading: 'Enviar Mensaje',
      contactNameLabel: 'Nombre',
      contactNamePlaceholder: 'Tu nombre',
      contactEmailInputLabel: 'Correo',
      contactEmailPlaceholder: 'tu@email.com',
      contactMessageLabel: 'Mensaje',
      contactMessagePlaceholder: 'Tu mensaje...',
      contactSubmit: 'Abrir borrador de correo',
      contactInfo: 'Este sitio no envía mensajes directamente. Se abrirá tu cliente de correo con un borrador precompletado.',
      footerReferences: 'Referencias disponibles bajo solicitud',
      footerUpdated: 'Actualizado:',
      footerCopyright: 'Carlos Fernández San Millán. Todos los derechos reservados.',
      ui: Object.freeze({
        skipLink: 'Ir al contenido principal',
        primaryNavLabel: 'Principal',
        homeLinkLabel: 'Inicio de Carlos Fernández San Millán',
        openMenuLabel: 'Abrir menú de navegación',
        mobileNavLabel: 'Navegación móvil',
        closeMenuLabel: 'Cerrar menú de navegación',
        heroStatsLabel: 'Indicadores ejecutivos',
        heroBadgesLabel: 'Fortalezas ejecutivas',
        socialLinksLabel: 'Enlaces sociales',
        aboutFeaturesLabel: 'Aspectos clave del perfil',
        contactMethodsLabel: 'Métodos principales de contacto',
        scrollToAboutLabel: 'Ir a la sección Perfil',
        languageSwitcherLabel: 'Selector de idioma',
        currentBadgeLabel: 'Cargo Actual',
        socialLinkLabels: Object.freeze({
          linkedin: 'LinkedIn',
          github: 'GitHub',
          website: 'Sitio web'
        })
      })
    }),
    achievements: Object.freeze([
      Object.freeze({ iconClass: 'fas fa-trophy', title: 'Transformación de estrategia a ejecución', descriptionHtml: 'Convertí estrategia en ejecución en Human Technopole, logrando <span class="text-accent font-bold">30%</span> de mejora de eficiencia y <span class="text-accent font-bold">45%</span> de reducción de procesos manuales mediante modernización digital y automatización.', delay: 0 }),
      Object.freeze({ iconClass: 'fas fa-shield-alt', title: 'Madurez en ciberseguridad y control', descriptionHtml: 'Implanté gobierno de seguridad y controles operativos alineados con GDPR, contribuyendo a una reducción del <span class="text-accent font-bold">60%</span> en incidentes.', delay: 100 }),
      Object.freeze({ iconClass: 'fas fa-server', title: 'Fiabilidad operativa escalable', descriptionHtml: 'Estabilicé y escalé infraestructura para cargas científicas de <span class="text-accent font-bold">20PB+</span>, manteniendo <span class="text-accent font-bold">99.99%</span> de disponibilidad.', delay: 200 }),
      Object.freeze({ iconClass: 'fas fa-chart-line', title: 'Gobierno, eficiencia de capital y proveedores', descriptionHtml: 'Reestructuré el gobierno de proveedores y estrategia contractual para lograr optimización del <span class="text-accent font-bold">40-60%</span> en acuerdos objetivo.', delay: 300 })
    ]),
    skillGroups: Object.freeze([
      Object.freeze({ iconClass: 'fas fa-cloud', title: 'Infraestructura y Cloud', items: Object.freeze(['Gestión de endpoints', 'Stack de colaboración (M365)', 'Integraciones SSO / MFA / identidad', 'VMware vSphere/Horizon, OpenNebula, oVirt', 'Linux y Windows Server', 'Cloud híbrido, Docker, Kubernetes']), delay: 0 }),
      Object.freeze({ iconClass: 'fas fa-database', title: 'Almacenamiento y Datos', items: Object.freeze(['NetApp, Dell PowerScale, PowerStore, Unity', 'vSAN, QNAP, Synology', 'Veeam, TSM, Bacula', 'HPC / Computación científica', 'Backup, continuidad de negocio, DR']), delay: 100 }),
      Object.freeze({ iconClass: 'fas fa-shield-alt', title: 'Seguridad y Operaciones', items: Object.freeze(['Marcos de ciberseguridad / GDPR / compliance', 'ITIL 4, PRINCE2, SMART', 'IAM / RBAC / seguridad endpoint', 'Preparación de auditoría y mapeo de controles', 'Foreman, Puppet, Ansible, Zabbix, Python']), delay: 200 })
    ]),
    competencies: Object.freeze(['Estrategia Tecnológica y Modelo Operativo', 'Liderazgo Ejecutivo (Responsable TIC / CIO en funciones)', 'Asesoría de Consejo y Gobierno', 'Ejecución de Transformación Digital', 'Ciberseguridad y Gobierno del Riesgo', 'Gobierno TI y Cumplimiento', 'Operaciones Cloud, Data Center y HPC', 'Ingeniería de Virtualización y Storage', 'Gestión de Proveedores y Contratos', 'Liderazgo transversal de stakeholders']),
    experienceTimeline: Object.freeze([
      Object.freeze({ current: true, role: 'Responsable de TIC y Digitalización (CIO en funciones)', org: 'Human Technopole', period: 'Ene 2023 - Actualidad | Milán, Italia', bullets: Object.freeze(['Liderazgo estratégico de TIC en infraestructura, workplace, seguridad y plataformas enterprise (25+ FTE; 7 reportes directos).', 'Hoja de ruta tecnológica y gobierno de ejecución alineados con prioridades institucionales y resultados medibles.', '30% de mejora de eficiencia y 45% de reducción de procesos mediante transformación digital y automatización.', 'Soporte a cargas científicas de 20PB+ con 99.99% de disponibilidad.']) }),
      Object.freeze({ role: 'Responsable de Infraestructura de Data Center', org: 'Human Technopole', period: 'May 2022 - Dic 2022 | Milán, Italia', summary: 'Lideré operaciones de infraestructura de alto rendimiento, estrategia de backup/DR, estándares, seguridad de red y planificación de compras.' }),
      Object.freeze({ role: 'Ingeniero de Storage y Virtualización', org: 'Human Technopole', period: 'Ene 2021 - May 2022 | Milán, Italia', summary: 'Gestioné plataformas de storage PowerScale/NetApp y VMware/VDI, junto con servicios Linux para computación científica.' }),
      Object.freeze({ role: 'Ingeniero de Sistemas y Virtualización', org: 'European Molecular Biology Laboratory (EMBL)', period: 'Oct 2018 - Dic 2020 | Heidelberg, Alemania', summary: 'Gestioné clúster VMware de 28 hosts (650+ VM), entorno NetApp de 18 nodos (~9PB), vSAN para VDI GPU y automatización con Python/Puppet/Foreman/Zabbix.' }),
      Object.freeze({ role: 'Ingeniero de Sistemas', org: 'European Molecular Biology Laboratory (EMBL)', period: 'Oct 2012 - Oct 2018 | Heidelberg, Alemania', summary: 'Lideré operaciones de virtualización y storage y upgrades de ciclo de vida (ESX/ESXi 4.1 a 6.7) en entorno multi-sede.' }),
      Object.freeze({ role: 'IT Manager', org: 'Digital Arts & Designers, S.L.', period: 'Jul 2010 - Sep 2012 | Las Palmas de Gran Canaria, España', summary: 'Gestioné proyectos TI, administración Linux/servidores, redes, monitorización y relación técnica con proveedores.' })
    ])
  }),
  it: Object.freeze({
    locale: 'it-IT',
    meta: Object.freeze({
      title: 'Carlos Fernández San Millán | Responsabile ICT e CIO ad interim',
      description: 'Carlos Fernández San Millán - Responsabile ICT e CIO ad interim. Executive tecnologico specializzato in Trasformazione Digitale, Calcolo Scientifico, Cybersecurity e Board Advisory.',
      keywords: 'Responsabile ICT, CIO ad interim, Strategia IT, Trasformazione Digitale, Cybersecurity, Calcolo Scientifico, Board Advisory'
    }),
    nav: Object.freeze({ home: 'Home', about: 'Profilo', experience: 'Esperienza', achievements: 'Risultati', skills: 'Competenze', contact: 'Contatti' }),
    profile: Object.freeze({
      title: 'Responsabile ICT e CIO ad interim | Board Advisor',
      availability: 'Disponibile per opportunità executive e advisory',
      location: 'Milano, Italia',
      budget: 'Budget gestito: 14M €',
      teamSize: 'Team di 25+',
      yearsExperience: '15+',
      heroSummary: 'Executive tecnologico con oltre 15 anni di leadership in IT enterprise, trasformazione digitale e calcolo scientifico in organizzazioni internazionali mission-driven.',
      aboutSummary1: 'Senior technology executive con oltre 15 anni di esperienza in IT enterprise, calcolo scientifico, cybersecurity e trasformazione digitale in organizzazioni complesse e internazionali.',
      aboutSummary2: 'Track record consolidato nell\'allineare la strategia tecnologica agli obiettivi istituzionali, generando risultati misurabili e costruendo team ad alte prestazioni. Competenze su governance IT, trasformazione digitale, operations HPC/data center e cybersecurity.',
      footerRole: 'Technology Executive & Digital Transformation Leader',
      footerOpportunity: 'Disponibile per ruoli executive on-site e/o remote in aziende e istituti tech/research',
      contactEmail: 'carlos.fernandez.san.millan@gmail.com',
      badges: Object.freeze({
        actingCio: 'CIO ad interim',
        headOfIt: 'Responsabile IT',
        certifications: 'SMART, PRINCE2, ITILv4',
        continuity: 'Business continuity',
        infrastructure: 'Data Center<br>HPC<br>Hybrid Cloud',
        security: 'Cybersecurity<br>NIS2<br>GDPR<br>Compliance',
        years: '15+ anni di esperienza'
      }),
      features: Object.freeze({
        dataCenters: Object.freeze({ title: 'Data Center', subtitle: 'HPC & Enterprise' }),
        cybersecurity: Object.freeze({ title: 'Cybersecurity', subtitle: 'GDPR & Compliance' }),
        cloud: Object.freeze({ title: 'Cloud', subtitle: 'Architettura Ibrida' }),
        leadership: Object.freeze({ title: 'Leadership', subtitle: '25+ FTE gestiti' })
      })
    }),
    staticText: Object.freeze({
      heroContactButton: 'Contattami',
      heroDownloadButton: 'Scarica CV',
      aboutHeading: '<span class="text-accent">Profilo</span> Professionale',
      aboutDownloadButton: 'Scarica CV',
      aboutYearsLabel: 'Anni di esperienza',
      experienceHeading: '<span class="text-accent">Esperienza</span> Professionale',
      experienceSubtitle: 'Percorso di leadership in istituzioni di ricerca di livello internazionale e contesti enterprise.',
      achievementsHeading: 'Principali <span class="text-accent">Risultati</span> Strategici',
      achievementsSubtitle: 'Impatto misurabile su trasformazione digitale, cybersecurity e ottimizzazione finanziaria.',
      skillsHeading: '<span class="text-accent">Panorama</span> Tecnologico',
      skillsSubtitle: 'Competenze su infrastruttura, cloud, storage, sicurezza e operations.',
      competenciesHeading: 'Competenze Chiave',
      contactHeading: '<span class="text-accent">Restiamo in contatto</span>',
      contactIntro: 'Sono interessato a nuovi progetti, opportunità e sfide nell\'ambito della leadership tecnologica.',
      contactEmailLabel: 'Email',
      contactLocationLabel: 'Sede',
      contactSocialLabel: 'Connettiti sui social:',
      contactFormHeading: 'Invia un Messaggio',
      contactNameLabel: 'Nome',
      contactNamePlaceholder: 'Il tuo nome',
      contactEmailInputLabel: 'Email',
      contactEmailPlaceholder: 'tu@email.com',
      contactMessageLabel: 'Messaggio',
      contactMessagePlaceholder: 'Il tuo messaggio...',
      contactSubmit: 'Apri bozza email',
      contactInfo: 'Questo sito non invia messaggi direttamente. Si aprirà il client email con una bozza precompilata.',
      footerReferences: 'Referenze disponibili su richiesta',
      footerUpdated: 'Aggiornato:',
      footerCopyright: 'Carlos Fernández San Millán. Tutti i diritti riservati.',
      ui: Object.freeze({
        skipLink: 'Vai al contenuto principale',
        primaryNavLabel: 'Principale',
        homeLinkLabel: 'Home di Carlos Fernández San Millán',
        openMenuLabel: 'Apri menu di navigazione',
        mobileNavLabel: 'Navigazione mobile',
        closeMenuLabel: 'Chiudi menu di navigazione',
        heroStatsLabel: 'Metriche executive',
        heroBadgesLabel: 'Punti di forza executive',
        socialLinksLabel: 'Link social',
        aboutFeaturesLabel: 'Punti chiave del profilo',
        contactMethodsLabel: 'Principali metodi di contatto',
        scrollToAboutLabel: 'Vai alla sezione Profilo',
        languageSwitcherLabel: 'Selettore lingua',
        currentBadgeLabel: 'Ruolo Attuale',
        socialLinkLabels: Object.freeze({
          linkedin: 'LinkedIn',
          github: 'GitHub',
          website: 'Sito web'
        })
      })
    }),
    achievements: Object.freeze([
      Object.freeze({ iconClass: 'fas fa-trophy', title: 'Trasformazione da strategia a esecuzione', descriptionHtml: 'Trasformata la strategia in esecuzione in Human Technopole, con <span class="text-accent font-bold">30%</span> di miglioramento dell\'efficienza e <span class="text-accent font-bold">45%</span> di riduzione dei processi manuali tramite modernizzazione digitale e automazione.', delay: 0 }),
      Object.freeze({ iconClass: 'fas fa-shield-alt', title: 'Maturità in cybersecurity e controllo', descriptionHtml: 'Implementata governance della sicurezza e controlli operativi allineati al GDPR, contribuendo a una riduzione del <span class="text-accent font-bold">60%</span> degli incidenti.', delay: 100 }),
      Object.freeze({ iconClass: 'fas fa-server', title: 'Affidabilità operativa scalabile', descriptionHtml: 'Stabilizzate e scalate infrastrutture per workload scientifici di <span class="text-accent font-bold">20PB+</span> mantenendo <span class="text-accent font-bold">99.99%</span> di disponibilità.', delay: 200 }),
      Object.freeze({ iconClass: 'fas fa-chart-line', title: 'Governance, efficienza del capitale e fornitori', descriptionHtml: 'Ristrutturata la governance fornitori e la strategia contrattuale con ottimizzazione del <span class="text-accent font-bold">40-60%</span> su accordi mirati.', delay: 300 })
    ]),
    skillGroups: Object.freeze([
      Object.freeze({ iconClass: 'fas fa-cloud', title: 'Infrastruttura e Cloud', items: Object.freeze(['Gestione endpoint', 'Stack collaboration (M365)', 'Integrazioni SSO / MFA / identità', 'VMware vSphere/Horizon, OpenNebula, oVirt', 'Linux e Windows Server', 'Cloud ibrido, Docker, Kubernetes']), delay: 0 }),
      Object.freeze({ iconClass: 'fas fa-database', title: 'Storage e Dati', items: Object.freeze(['NetApp, Dell PowerScale, PowerStore, Unity', 'vSAN, QNAP, Synology', 'Veeam, TSM, Bacula', 'HPC / Calcolo scientifico', 'Backup, business continuity, disaster recovery']), delay: 100 }),
      Object.freeze({ iconClass: 'fas fa-shield-alt', title: 'Sicurezza e Operations', items: Object.freeze(['Framework cybersecurity / GDPR / compliance', 'ITIL 4, PRINCE2, SMART', 'IAM / RBAC / sicurezza endpoint', 'Audit readiness e mappatura controlli', 'Foreman, Puppet, Ansible, Zabbix, Python']), delay: 200 })
    ]),
    competencies: Object.freeze(['Strategia Tecnologica e Modello Operativo', 'Leadership Executive (Responsabile ICT / CIO ad interim)', 'Board Advisory e Governance', 'Esecuzione Trasformazione Digitale', 'Cybersecurity e Governance del Rischio', 'Governance IT e Compliance', 'Operations Cloud, Data Center e HPC', 'Ingegneria Virtualizzazione e Storage', 'Gestione Fornitori e Contratti', 'Leadership trasversale stakeholder']),
    experienceTimeline: Object.freeze([
      Object.freeze({ current: true, role: 'Responsabile ICT e Digitalizzazione (CIO ad interim)', org: 'Human Technopole', period: 'Gen 2023 - Oggi | Milano, Italia', bullets: Object.freeze(['Leadership strategica ICT su infrastrutture, workplace, sicurezza e piattaforme enterprise (25+ FTE; 7 riporti diretti).', 'Roadmap tecnologica e governance esecutiva allineate alle priorità istituzionali e a risultati misurabili.', '30% di miglioramento dell\'efficienza e 45% di riduzione dei processi tramite trasformazione digitale e automazione.', 'Supporto a workload scientifici di 20PB+ con disponibilità al 99.99%.']) }),
      Object.freeze({ role: 'Data Center Infrastructure Manager', org: 'Human Technopole', period: 'Mag 2022 - Dic 2022 | Milano, Italia', summary: 'Guidate operations infrastrutturali ad alte prestazioni, strategia backup/DR, definizione standard, sicurezza di rete e pianificazione procurement.' }),
      Object.freeze({ role: 'Storage & Virtualisation Engineer', org: 'Human Technopole', period: 'Gen 2021 - Mag 2022 | Milano, Italia', summary: 'Gestite piattaforme storage PowerScale/NetApp e VMware/VDI, oltre a servizi Linux per il calcolo scientifico.' }),
      Object.freeze({ role: 'Systems & Virtualisation Engineer', org: 'European Molecular Biology Laboratory (EMBL)', period: 'Ott 2018 - Dic 2020 | Heidelberg, Germania', summary: 'Gestito cluster VMware da 28 host (650+ VM), ambiente NetApp da 18 nodi (~9PB), vSAN per VDI GPU e automazione infrastrutturale con Python/Puppet/Foreman/Zabbix.' }),
      Object.freeze({ role: 'Systems Engineer', org: 'European Molecular Biology Laboratory (EMBL)', period: 'Ott 2012 - Ott 2018 | Heidelberg, Germania', summary: 'Erogate operations di virtualizzazione/storage e upgrade lifecycle (ESX/ESXi 4.1 fino a 6.7) in ambiente multi-sito.' }),
      Object.freeze({ role: 'IT Manager', org: 'Digital Arts & Designers, S.L.', period: 'Lug 2010 - Set 2012 | Las Palmas de Gran Canaria, Spagna', summary: 'Gestiti progetti IT, amministrazione Linux/server, rete, monitoraggio e relazioni tecniche con fornitori.' })
    ])
  })
});


global.__SITE_CONTENT = Object.freeze({
  LANGS,
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  SITE_CONFIG,
  CV_FILES,
  NAV_ITEMS,
  SOCIAL_LINKS,
  I18N
});
}(globalThis));
