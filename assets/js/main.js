'use strict';

const LANGS = Object.freeze(['en', 'es', 'it']);
const DEFAULT_LANG = 'en';
const LANG_STORAGE_KEY = 'site_lang';

const NAV_ITEMS = Object.freeze([
  Object.freeze({ href: '#home', key: 'home' }),
  Object.freeze({ href: '#about', key: 'about' }),
  Object.freeze({ href: '#experience', key: 'experience' }),
  Object.freeze({ href: '#achievements', key: 'achievements' }),
  Object.freeze({ href: '#skills', key: 'skills' }),
  Object.freeze({ href: '#contact', key: 'contact', cta: true })
]);

const SOCIAL_LINKS = Object.freeze([
  Object.freeze({ href: 'https://linkedin.com/in/carlosfernandezsanmillan', iconClass: 'fab fa-linkedin-in text-xl', label: 'LinkedIn' }),
  Object.freeze({ href: 'https://github.com/Cormite', iconClass: 'fab fa-github text-xl', label: 'GitHub' }),
  Object.freeze({ href: 'https://www.cormite.com', iconClass: 'fas fa-globe text-xl', label: 'Website' })
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
      contactEmail: 'carlos.fernandez.san.millan@gmail.com'
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
      footerUpdated: 'Updated:'
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
      contactEmail: 'carlos.fernandez.san.millan@gmail.com'
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
      footerUpdated: 'Actualizado:'
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
      contactEmail: 'carlos.fernandez.san.millan@gmail.com'
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
      footerUpdated: 'Aggiornato:'
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

const CLASSNAMES = Object.freeze({
  desktopNavItem: 'text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors',
  desktopNavCta: 'bg-accent hover:bg-accent-light text-white px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105',
  mobileNavItem: 'block text-white hover:text-accent py-2 text-lg',
  mobileNavCta: 'block text-accent py-2 text-lg font-bold'
});

let currentLanguage = DEFAULT_LANG;
let closeMobileMenuRef = null;

function byId(id) {
  return document.getElementById(id);
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setText(id, value) {
  const node = byId(id);
  if (node) node.textContent = value;
}

function setHtml(id, value) {
  const node = byId(id);
  if (node) node.innerHTML = value;
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

function detectLanguage() {
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (queryLang && LANGS.includes(queryLang)) return queryLang;

  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && LANGS.includes(stored)) return stored;

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (LANGS.includes(browser)) return browser;

  return DEFAULT_LANG;
}

function updateLanguageInUrl(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url.toString());
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
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
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
    footerOpportunity.innerHTML = `<i class="fas fa-user-tie mr-2" aria-hidden="true"></i>${profile.footerOpportunity}`;
  }
}

function renderStaticText(content) {
  const text = content.staticText;

  const heroMailButton = document.querySelector('#home a[href^="mailto:"]');
  if (heroMailButton) heroMailButton.innerHTML = '<i class="fas fa-envelope mr-2" aria-hidden="true"></i>' + text.heroContactButton;

  const heroDownloadButton = document.querySelector('#home a[href$=".pdf"]');
  if (heroDownloadButton) heroDownloadButton.innerHTML = '<i class="fas fa-download mr-2" aria-hidden="true"></i>' + text.heroDownloadButton;

  setHtml('about-heading', text.aboutHeading);
  const aboutDownloadButton = document.querySelector('#about a[href$=".pdf"]');
  if (aboutDownloadButton) aboutDownloadButton.innerHTML = '<i class="fas fa-download mr-2" aria-hidden="true"></i>' + text.aboutDownloadButton;

  const aboutYearsLabel = document.querySelector('#about-years-value + div');
  if (aboutYearsLabel) aboutYearsLabel.textContent = text.aboutYearsLabel;

  setHtml('experience-heading', text.experienceHeading);
  const experienceSubtitle = document.querySelector('#experience .text-center p');
  if (experienceSubtitle) experienceSubtitle.textContent = text.experienceSubtitle;

  setHtml('achievements-heading', text.achievementsHeading);
  const achievementsSubtitle = document.querySelector('#achievements .text-center p');
  if (achievementsSubtitle) achievementsSubtitle.textContent = text.achievementsSubtitle;

  setHtml('skills-heading', text.skillsHeading);
  const skillsSubtitle = document.querySelector('#skills .text-center p');
  if (skillsSubtitle) skillsSubtitle.textContent = text.skillsSubtitle;

  const competenciesHeading = document.querySelector('#skills .mt-16 h3');
  if (competenciesHeading) competenciesHeading.textContent = text.competenciesHeading;

  setHtml('contact-heading', text.contactHeading);
  const contactIntro = document.querySelector('#contact .grid > div:first-child > p');
  if (contactIntro) contactIntro.textContent = text.contactIntro;

  const emailLabel = document.querySelector('#contact .group p.text-sm.text-soft-text');
  if (emailLabel) emailLabel.textContent = text.contactEmailLabel;

  const locationLabel = document.querySelector('#contact .group:nth-of-type(2) p.text-sm.text-soft-text');
  if (locationLabel) locationLabel.textContent = text.contactLocationLabel;

  const socialLabel = document.querySelector('#contact .mt-10 p.text-sm');
  if (socialLabel) socialLabel.textContent = text.contactSocialLabel;

  const contactFormHeading = document.querySelector('#contact-form').parentElement.querySelector('h3');
  if (contactFormHeading) contactFormHeading.textContent = text.contactFormHeading;

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

  const submit = document.querySelector('#contact-form button[type="submit"]');
  if (submit) submit.innerHTML = '<i class="fas fa-paper-plane mr-2" aria-hidden="true"></i>' + text.contactSubmit;

  const infoBox = byId('form-success');
  if (infoBox) infoBox.innerHTML = '<i class="fas fa-info-circle mr-2" aria-hidden="true"></i>' + text.contactInfo;

  const footerReferences = document.querySelector('footer .flex.items-center.gap-6 span:first-child');
  if (footerReferences) footerReferences.innerHTML = '<i class="fas fa-info-circle mr-2" aria-hidden="true"></i>' + text.footerReferences;

  const updatedLabel = document.querySelector('footer .flex.items-center.gap-6 span:last-child');
  if (updatedLabel) {
    const dateSpan = byId('current-date');
    if (dateSpan) {
      updatedLabel.innerHTML = `<i class="fas fa-calendar-alt mr-2" aria-hidden="true"></i>${text.footerUpdated} <span id="current-date"></span>`;
      setCurrentDate(content.locale);
    }
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

    const currentBadge = item.current ? (currentLanguage === 'es' ? 'Actual' : (currentLanguage === 'it' ? 'In corso' : 'Current')) : '';
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

function initAOS() {
  if (typeof AOS === 'undefined' || prefersReducedMotion()) return;

  AOS.init({ duration: 800, once: true, offset: 100 });
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
  markDecorativeIcons();

  if (typeof AOS !== 'undefined') {
    AOS.refreshHard();
  }
}

function bootstrap() {
  currentLanguage = detectLanguage();
  renderAll();
  setupNavbarScroll();
  setupMobileMenu();
  setupSmoothScroll();
  initAOS();
}

onReady(bootstrap);
