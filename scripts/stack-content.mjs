// Text of the "How this site is built" page, in the three site languages. Build-time only.
// Each section is a short decision record: the constraint, the choice and what the choice costs.
export const STACK = {
  en: {
    path: 'stack/',
    linkLabel: 'How this site is built',
    title: 'How this site is built',
    description: 'The decisions behind this site: what was chosen, why, and what each choice costs.',
    intro: 'Each section is a decision: what I needed, what I chose, and what that choice costs. The costs matter more than the choices.',
    flowTitle: 'What happens when you open a page',
    flow: [
      'Your browser asks the nearest Cloudflare location. While it prepares the answer, it already tells your browser which files to fetch first (an early hint).',
      'The page arrives as finished HTML with the security headers attached. There is no application server behind it.',
      'The stylesheet, script and fonts come from the same place. Their names carry a fingerprint of their content, so your browser can keep them for a year.',
      'In browsers that support it, resting your pointer on a link prepares the next page in the background, so it opens instantly.'
    ],
    sections: [
      { h: 'No framework', p: ['A page about one person should open at once, even on a poor connection. So the site is plain HTML, one stylesheet and one script that stays under 30 KB compressed, and the pages are built in advance: the same code that would draw the page in your browser draws it at build time, so you receive finished HTML.', 'The cost is a small build script that I maintain myself instead of leaning on a framework’s conventions.'] },
      { h: 'Static files and no server code', p: ['With no database and no application server there is nothing to patch in the request path. The contact form opens your mail program with a prepared draft rather than posting to a service I would have to defend.', 'The cost is that the site cannot store anything for me, such as messages.'] },
      { h: 'Cloudflare for production, with a fallback', p: ['Cloudflare Pages lets me send real security headers and keep fingerprinted files for a year; the free static hosting I started on cannot set headers at all.', 'The cost is one more vendor and a secret to protect. The earlier hosting stays ready as a fallback, so going back takes minutes.'] },
      { h: 'A strict Content Security Policy', p: ['Scripts may only come from this site, plus Google’s analytics once you accept. That rules out whole classes of attack.', 'The cost is that convenient shortcuts such as inline scripts are not allowed, so every behaviour lives in a file the policy can name.'] },
      { h: 'Analytics only after consent', p: ['Knowing how the site is used is useful; tracking people without asking is not. Analytics stays off until you accept.', 'The cost is that my numbers undercount, and I accept that.'] },
      { h: 'Speed as a tested requirement', p: ['A budget written in a document is forgotten; a budget in the test suite stops the release. A first visit may use 200 KB and 12 requests in the test browser, and a change that goes over does not ship.', 'The cost is that some things, such as large images or extra fonts, have to be justified before they are added.'] },
      { h: 'Two gates before production', p: ['Every change is published to a password-protected copy first. Production needs a separate manual step with a typed confirmation and a reviewer’s approval.', 'The cost is speed: publishing is slower than releasing on every merge, deliberately.'] },
      { h: 'Tests for what visitors feel', p: ['The suite checks accessibility, colour contrast, security headers, the three languages, the printed page, the transitions and the performance budget, in desktop and phone layouts.', 'The cost is a few minutes of waiting, kept low by running the test groups in parallel.'] }
    ],
    related: [['trust', 'Trust and security'], ['changelog', 'Engineering log']],
    home: 'Back to the home page'
  },
  es: {
    path: 'es/stack/',
    linkLabel: 'Cómo está construido este sitio',
    title: 'Cómo está construido este sitio',
    description: 'Las decisiones detrás de este sitio: qué se eligió, por qué y qué cuesta cada elección.',
    intro: 'Cada apartado es una decisión: qué necesitaba, qué elegí y qué cuesta esa elección. Los costes importan más que las elecciones.',
    flowTitle: 'Qué ocurre cuando abres una página',
    flow: [
      'Tu navegador pregunta a la ubicación de Cloudflare más cercana. Mientras prepara la respuesta, ya le indica qué archivos debe pedir primero (una pista temprana).',
      'La página llega como HTML terminado, con las cabeceras de seguridad. Detrás no hay ningún servidor de aplicaciones.',
      'La hoja de estilo, el script y las fuentes salen del mismo sitio. Sus nombres llevan una huella de su contenido, así que tu navegador puede guardarlos un año.',
      'En los navegadores que lo permiten, al apoyar el puntero sobre un enlace se prepara en segundo plano la página siguiente, y se abre al instante.'
    ],
    sections: [
      { h: 'Sin framework', p: ['Una página sobre una sola persona debe abrirse al momento, incluso con mala conexión. Por eso el sitio es HTML sencillo, una hoja de estilo y un script que se mantiene por debajo de 30 KB comprimido, y las páginas se construyen de antemano: el mismo código que dibujaría la página en tu navegador la dibuja al compilar, y tú recibes HTML terminado.', 'El coste es un pequeño script de compilación que mantengo yo mismo en lugar de apoyarme en las convenciones de un framework.'] },
      { h: 'Archivos estáticos y sin código de servidor', p: ['Sin base de datos ni servidor de aplicaciones, no hay nada que parchear en el camino de la petición. El formulario de contacto abre tu programa de correo con un borrador preparado en lugar de enviar los datos a un servicio que yo tendría que defender.', 'El coste es que el sitio no puede guardar nada por mí, como los mensajes.'] },
      { h: 'Cloudflare para producción, con respaldo', p: ['Cloudflare Pages me permite enviar cabeceras de seguridad reales y conservar durante un año los archivos con huella; el alojamiento estático gratuito con el que empecé no puede fijar cabeceras.', 'El coste es un proveedor más y un secreto que proteger. El alojamiento anterior sigue preparado como respaldo, de modo que volver atrás lleva minutos.'] },
      { h: 'Una Content Security Policy estricta', p: ['Los scripts solo pueden venir de este sitio, más la analítica de Google cuando aceptas. Eso descarta clases enteras de ataques.', 'El coste es que no se permiten atajos cómodos como los scripts en línea, así que cada comportamiento vive en un archivo que la política puede nombrar.'] },
      { h: 'Analítica solo con consentimiento', p: ['Saber cómo se usa el sitio es útil; seguir a las personas sin preguntar, no. La analítica permanece apagada hasta que aceptas.', 'El coste es que mis cifras se quedan cortas, y lo acepto.'] },
      { h: 'La velocidad como requisito comprobado', p: ['Un presupuesto escrito en un documento se olvida; uno incluido en las pruebas detiene la publicación. Una primera visita puede usar 200 KB y 12 peticiones en el navegador de pruebas, y un cambio que lo supere no se publica.', 'El coste es que cosas como las imágenes grandes o las fuentes adicionales hay que justificarlas antes de añadirlas.'] },
      { h: 'Dos puertas antes de producción', p: ['Todo cambio se publica primero en una copia protegida con contraseña. Producción exige un paso manual aparte, con una confirmación escrita y la aprobación de un revisor.', 'El coste es la rapidez: publicar es más lento que lanzar con cada fusión, y es deliberado.'] },
      { h: 'Pruebas de lo que notan los visitantes', p: ['Las pruebas comprueban accesibilidad, contraste de color, cabeceras de seguridad, los tres idiomas, la página impresa, las transiciones y el presupuesto de rendimiento, en vista de escritorio y de móvil.', 'El coste es esperar unos minutos, que se reducen ejecutando los grupos de pruebas en paralelo.'] }
    ],
    related: [['trust', 'Confianza y seguridad'], ['changelog', 'Registro de ingeniería (en inglés)']],
    home: 'Volver a la página de inicio'
  },
  it: {
    path: 'it/stack/',
    linkLabel: 'Come è costruito questo sito',
    title: 'Come è costruito questo sito',
    description: 'Le decisioni dietro questo sito: che cosa è stato scelto, perché e quanto costa ogni scelta.',
    intro: 'Ogni sezione è una decisione: di che cosa avevo bisogno, che cosa ho scelto e quanto costa quella scelta. I costi contano più delle scelte.',
    flowTitle: 'Che cosa succede quando apri una pagina',
    flow: [
      'Il tuo browser interroga la sede Cloudflare più vicina. Mentre prepara la risposta, gli indica già quali file richiedere per primi (un suggerimento anticipato).',
      'La pagina arriva come HTML già pronto, con le intestazioni di sicurezza. Dietro non c’è alcun server applicativo.',
      'Il foglio di stile, lo script e i font arrivano dallo stesso posto. I loro nomi portano un’impronta del contenuto, quindi il browser può conservarli per un anno.',
      'Nei browser che lo supportano, appoggiare il puntatore su un link prepara in background la pagina successiva, che si apre all’istante.'
    ],
    sections: [
      { h: 'Nessun framework', p: ['Una pagina su una sola persona deve aprirsi subito, anche con una connessione scarsa. Per questo il sito è HTML semplice, un foglio di stile e uno script che resta sotto i 30 KB compressi, e le pagine sono costruite in anticipo: lo stesso codice che disegnerebbe la pagina nel tuo browser la disegna in fase di compilazione, e tu ricevi HTML già pronto.', 'Il costo è un piccolo script di compilazione che mantengo io, invece di appoggiarmi alle convenzioni di un framework.'] },
      { h: 'File statici e nessun codice sul server', p: ['Senza database né server applicativo non c’è nulla da aggiornare lungo il percorso della richiesta. Il modulo di contatto apre il tuo programma di posta con una bozza preparata, invece di inviare i dati a un servizio che dovrei difendere.', 'Il costo è che il sito non può conservare nulla per me, come i messaggi.'] },
      { h: 'Cloudflare per la produzione, con un ripiego', p: ['Cloudflare Pages mi permette di inviare intestazioni di sicurezza vere e di tenere per un anno i file con impronta; l’hosting statico gratuito da cui sono partito non può impostare intestazioni.', 'Il costo è un fornitore in più e un segreto da proteggere. Il vecchio hosting resta pronto come ripiego, quindi tornare indietro richiede pochi minuti.'] },
      { h: 'Una Content Security Policy rigorosa', p: ['Gli script possono arrivare solo da questo sito, più gli analytics di Google quando accetti. Questo esclude intere categorie di attacco.', 'Il costo è che scorciatoie comode come gli script inline non sono permesse, quindi ogni comportamento sta in un file che la policy può nominare.'] },
      { h: 'Analytics solo dopo il consenso', p: ['Sapere come viene usato il sito è utile; seguire le persone senza chiedere no. Gli analytics restano spenti finché non accetti.', 'Il costo è che i miei numeri sono sottostimati, e lo accetto.'] },
      { h: 'La velocità come requisito verificato', p: ['Un budget scritto in un documento si dimentica; un budget nei test ferma il rilascio. Una prima visita può usare 200 KB e 12 richieste nel browser di prova, e una modifica che lo supera non viene pubblicata.', 'Il costo è che cose come immagini grandi o font aggiuntivi vanno giustificate prima di essere aggiunte.'] },
      { h: 'Due cancelli prima della produzione', p: ['Ogni modifica viene pubblicata prima su una copia protetta da password. La produzione richiede un passaggio manuale separato, con una conferma scritta e l’approvazione di un revisore.', 'Il costo è la rapidità: pubblicare è più lento che rilasciare a ogni unione, ed è voluto.'] },
      { h: 'Test per ciò che i visitatori percepiscono', p: ['I test verificano accessibilità, contrasto dei colori, intestazioni di sicurezza, le tre lingue, la pagina stampata, le transizioni e il budget di prestazioni, nelle viste desktop e mobile.', 'Il costo è qualche minuto di attesa, ridotto eseguendo i gruppi di test in parallelo.'] }
    ],
    related: [['trust', 'Fiducia e sicurezza'], ['changelog', 'Registro di ingegneria (in inglese)']],
    home: 'Torna alla home page'
  }
};
