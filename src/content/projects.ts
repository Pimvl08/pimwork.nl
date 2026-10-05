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
  /** The hardest problem and how it was solved. */
  challenge: Bilingual<string>;
  stack: string[];
  links: ProjectLink[];
  /** Short status line, for example "Live en dagelijks in gebruik". */
  status: Bilingual<string>;
}

export const projects: Project[] = [
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
  },
  {
    slug: "strength-tracker",
    name: "Strength Tracker",
    featured: true,
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
    status: { nl: "Live en elke week in gebruik", en: "Live and used every week" },
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
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
