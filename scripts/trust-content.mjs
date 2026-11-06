// Text of the "Trust and security" page, in the three site languages. Build-time only (never shipped to the browser).
// Every statement describes how the site is built and run today; the tests and CI named here exist in this repository.
export const REPOSITORY_URL = 'https://github.com/cormite/cormite.github.io';

export const TRUST = {
  en: {
    path: 'trust/',
    linkLabel: 'Trust and security',
    title: 'Trust and security',
    description: 'How this site protects visitors, how changes reach it and how it is monitored. Written so you can check it.',
    intro: 'This site is small on purpose. What it does, and how it is run, is written down here so you can check it rather than take my word for it.',
    home: 'Back to the home page',
    updated: 'Last built',
    reportTitle: 'Report a problem',
    sections: [
      { h: 'Privacy', p: ['Nothing is sent to anyone until you choose. Google Analytics 4 loads only if you accept, in Consent Mode with every kind of storage denied by default and with advertising and profiling features switched off. You can change your mind at any time from the privacy button in the footer.', 'The site sets no cookies of its own. Your choice (and your language) is kept in your browser, on your device.'] },
      { h: 'Protection in your browser', p: ['Every page is served with a strict Content Security Policy. It forbids inline scripts and eval, limits everything to this site (plus Google’s analytics hosts, used only after consent), blocks framing and upgrades insecure requests. HTTPS is enforced for a year (HSTS), the Permissions Policy switches off camera, microphone, location and other sensors, and an opener policy isolates the page from other windows.', 'You can see all of it in your browser’s developer tools, in the Network tab.'] },
      { h: 'Domain and email', p: ['DNSSEC is enabled on the domain. Mail addresses at this domain only receive and forward: SPF and DMARC are set to reject anything sent in the domain’s name that is not authorised.', 'Security reports go to {security}. The machine-readable contact file (RFC 9116) is at /.well-known/security.txt and is renewed with every release.'] },
      { h: 'How a change goes live', p: ['Every change runs through an automatic test suite covering accessibility, colour contrast, security headers, page weight and the generated pages, plus a dependency audit that fails on high-severity findings and code scanning for vulnerabilities. A check fails if the published files differ from what the source builds.', 'A change is first published to a password-protected staging copy. Publishing to production is a separate, manual step that needs a typed confirmation and a reviewer’s approval, and the previous version stays available as a fallback.'] },
      { h: 'Speed is a requirement', p: ['A first visit has a budget of 200 KB and 12 requests, enforced by tests: a change that goes over it does not get published. “How this page performed”, in the footer of the home page, shows what your own visit actually cost, measured by your browser.'] },
      { h: 'Monitoring', p: ['Every 30 minutes an automatic check confirms that the site answers, that its security headers are present, that the old and www addresses redirect correctly, that the certificate is valid for at least two more weeks, that mail routing is in place and that the security contact file has not expired. A failure sends an alert.'] },
      { h: 'Open source', p: ['The whole site, tests and release process included, is public.'] }
    ],
    reportText: 'Found something wrong? Write to {security}. A real person reads it.'
  },
  es: {
    path: 'es/trust/',
    linkLabel: 'Confianza y seguridad',
    title: 'Confianza y seguridad',
    description: 'Cómo protege este sitio a quien lo visita, cómo llegan los cambios y cómo se vigila. Escrito para que puedas comprobarlo.',
    intro: 'Este sitio es pequeño a propósito. Lo que hace y cómo se gestiona está escrito aquí para que puedas comprobarlo en lugar de fiarte de mi palabra.',
    home: 'Volver a la página de inicio',
    updated: 'Última compilación',
    reportTitle: 'Avisar de un problema',
    sections: [
      { h: 'Privacidad', p: ['No se envía nada a nadie hasta que tú decides. Google Analytics 4 solo se carga si aceptas, en Consent Mode con todo tipo de almacenamiento denegado por defecto y con las funciones de publicidad y perfilado desactivadas. Puedes cambiar de opinión en cualquier momento desde el botón de privacidad del pie de página.', 'El sitio no instala cookies propias. Tu elección (y tu idioma) se guarda en tu navegador, en tu dispositivo.'] },
      { h: 'Protección en tu navegador', p: ['Todas las páginas se sirven con una Content Security Policy estricta. Prohíbe scripts en línea y eval, limita todo a este sitio (más los servidores de analítica de Google, solo tras el consentimiento), impide que se incruste en otras páginas y convierte las peticiones inseguras en seguras. HTTPS es obligatorio durante un año (HSTS), la Permissions Policy desactiva cámara, micrófono, ubicación y otros sensores, y una política de apertura aísla la página de otras ventanas.', 'Puedes verlo todo en las herramientas de desarrollo de tu navegador, en la pestaña Red.'] },
      { h: 'Dominio y correo', p: ['DNSSEC está activado en el dominio. Las direcciones de correo de este dominio solo reciben y reenvían: SPF y DMARC están configurados para rechazar cualquier mensaje enviado en nombre del dominio que no esté autorizado.', 'Los avisos de seguridad van a {security}. El archivo de contacto legible por máquinas (RFC 9116) está en /.well-known/security.txt y se renueva con cada publicación.'] },
      { h: 'Cómo llega un cambio a producción', p: ['Cada cambio pasa por un conjunto automático de pruebas que cubre accesibilidad, contraste de color, cabeceras de seguridad, peso de página y las páginas generadas, además de una auditoría de dependencias que falla ante hallazgos de gravedad alta y un análisis de código en busca de vulnerabilidades. Una comprobación falla si los archivos publicados difieren de lo que genera el código fuente.', 'Un cambio se publica primero en una copia de pruebas protegida con contraseña. Publicar en producción es un paso manual aparte que exige una confirmación escrita y la aprobación de un revisor, y la versión anterior sigue disponible como respaldo.'] },
      { h: 'La velocidad es un requisito', p: ['Una primera visita tiene un presupuesto de 200 KB y 12 peticiones, controlado por pruebas: un cambio que lo supere no se publica. «Cómo se ha comportado esta página», en el pie de la página de inicio, muestra lo que costó tu propia visita, medido por tu navegador.'] },
      { h: 'Vigilancia', p: ['Cada 30 minutos una comprobación automática confirma que el sitio responde, que están las cabeceras de seguridad, que las direcciones antiguas y con www redirigen bien, que el certificado es válido al menos dos semanas más, que el enrutamiento del correo funciona y que el archivo de contacto de seguridad no ha caducado. Un fallo envía una alerta.'] },
      { h: 'Código abierto', p: ['Todo el sitio, con sus pruebas y su proceso de publicación, es público.'] }
    ],
    reportText: '¿Has encontrado algo que no va bien? Escribe a {security}. Lo lee una persona.'
  },
  it: {
    path: 'it/trust/',
    linkLabel: 'Fiducia e sicurezza',
    title: 'Fiducia e sicurezza',
    description: 'Come questo sito protegge chi lo visita, come arrivano le modifiche e come viene monitorato. Scritto perché tu possa verificarlo.',
    intro: 'Questo sito è piccolo di proposito. Quello che fa e come viene gestito è scritto qui, perché tu possa verificarlo invece di fidarti della mia parola.',
    home: 'Torna alla home page',
    updated: 'Ultima compilazione',
    reportTitle: 'Segnalare un problema',
    sections: [
      { h: 'Privacy', p: ['Non viene inviato nulla a nessuno finché non scegli tu. Google Analytics 4 si carica solo se accetti, in Consent Mode con ogni tipo di archiviazione negato per impostazione predefinita e con le funzioni di pubblicità e profilazione disattivate. Puoi cambiare idea in qualsiasi momento dal pulsante privacy nel piè di pagina.', 'Il sito non imposta cookie propri. La tua scelta (e la tua lingua) restano nel tuo browser, sul tuo dispositivo.'] },
      { h: 'Protezione nel tuo browser', p: ['Ogni pagina viene servita con una Content Security Policy rigorosa. Vieta script inline ed eval, limita tutto a questo sito (più i server di analytics di Google, solo dopo il consenso), impedisce l’inserimento in altre pagine e trasforma le richieste non sicure in sicure. HTTPS è obbligatorio per un anno (HSTS), la Permissions Policy disattiva fotocamera, microfono, posizione e altri sensori e una opener policy isola la pagina dalle altre finestre.', 'Puoi vedere tutto negli strumenti per sviluppatori del tuo browser, nella scheda Rete.'] },
      { h: 'Dominio ed e-mail', p: ['DNSSEC è attivo sul dominio. Gli indirizzi e-mail di questo dominio ricevono e inoltrano soltanto: SPF e DMARC sono impostati per rifiutare qualsiasi messaggio inviato a nome del dominio che non sia autorizzato.', 'Le segnalazioni di sicurezza vanno a {security}. Il file di contatto leggibile dalle macchine (RFC 9116) si trova in /.well-known/security.txt e viene rinnovato a ogni pubblicazione.'] },
      { h: 'Come una modifica va in produzione', p: ['Ogni modifica passa da una suite di test automatici che copre accessibilità, contrasto dei colori, intestazioni di sicurezza, peso della pagina e pagine generate, più un controllo delle dipendenze che fallisce davanti a problemi di gravità alta e una scansione del codice alla ricerca di vulnerabilità. Un controllo fallisce se i file pubblicati differiscono da ciò che produce il codice sorgente.', 'Una modifica viene pubblicata prima su una copia di prova protetta da password. La pubblicazione in produzione è un passaggio manuale separato che richiede una conferma scritta e l’approvazione di un revisore, e la versione precedente resta disponibile come ripiego.'] },
      { h: 'La velocità è un requisito', p: ['Una prima visita ha un budget di 200 KB e 12 richieste, verificato dai test: una modifica che lo supera non viene pubblicata. «Come è andata questa pagina», nel piè di pagina della home, mostra quanto è costata la tua visita, misurato dal tuo browser.'] },
      { h: 'Monitoraggio', p: ['Ogni 30 minuti un controllo automatico verifica che il sito risponda, che le intestazioni di sicurezza siano presenti, che gli indirizzi vecchi e con www reindirizzino correttamente, che il certificato sia valido per almeno altre due settimane, che l’instradamento della posta funzioni e che il file di contatto per la sicurezza non sia scaduto. In caso di guasto parte un avviso.'] },
      { h: 'Open source', p: ['L’intero sito, test e processo di pubblicazione inclusi, è pubblico.'] }
    ],
    reportText: 'Hai trovato qualcosa che non va? Scrivi a {security}. Lo legge una persona.'
  }
};
