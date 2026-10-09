import type { Bilingual } from "@/i18n/config";

/**
 * Pim's projects, written for visitors who want to know what he can build:
 * the problem, what he made, what it delivers, and how it is built.
 * Facts come from the project folders on his disk (READMEs, docs, code).
 * Deliberately left out: dates, costs, internal numbers, client names,
 * keys and contact details. Edit the text here; components hold no content.
 */

export interface ProjectLink {
  label: Bilingual<string>;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Shown first on the home page and at the top of the work page. */
  featured: boolean;
  /** What kind of thing it is, in a few words. */
  kind: Bilingual<string>;
  /** One sentence for cards and lists. */
  tagline: Bilingual<string>;
  /** Who it is for. */
  audience: Bilingual<string>;
  problem: Bilingual<string>;
  /** What Pim built. */
  solution: Bilingual<string>;
  /** What it delivers for the people who use it. */
  benefits: Bilingual<string[]>;
  /** How it is built, readable for non-developers. */
  craft: Bilingual<string[]>;
  /** The hardest problem and how it was solved. Empty hides the section. */
  challenge: Bilingual<string>;
  stack: string[];
  links: ProjectLink[];
  /** Short status line, for example "Live en dagelijks in gebruik". */
  status: Bilingual<string>;
  /** Page title (before " | PimWork") and meta description for search engines. */
  seo: { title: Bilingual<string>; description: Bilingual<string> };
  /** The service this project shows, with one sentence on who it is useful for. */
  service?: { slug: string; blurb: Bilingual<string> };
  /** "lab" projects live under /[lang]/lab instead of the work pages. */
  section?: "work" | "lab";
}

export const projects: Project[] = [
  {
    slug: "exact-online",
    name: "ExactTool",
    featured: true,
    kind: { nl: "Automatisering voor Exact Online", en: "Automation for Exact Online" },
    tagline: {
      nl: "Zoekt bedrijven en contactgegevens op en zet ze automatisch als verkoopkans in Exact Online, klaar om te bellen.",
      en: "Looks up companies and contact details and puts them into Exact Online as sales opportunities automatically, ready to call.",
    },
    audience: {
      nl: "Een belteam dat koude acquisitie doet en zijn verkoopkansen in Exact Online bijhoudt. De klantgegevens zijn hier geanonimiseerd.",
      en: "A calling team that does cold outreach and keeps its sales opportunities in Exact Online. The client details are anonymised here.",
    },
    problem: {
      nl: "Bij koud bellen gaat een groot deel van de dag niet op aan bellen, maar aan voorbereiden: uitzoeken welk bedrijf je belt, wie de juiste persoon is, en dat daarna met de hand in het CRM typen. Dat is werk dat een computer sneller en consistenter doet.",
      en: "In cold calling, a large part of the day does not go to calling but to preparing: finding out which company to call, who the right person is, and then typing it all into the CRM by hand. That is work a computer does faster and more consistently.",
    },
    solution: {
      nl: "ExactTool achterhaalt bedrijven, haalt hun gegevens en contactpersonen op uit openbare bronnen en zet ze als verkoopkans in Exact Online, het systeem waarin het team al werkt. Niemand hoeft een nieuw programma te leren: de lijst staat klaar op de plek waar ze al werken.",
      en: "ExactTool finds companies, collects their details and contact persons from public sources and puts them into Exact Online as sales opportunities, the system the team already works in. Nobody has to learn a new program: the list is ready where they already work.",
    },
    benefits: {
      nl: [
        "Geen bedrijfsgegevens meer met de hand overtypen in Exact Online.",
        "Het team begint met een lijst die klaarstaat, in plaats van met zoekwerk.",
        "Meer tijd voor de gesprekken zelf.",
        "Het werkt in het systeem dat het team al gebruikt.",
      ],
      en: [
        "No more typing company details into Exact Online by hand.",
        "The team starts with a list that is ready, instead of with searching.",
        "More time for the calls themselves.",
        "It works inside the system the team already uses.",
      ],
    },
    craft: {
      nl: [
        "De tool werkt in Exact Online via de browser, op dezelfde manier als een medewerker dat zou doen.",
        "Het draait als gewone app op de Mac, met een eigen browser erbij, zodat er niets apart geïnstalleerd hoeft te worden.",
      ],
      en: [
        "The tool works in Exact Online through the browser, the same way an employee would.",
        "It runs as a regular app on the Mac, with its own browser included, so nothing needs to be installed separately.",
      ],
    },
    challenge: { nl: "", en: "" },
    stack: ["Python", "Playwright", "Flask", "PyInstaller", "Exact Online"],
    links: [],
    status: { nl: "Gebouwd voor een belteam", en: "Built for a calling team" },
    seo: {
      title: { nl: "ExactTool: verkoopkansen automatisch in Exact Online", en: "ExactTool: sales opportunities into Exact Online" },
      description: {
        nl: "ExactTool zoekt bedrijven en contactpersonen op uit openbare bronnen en zet ze automatisch als verkoopkans in Exact Online, klaar om te bellen.",
        en: "ExactTool looks up companies and contact persons from public sources and puts them into Exact Online as sales opportunities automatically, ready to call.",
      },
    },
    service: {
      slug: "exact-online-koppeling",
      blurb: {
        nl: "Handig voor elk bedrijf dat in Exact Online werkt en gegevens nu met de hand invoert.",
        en: "Useful for any business that works in Exact Online and still enters data by hand.",
      },
    },
  },
  {
    slug: "teamsync",
    name: "TeamSync",
    featured: true,
    kind: { nl: "Desktopapp voor Mac en Windows", en: "Desktop app for Mac and Windows" },
    tagline: {
      nl: "Eén gedeelde map voor een heel team, zonder dat iemand ooit het werk van een ander overschrijft.",
      en: "One shared folder for a whole team, without anyone ever overwriting someone else's work.",
    },
    audience: {
      nl: "Een klein team met zowel Macs als Windows-laptops dat aan dezelfde bestanden werkt.",
      en: "A small team on both Macs and Windows laptops that works on the same files.",
    },
    problem: {
      nl: "Bestanden heen en weer sturen gaat altijd een keer mis: iemand werkt in een oude versie en een ander verliest zijn werk. Echt samen bewerken via Microsoft 365 vraagt een licentie per persoon en een beheerder die toestemming geeft, en die heeft een klein team meestal niet.",
      en: "Sending files back and forth always goes wrong at some point: someone works in an old version and someone else loses their work. Real co-editing through Microsoft 365 needs a licence per person and an administrator who signs off, which a small team usually does not have.",
    },
    solution: {
      nl: "Ik bouwde een desktopapp waarin de cloud de bron van waarheid is en elke laptop een eigen kopie heeft. Een eigen sync-engine vergelijkt per bestand de lokale versie, de laatst gedeelde versie en de versie in de cloud, en kiest daaruit precies één actie. Botsen twee wijzigingen, dan blijven ze allebei bewaard. Het team ziet wie een document open heeft en kan ook tegelijk in hetzelfde document schrijven.",
      en: "I built a desktop app where the cloud is the source of truth and every laptop keeps its own copy. A custom sync engine compares, per file, the local version, the last shared version and the cloud version, and picks exactly one action. When two changes collide, both are kept. The team sees who has a document open and can also write in the same document at the same time.",
    },
    benefits: {
      nl: [
        "Nooit meer overschreven werk: bij een botsing blijven beide versies bewaard.",
        "Versiegeschiedenis per bestand, een oude versie terugzetten kan altijd.",
        "Je ziet wie een Word-document open heeft voordat je eraan begint.",
        "Samen tegelijk schrijven en het resultaat weer als Word-bestand opslaan.",
        "Werkt op Mac en Windows en werkt zichzelf automatisch bij.",
      ],
      en: [
        "No more overwritten work: on a collision both versions are kept.",
        "Version history per file, an older version can always be restored.",
        "You see who has a Word document open before you start on it.",
        "Write together at the same time and save the result as a Word file again.",
        "Runs on Mac and Windows and updates itself automatically.",
      ],
    },
    craft: {
      nl: [
        "Sync-engine in Rust waarvan de beslisregels los te testen zijn: elke situatie heeft een eigen test.",
        "Toegangsregels op databaseniveau voor elke tabel en voor de opslag, met tests die ze controleren.",
        "Integratietests die twee laptops nabootsen, inclusief offline werken, hernoemen en conflicten.",
      ],
      en: [
        "A Rust sync engine whose decision rules can be tested on their own: every situation has its own test.",
        "Access rules at database level for every table and for storage, with tests that check them.",
        "Integration tests that simulate two laptops, including offline work, renames and conflicts.",
      ],
    },
    challenge: {
      nl: "Wijzigingen in Word gingen soms stil verloren: zolang Word een document open had, leek het bestand onveranderd en werd het nooit geüpload. Ik heb geopende documenten anders leren behandelen en een test geschreven die openen, bewerken, opslaan en sluiten precies nabootst, zodat dit niet terug kan komen.",
      en: "Edits in Word were sometimes silently lost: while Word had a document open, the file looked unchanged and was never uploaded. I taught the app to treat open documents differently and wrote a test that replays opening, editing, saving and closing exactly, so it cannot come back.",
    },
    stack: ["Tauri 2", "Rust", "React", "TypeScript", "Supabase", "Yjs"],
    links: [],
    status: { nl: "Opgeleverd", en: "Delivered" },
    seo: {
      title: { nl: "TeamSync: bestanden delen op Mac en Windows", en: "TeamSync: file sharing on Mac and Windows" },
      description: {
        nl: "Een desktopapp voor Mac en Windows waarmee een klein team bestanden deelt. Bij een botsing blijven beide versies bewaard, dus niemand raakt werk kwijt.",
        en: "A desktop app for Mac and Windows that lets a small team share files. When changes collide, both versions are kept, so nobody loses work.",
      },
    },
    service: {
      slug: "software-op-maat",
      blurb: {
        nl: "Handig voor kleine teams die samen aan bestanden werken, op Mac en Windows door elkaar.",
        en: "Useful for small teams working on the same files, on a mix of Macs and Windows laptops.",
      },
    },
  },
  {
    slug: "offerte-pdf-generator",
    name: "OfferteVlot",
    featured: true,
    kind: { nl: "Web-app voor aannemers", en: "Web app for contractors" },
    tagline: {
      nl: "Een nette offerte als PDF in een paar minuten, met je eigen logo en de btw goed uitgerekend.",
      en: "A clean quote as a PDF in a few minutes, with your own logo and the VAT calculated correctly.",
    },
    audience: {
      nl: "Aannemers en dakdekkers die na een bezoek of telefoontje snel een offerte willen sturen.",
      en: "Contractors and roofers who want to send a quote quickly after a visit or a phone call.",
    },
    problem: {
      nl: "Na een inspectie of telefoongesprek wil je meteen een nette offerte sturen, met je eigen logo en een correcte btw-berekening. Zonder eerst een account aan te maken of software te installeren.",
      en: "After an inspection or a phone call you want to send a clean quote straight away, with your own logo and a correct VAT calculation. Without creating an account or installing software first.",
    },
    solution: {
      nl: "OfferteVlot draait volledig in de browser. Je vult je bedrijfsgegevens, de klant en de offerteregels in en ziet ondertussen precies hoe de PDF eruit komt te zien. Geen account en geen server: het is één los bestand dat je gewoon opent, en je gegevens blijven op je eigen toestel.",
      en: "OfferteVlot runs entirely in the browser. You enter your company details, the customer and the line items, and meanwhile you see exactly what the PDF will look like. No account and no server: it is a single file you simply open, and your data stays on your own device.",
    },
    benefits: {
      nl: [
        "Een offerte klaar in een paar minuten.",
        "Eigen logo en gegevens op een scherpe A4-PDF.",
        "Btw en kortingen automatisch goed berekend.",
        "Direct versturen via WhatsApp met een nette begeleidende tekst.",
        "Oplopende offertenummers en een overzicht van eerdere offertes.",
      ],
      en: [
        "A quote ready in a few minutes.",
        "Your own logo and details on a sharp A4 PDF.",
        "VAT and discounts calculated correctly, automatically.",
        "Send it straight away via WhatsApp with a neat cover message.",
        "Sequential quote numbers and a list of earlier quotes.",
      ],
    },
    craft: {
      nl: [
        "Eigen PDF-opmaak met paginering en een tabelkop die op elke pagina terugkomt.",
        "Het live voorbeeld en de PDF gebruiken dezelfde rekenregels, dus ze kloppen altijd met elkaar.",
        "Elk logo, ook een SVG, wordt scherp in de PDF gezet.",
      ],
      en: [
        "Custom PDF layout with pagination and a table header that repeats on every page.",
        "The live preview and the PDF use the same calculation rules, so they always match.",
        "Every logo, SVG included, is placed sharply in the PDF.",
      ],
    },
    challenge: {
      nl: "Het totaal aantal pagina's is pas bekend als alles getekend is. De eerste versie liet daardoor een lege plek staan in de voettekst. Nu stempelt een laatste ronde 'Pagina X van Y' op elke pagina, en een tabel die over twee pagina's loopt krijgt vanzelf zijn kop terug.",
      en: "The total page count is only known once everything is drawn. The first version therefore left a gap in the footer. Now a final pass stamps 'Page X of Y' on every page, and a table that runs across two pages gets its header back automatically.",
    },
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "jsPDF"],
    links: [],
    status: { nl: "Klaar voor gebruik, zonder server", en: "Ready to use, no server needed" },
    seo: {
      title: { nl: "OfferteVlot: offertes maken voor aannemers", en: "OfferteVlot: quotes for contractors" },
      description: {
        nl: "Met OfferteVlot maakt een aannemer of vakman in een paar minuten een nette offerte als PDF, met eigen logo en de btw goed uitgerekend. Zonder account.",
        en: "OfferteVlot lets a contractor or tradesperson make a professional PDF quote in minutes, with their own logo and the VAT worked out. No account needed.",
      },
    },
    service: {
      slug: "offertesoftware",
      blurb: {
        nl: "Handig voor aannemers en vakmensen die zelf hun offertes maken.",
        en: "Useful for contractors and tradespeople who write their own quotes.",
      },
    },
  },
  {
    slug: "wordpress-koppeling",
    name: "WordPress-koppeling",
    featured: false,
    kind: { nl: "Koppeling tussen systemen", en: "Link between systems" },
    tagline: {
      nl: "Laat portalsites automatisch gegevens uitwisselen met WordPress. Hetzelfde werkt voor bijna alles wat je aan WordPress wilt hangen.",
      en: "Lets portal sites exchange data with WordPress automatically. The same works for almost anything you want to connect to WordPress.",
    },
    audience: {
      nl: "Bedrijven met een WordPress-site die gegevens uit andere systemen op hun site willen hebben, of andersom, zonder ze over te typen.",
      en: "Companies with a WordPress site who want data from other systems on their site, or the other way round, without retyping it.",
    },
    problem: {
      nl: "Systemen die niet met elkaar praten betekenen dubbel werk. Wat in het ene pakket staat, wordt met de hand in het andere gezet. Dat kost tijd, en bij elke keer overtypen kan er een fout insluipen.",
      en: "Systems that do not talk to each other mean double work. What is in one package gets copied into the other by hand. That takes time, and every bit of retyping is a chance for a mistake.",
    },
    solution: {
      nl: "Ik bouwde een systeem dat portalsites laat communiceren met WordPress, zodat gegevens vanzelf van het ene systeem naar het andere gaan. Portalsites zijn maar een voorbeeld: een CRM, een spreadsheet, een formulier, een webshop of een mailbox kun je op dezelfde manier aan WordPress koppelen. Zo ontstaan handige, snelle automatiseringen bovenop wat er al is.",
      en: "I built a system that lets portal sites communicate with WordPress, so data moves from one system to the other by itself. Portal sites are just one example: a CRM, a spreadsheet, a form, a web shop or a mailbox can be connected to WordPress the same way. That gives handy, fast automations on top of what is already there.",
    },
    benefits: {
      nl: [
        "Geen gegevens meer met de hand van systeem A naar systeem B zetten.",
        "Wat in het ene systeem verandert, staat snel ook in het andere.",
        "WordPress blijft werken zoals je gewend bent.",
        "Uit te breiden met andere systemen die je al gebruikt.",
      ],
      en: [
        "No more moving data from system A to system B by hand.",
        "What changes in one system soon shows up in the other.",
        "WordPress keeps working the way you are used to.",
        "Can be extended with other systems you already use.",
      ],
    },
    craft: {
      nl: [
        "Systemen praten met elkaar via hun koppelingen (API's), zodat er niemand tussen hoeft te zitten.",
        "De koppeling sluit aan op wat er al is: er hoeft geen nieuw systeem bij.",
      ],
      en: [
        "Systems talk to each other through their interfaces (APIs), so nobody has to sit in between.",
        "The link fits onto what is already there: no new system is needed.",
      ],
    },
    challenge: { nl: "", en: "" },
    stack: ["Python", "WordPress", "API-koppelingen"],
    links: [],
    status: { nl: "Gebouwd en werkend", en: "Built and working" },
    seo: {
      title: { nl: "WordPress-koppeling: WordPress aan andere systemen", en: "WordPress integration: connecting other systems" },
      description: {
        nl: "Een koppeling die portalsites automatisch gegevens laat uitwisselen met WordPress. Op dezelfde manier hang je een CRM, webshop of formulier aan je site.",
        en: "An integration that lets portal sites swap data with WordPress automatically. A CRM, web shop or form can be connected to your WordPress site the same way.",
      },
    },
    service: {
      slug: "systemen-koppelen",
      blurb: {
        nl: "Handig voor bedrijven met een WordPress-site die gegevens uit andere systemen nu overtypen.",
        en: "Useful for businesses with a WordPress site that now retype data from other systems.",
      },
    },
  },
  {
    slug: "strength-tracker",
    name: "Strength Tracker",
    featured: false,
    kind: { nl: "Installeerbare web-app", en: "Installable web app" },
    tagline: {
      nl: "Mijn eigen trainingsapp: workouts loggen op telefoon en laptop, ook zonder bereik, met elke week een concreet advies.",
      en: "My own training app: log workouts on phone and laptop, even without signal, with concrete advice every week.",
    },
    audience: {
      nl: "Mijn trainingspartner en ik. Ik gebruik hem nog elke week.",
      en: "My training partner and me. I still use it every week.",
    },
    problem: {
      nl: "Trainingsapps zijn vaak Engelstalig, werken slecht zonder internet of laten je niet met twee mensen tegelijk loggen. Ik wilde één app die op telefoon en laptop hetzelfde laat zien, in de sportschool zonder bereik gewoon werkt en na elke week zegt welk gewicht ik de volgende keer pak.",
      en: "Training apps are often English-only, work poorly without internet, or do not let two people log at the same time. I wanted one app that shows the same on phone and laptop, simply works in a gym without signal, and tells me after each week which weight to use next time.",
    },
    solution: {
      nl: "Strength Tracker is een web-app die je installeert als een gewone app. Je logt sets, gewichten en herhalingen, alleen of samen met je trainingspartner. Alles staat eerst op je eigen toestel en gaat daarna vanzelf naar je andere apparaten. Er zit een bibliotheek van ruim honderd oefeningen in, een 3D-figuur die laat zien welke spieren je deze week trainde, en elke week een advies voor je volgende gewichten.",
      en: "Strength Tracker is a web app you install like a regular app. You log sets, weights and reps, alone or together with your training partner. Everything is stored on your own device first and then syncs to your other devices by itself. It includes a library of over a hundred exercises, a 3D figure that shows which muscles you trained this week, and weekly advice for your next weights.",
    },
    benefits: {
      nl: [
        "Werkt offline in de sportschool en synchroniseert zodra er weer bereik is.",
        "Samen trainen: meerdere profielen in één sessie.",
        "Elke week een concreet gewichtsadvies op basis van de week ervoor.",
        "Installeerbaar op telefoon en laptop, gewoon via de browser.",
      ],
      en: [
        "Works offline in the gym and syncs as soon as there is signal again.",
        "Train together: several profiles in one session.",
        "Concrete weight advice every week, based on the week before.",
        "Installable on phone and laptop, straight from the browser.",
      ],
    },
    craft: {
      nl: [
        "Gegevens eerst lokaal, daarna realtime gesynchroniseerd tussen apparaten.",
        "Een eigen service worker, zodat de app ook zonder internet opent.",
        "In tien stappen omgebouwd tot een snelle app die alleen laadt wat je nodig hebt, met 110 automatische tests.",
      ],
      en: [
        "Data stored locally first, then synced in real time between devices.",
        "A custom service worker, so the app also opens without internet.",
        "Rebuilt in ten steps into a fast app that only loads what you need, with 110 automated tests.",
      ],
    },
    challenge: {
      nl: "Op een nieuw apparaat bleef de app leeg, terwijl de gegevens wel binnenkwamen: het actieve profiel verwees naar een profiel dat alleen lokaal bestond. Nu kiest de app na het samenvoegen automatisch een geldig profiel, en laat een duidelijke melding zien als de synchronisatie ergens vastloopt.",
      en: "On a new device the app stayed empty while the data did arrive: the active profile pointed to a profile that only existed locally. Now the app picks a valid profile automatically after merging, and shows a clear message when syncing gets stuck somewhere.",
    },
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Supabase", "Three.js"],
    links: [
      { label: { nl: "Open de app", en: "Open the app" }, href: "https://strengttracker.netlify.app" },
      { label: { nl: "Broncode op GitHub", en: "Source on GitHub" }, href: "https://github.com/pimdaanbram-prog/strength-tracker" },
    ],
    status: { nl: "Live en in gebruik", en: "Live and in use" },
    seo: {
      title: { nl: "Strength Tracker: trainingsapp die offline werkt", en: "Strength Tracker: a training app that works offline" },
      description: {
        nl: "Mijn eigen trainingsapp: workouts loggen op telefoon en laptop, ook zonder bereik in de sportschool, met elke week een concreet advies voor je gewichten.",
        en: "My own training app: log workouts on phone and laptop, even without signal in the gym, with weekly advice on which weights to use next.",
      },
    },
    service: {
      slug: "software-op-maat",
      blurb: {
        nl: "Laat zien hoe ik een app bouw die op telefoon en laptop werkt, ook zonder internet.",
        en: "Shows how I build an app that works on phone and laptop, even without internet.",
      },
    },
  },
  {
    slug: "belhulp",
    name: "Belhulp",
    featured: false,
    kind: { nl: "Assistent voor belgesprekken op de Mac", en: "Call assistant for the Mac" },
    tagline: {
      nl: "Luistert mee tijdens verkoopgesprekken, schrijft live uit en vult het belformulier vanzelf in.",
      en: "Listens in on sales calls, transcribes live and fills in the call form by itself.",
    },
    audience: {
      nl: "Mezelf, bij de verkoopgesprekken die ik voor school voer.",
      en: "Myself, for the sales calls I make for school.",
    },
    problem: {
      nl: "Tijdens een verkoopgesprek moet je tegelijk luisteren, doorvragen en een formulier met vragen bijhouden. Achteraf overtypen kost tijd, en juist namen, telefoonnummers en afspraken raken dan kwijt of komen er verkeerd in.",
      en: "During a sales call you have to listen, ask follow-up questions and keep a form up to date, all at once. Typing it up afterwards takes time, and names, phone numbers and agreements get lost or end up wrong.",
    },
    solution: {
      nl: "Belhulp draait op mijn Mac. Mijn stem en die van de klant worden apart opgenomen en direct uitgeschreven. Uit het gesprek vult het de vragen van het belformulier in, bewaart elk gesprek in een overzicht en zet de antwoorden met een browserextensie in het systeem waarin ik werk.",
      en: "Belhulp runs on my Mac. My voice and the customer's are recorded separately and transcribed straight away. From the conversation it fills in the questions of the call form, keeps every call in an overview, and uses a browser extension to put the answers into the system I work in.",
    },
    benefits: {
      nl: [
        "Geen overtypen meer na een gesprek.",
        "Namen, nummers en afspraken komen er correct in.",
        "Elk gesprek staat netjes in één overzicht.",
        "Zonder toestemming van de klant wordt niets opgenomen of bewaard.",
      ],
      en: [
        "No more typing up after a call.",
        "Names, numbers and agreements end up correct.",
        "Every call is neatly kept in one overview.",
        "Without the customer's consent nothing is recorded or stored.",
      ],
    },
    craft: {
      nl: [
        "Snelle spraakherkenning op de Mac zelf voor het directe beeld, en een nauwkeuriger model dat elk stukje gesprek daarna corrigeert.",
        "Velden worden ingevuld via een vast schema met een 'onbekend'-optie, zodat er niets gegokt wordt.",
        "Elk gesprek gaat eerst naar een wachtrij, zodat er nooit een verloren gaat.",
      ],
      en: [
        "Fast speech recognition on the Mac itself for the live view, and a more accurate model that corrects every part of the call afterwards.",
        "Fields are filled through a fixed schema with an 'unknown' option, so nothing is guessed.",
        "Every call goes to a queue first, so none is ever lost.",
      ],
    },
    challenge: {
      nl: "Er vielen stukjes geluid weg zodra de spraakherkenning de processor opeiste, waardoor namen verminkt raakten. Ik heb het opnemen en het rekenwerk uit elkaar gehaald, zodat de opname nooit meer hoeft te wachten. Daarna viel er geen geluid meer weg.",
      en: "Bits of audio dropped out whenever speech recognition claimed the processor, which mangled names. I separated recording from processing, so the recording never has to wait. After that no audio was lost.",
    },
    stack: ["Python", "faster-whisper", "Gemini", "Flask", "Swift", "Chrome-extensie"],
    links: [],
    status: { nl: "In gebruik bij belgesprekken", en: "In use during calls" },
    seo: {
      title: { nl: "Belhulp: belgesprekken live uitschrijven", en: "Belhulp: transcribing sales calls live" },
      description: {
        nl: "Belhulp luistert mee tijdens verkoopgesprekken op de Mac, schrijft het gesprek live uit en vult het belformulier vanzelf in, met toestemming van de klant.",
        en: "Belhulp listens in on sales calls on the Mac, transcribes the conversation live and fills in the call form by itself. Nothing is recorded without consent.",
      },
    },
    service: {
      slug: "systemen-koppelen",
      blurb: {
        nl: "Handig voor wie veel belt en na elk gesprek notities en formulieren bijwerkt.",
        en: "Useful for anyone who makes a lot of calls and updates notes and forms after each one.",
      },
    },
  },
  {
    slug: "kdp-kleurboek",
    name: "Kleurboek",
    featured: false,
    kind: { nl: "Drukwerk: kleurboek voor Amazon", en: "Print: a coloring book for Amazon" },
    tagline: {
      nl: "Een drukklaar kleurboek van vijftig platen, met een eigen werkstroom die AI-tekeningen omzet naar strakke lijnen en elke plaat keurt.",
      en: "A print-ready coloring book of fifty plates, with an own workflow that turns AI drawings into clean lines and inspects every plate.",
    },
    audience: {
      nl: "Lezers die van rustige, gezellige kleurplaten houden, via Amazon en een Nederlandse editie.",
      en: "Readers who like calm, cozy coloring pages, via Amazon and a Dutch edition.",
    },
    problem: {
      nl: "Een kleurboek verkopen vraagt meer dan mooie plaatjes. AI-kleurboeken krijgen terecht kritiek op grijze pixels, dichte zwarte vlakken, piepkleine details en tekeningen die tegen de rand lopen, en Amazon stelt strenge eisen aan het binnenwerk en de omslag.",
      en: "Selling a coloring book takes more than nice pictures. AI coloring books are rightly criticised for grey pixels, solid black areas, tiny details and drawings that run into the page edge, and Amazon has strict rules for the interior and the cover.",
    },
    solution: {
      nl: "Ik bouwde een werkstroom die de tekeningen maakt, opschoont en omzet naar vectorlijnen op echte drukmaat. Elke plaat wordt automatisch gekeurd, en daarna worden het binnenwerk, de omslag en de verkoopbeelden opgebouwd, elk met een eigen controle voordat het naar de drukker gaat.",
      en: "I built a workflow that creates the drawings, cleans them up and turns them into vector lines at real print size. Every plate is inspected automatically, and then the interior, the cover and the sales images are built, each with its own check before it goes to the printer.",
    },
    benefits: {
      nl: [
        "Vijftig platen met dezelfde vijf figuren, steeds herkenbaar getekend.",
        "Geen grijze pixels en geen dichte vlakken: alles drukt als zuivere lijnen.",
        "Een Nederlandse editie uit dezelfde platen, zonder opnieuw te tekenen.",
      ],
      en: [
        "Fifty plates with the same five characters, recognisable every time.",
        "No grey pixels and no solid areas: everything prints as clean lines.",
        "A Dutch edition from the same plates, without drawing anything again.",
      ],
    },
    craft: {
      nl: [
        "Automatische keuring per plaat: lijndikte, te kleine vlakjes en vormen die nergens aan vastzitten.",
        "Een opschoonstap van ruwe afbeelding naar vectorlijnen op drukmaat.",
        "Eigen controles voor binnenwerk en omslag, getest met opzettelijk foute bestanden.",
      ],
      en: [
        "Automatic inspection per plate: line weight, regions that are too small and shapes that float free.",
        "A cleanup step from raw image to vector lines at print size.",
        "Own checks for interior and cover, tested with deliberately broken files.",
      ],
    },
    challenge: {
      nl: "De figuren moesten er op alle vijftig platen hetzelfde uitzien. Elke opdracht kreeg daarom een vast referentieblad mee, en ik heb de opdrachten bijgestuurd op fouten uit tests, zoals een egel zonder snuit of een kat zonder snorharen.",
      en: "The characters had to look the same on all fifty plates. Every request therefore came with a fixed reference sheet, and I adjusted the requests based on test failures, such as a hedgehog without a snout or a cat without whiskers.",
    },
    stack: ["Python", "OpenCV", "scikit-image", "potrace", "PyMuPDF", "OpenAI Image API"],
    links: [],
    status: { nl: "Drukklaar", en: "Ready for print" },
    seo: {
      title: { nl: "Kleurboek: drukklaar kleurboek met eigen keuring", en: "Coloring book: print-ready, every plate inspected" },
      description: {
        nl: "Een drukklaar kleurboek van vijftig platen, met een eigen werkstroom die AI-tekeningen omzet naar strakke lijnen en elke plaat automatisch keurt.",
        en: "A print-ready coloring book of fifty plates, with a custom workflow that turns AI drawings into clean lines and inspects every plate automatically.",
      },
    },
  },
  {
    slug: "solana-forensics",
    name: "Solana Forensics",
    featured: false,
    kind: { nl: "Onderzoekstool voor blockchaindata", en: "Research tool for blockchain data" },
    tagline: {
      nl: "Reconstrueert wat er echt gebeurde bij een memecoin-launch, alleen lezend en met een bewijsniveau per conclusie.",
      en: "Reconstructs what really happened in a meme-coin launch, read-only and with an evidence grade per conclusion.",
    },
    audience: {
      nl: "Onderzoek naar oplichting bij nieuwe tokens.",
      en: "Research into scams around new tokens.",
    },
    problem: {
      nl: "Na een oplichting met een nieuwe token wil je precies weten wat er gebeurde: wie hem maakte, wie verkocht en waar het geld daarna heen ging. Gewone overzichten raken in de war door omwegen via andere tokens en door nep-adressen, en leveren conclusies op die overtuigend lijken maar niet kloppen.",
      en: "After a scam with a new token you want to know exactly what happened: who created it, who sold and where the money went next. Ordinary overviews get confused by detours through other tokens and by fake addresses, and produce conclusions that look convincing but are wrong.",
    },
    solution: {
      nl: "Ik bouwde een commandoregeltool die transacties, wallets en complete launches analyseert en de resultaten op een lokaal dashboard laat zien. Groepen wallets die samenwerken krijgen een bewijsniveau dat in de code vastligt. De tool heeft geen sleutel, ondertekent niets en handelt nooit.",
      en: "I built a command-line tool that analyses transactions, wallets and complete launches and shows the results on a local dashboard. Groups of wallets that work together get an evidence grade that is fixed in code. The tool holds no key, signs nothing and never trades.",
    },
    benefits: {
      nl: [
        "Een tijdlijn van aanmaken tot verkopen, met het bewijs bij elke stap.",
        "Groepen samenwerkende wallets, elk met een eerlijk bewijsniveau.",
        "Alleen lezen: geen sleutels, geen handtekeningen, geen handel.",
      ],
      en: [
        "A timeline from creation to sale, with the evidence at every step.",
        "Groups of cooperating wallets, each with an honest evidence grade.",
        "Read-only: no keys, no signatures, no trading.",
      ],
    },
    craft: {
      nl: [
        "Trades worden rechtstreeks afgeleid uit de handelspool zelf, zodat omwegen de prijs niet vertekenen.",
        "Herkent pools aan het programma dat ze beheert, voor meerdere handelsplatformen tegelijk.",
        "Geen enkele externe dependency: alleen wat Node.js zelf meelevert.",
      ],
      en: [
        "Trades are derived directly from the trading pool itself, so detours cannot distort the price.",
        "Recognises pools by the program that manages them, for several trading platforms at once.",
        "Not a single external dependency: only what Node.js ships with.",
      ],
    },
    challenge: {
      nl: "Nep-adressen die bijna hetzelfde lijken als echte (address poisoning) bliezen groepen wallets kunstmatig op. Die relaties krijgen nu het laagste bewijsniveau of worden helemaal uitgesloten, zodat een conclusie nooit op zo'n truc rust.",
      en: "Fake addresses that look almost identical to real ones (address poisoning) inflated groups of wallets artificially. Those relationships now get the lowest evidence grade or are excluded entirely, so a conclusion never rests on such a trick.",
    },
    stack: ["Node.js", "Solana RPC", "WebSocket", "SVG"],
    links: [],
    status: { nl: "Werkende onderzoekstool", en: "Working research tool" },
    seo: {
      title: { nl: "Solana Forensics: onderzoek naar memecoin-launches", en: "Solana Forensics: researching meme-coin launches" },
      description: {
        nl: "Een onderzoekstool die reconstrueert wat er echt gebeurde bij een memecoin-launch op Solana, alleen lezend en met een bewijsniveau per conclusie.",
        en: "A research tool that reconstructs what really happened in a meme-coin launch on Solana, read-only and with an evidence grade for every conclusion.",
      },
    },
    section: "lab",
  },
];

/** The projects on the work pages; "lab" projects are shown in the lab instead. */
export const workProjects = projects.filter((project) => project.section !== "lab");

/** Research and side projects, shown under the lab experiments. */
export const labProjects = projects.filter((project) => project.section === "lab");

export const featuredProjects = workProjects.filter((project) => project.featured);

/** Where a project's own page lives: /nl/werk/teamsync or /nl/lab/solana-forensics. */
export function projectHref(lang: string, project: Pick<Project, "slug" | "section">): string {
  return `/${lang}/${project.section === "lab" ? "lab" : "werk"}/${project.slug}`;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
