import type { Bilingual } from "@/i18n/config";

/**
 * Pim's own projects. Every sentence and number below comes from the project
 * folders on his disk (READMEs, docs, git history, measured results), collected
 * read-only on 2026-10-04. Client names, keys, contact details and pen names are
 * deliberately left out. Edit the text here; components never hold content.
 */

export type ProjectStatus = "live" | "local" | "delivered";

export interface Metric {
  label: Bilingual<string>;
  value: Bilingual<string>;
}

export interface ProjectLink {
  label: Bilingual<string>;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  status: ProjectStatus;
  /** ISO dates of the first and last evidence of work. */
  period: { from: string; to: string };
  category: Bilingual<string>;
  /** One sentence for cards and lists. */
  short: Bilingual<string>;
  summary: Bilingual<string>;
  problem: Bilingual<string>;
  highlights: Bilingual<string[]>;
  /** Engineering problems that cost real time, and how they were solved. */
  hardProblems: Bilingual<string[]>;
  metrics: Metric[];
  stack: string[];
  links: ProjectLink[];
}

export const statusLabel: Record<ProjectStatus, Bilingual<string>> = {
  live: { nl: "Live", en: "Live" },
  local: { nl: "Werkt lokaal", en: "Runs locally" },
  delivered: { nl: "Opgeleverd", en: "Delivered" },
};

export const projects: Project[] = [
  {
    slug: "teamsync",
    name: "TeamSync",
    status: "delivered",
    period: { from: "2026-09-07", to: "2026-09-12" },
    category: { nl: "Desktopapp, macOS en Windows", en: "Desktop app, macOS and Windows" },
    short: {
      nl: "Eén map voor het hele team, met een eigen sync-engine in Rust die nooit stilletjes werk overschrijft.",
      en: "One folder for the whole team, with a custom Rust sync engine that never silently overwrites anyone's work.",
    },
    summary: {
      nl: "TeamSync is een desktopapp (Tauri 2, React en Rust) waarin de cloud (Supabase) de bron van waarheid is en iedere laptop een lokale kopie heeft. Een eigen sync-engine in Rust vergelijkt per bestand de lokale inhoud, de laatst gesynchroniseerde basis en de cloudversie op SHA-256 en kiest daaruit precies een actie. Bij een botsing blijven beide versies bewaard en Office-lockbestanden laten het team zien wie een document open heeft. Sinds versie 0.3 kan het team ook tegelijk in een document schrijven (Yjs over Supabase Realtime), een bestaand Word-bestand daarnaar omzetten en het resultaat weer als .docx exporteren. Pim bouwde het in zes dagen, met Claude Code als gereedschap, van architectuurafweging tot ondertekende automatische updates.",
      en: "TeamSync is a desktop app (Tauri 2, React and Rust) where the cloud (Supabase) is the source of truth and every laptop keeps a local copy. A custom Rust sync engine compares, per file, the local content, the last synced base and the cloud version by SHA-256 and derives exactly one action from that. On a collision both versions are kept, and Office lock files show the team who has a document open. Since version 0.3 the team can also write in the same document at the same time (Yjs over Supabase Realtime), convert an existing Word file into such a document and export the result back to .docx. Pim built it in six days, using Claude Code as his tool, from the architecture trade-off to signed automatic updates.",
    },
    problem: {
      nl: "Een klein studententeam met gemengde laptops (Mac en Windows) moet met dezelfde projectbestanden werken. Bestanden rondsturen leidt tot overschreven werk en kwijtgeraakte versies. Echt samen bewerken via Microsoft 365 vraagt een licentie per teamlid en een Azure-registratie met toestemming van een beheerder, en die heeft een student meestal niet.",
      en: "A small student team on mixed laptops (Mac and Windows) has to work on the same project files. Passing files around leads to overwritten work and lost versions. Real co-editing through Microsoft 365 requires a licence per member plus an Azure app registration approved by an administrator, which students usually do not have.",
    },
    highlights: {
      nl: [
        "Eigen sync-engine in Rust: per bestand drie feiten (lokale hash, basis, cloudversie) leiden tot precies een actie. De beslislogica zit in een pure functie zonder invoer of uitvoer, zodat elke combinatie een eigen unittest heeft.",
        "Nooit stilzwijgend overschrijven: bij een conflict wordt de lokale versie een conflictkopie met naam en tijdstip, als nieuw bestand geupload, en komt de cloudversie op de oorspronkelijke naam. Een verwijdering wint nooit van nieuw werk.",
        "Office-lockbestanden (~$Verslag.docx) worden gebruikt als signaal: er wordt niets over een open document heen gezet en teamgenoten zien via presence wie het open heeft.",
        "Samen schrijven in realtime: Yjs-updates en cursors gaan over een Supabase Realtime-kanaal, en bij opslaan haalt de client eerst de bewaarde toestand op en voegt die samen, zodat een trage verbinding nooit andermans werk overschrijft.",
        "Word in en uit: een bestaand .docx wordt via HTML en ProseMirror-JSON rechtstreeks in een Yjs-document gezet zonder editor op het scherm, en exporteren levert een .docx met Word-kopstijlen, een inhoudsopgave die Word zelf bijwerkt en paginanummers.",
        "Integratietests draaien twee volledig gescheiden engines, elk met eigen map en index, tegen dezelfde Supabase: functioneel twee laptops, inclusief offline werk, conflicten, hernoemen en een bestand van 8 MB.",
      ],
      en: [
        "Custom sync engine in Rust: three facts per file (local hash, base, cloud version) lead to exactly one action. The decision logic is a pure function without I/O, so every combination has its own unit test.",
        "Never overwrite silently: on a conflict the local version becomes a named, timestamped conflict copy that is uploaded as a new file, while the cloud version lands under the original name. A delete never wins over new work.",
        "Office lock files (~$Report.docx) are used as a signal: nothing is written over an open document, and teammates see through presence who has it open.",
        "Real-time co-writing: Yjs updates and cursors travel over a Supabase Realtime channel, and on save the client first fetches the stored state and merges it, so a slow connection can never overwrite someone else's work.",
        "Word in and out: an existing .docx is converted through HTML and ProseMirror JSON straight into a Yjs document without an editor on screen, and export produces a .docx with Word heading styles, a table of contents Word updates itself, and page numbers.",
        "Integration tests run two fully separate engines, each with its own folder and index, against the same Supabase: functionally two laptops, covering offline work, conflicts, renames and an 8 MB file.",
      ],
    },
    hardProblems: {
      nl: [
        "Bewerkingen in Word gingen stil verloren: zolang Word een document open had, bewaarde de engine de nieuwe grootte en wijzigingstijd zonder opnieuw te hashen. Na het sluiten leek het bestand ongewijzigd en werd er nooit geupload. Opgelost door grootte en tijdstip niet bij te werken zolang het document open staat, met een regressietest die openen, bewerken, opslaan en sluiten nabootst.",
        "Postgres geeft EXECUTE op nieuwe functies standaard aan PUBLIC, waardoor 'revoke from anon' niets deed en alle SECURITY DEFINER-functies zonder inloggen aanroepbaar waren; een ervan gaf naam en e-mailadres van willekeurige gebruikers terug. Dichtgezet met een aparte migratie en pgTAP-tests.",
        "Bewuste keuze tegen het binair samenvoegen van .docx, .xlsx en .pptx: dat kan niet betrouwbaar. In plaats daarvan conflictkopieen en versies voor bestanden, en een aparte documentsoort op basis van Yjs voor wat het team echt samen schrijft. De afweging tussen vier architectuuropties is uitgeschreven.",
      ],
      en: [
        "Word edits were silently lost: while Word had a document open, the engine stored the new size and modification time without rehashing. After closing, the file looked unchanged and was never uploaded. Fixed by not updating size and time while the document is open, plus a regression test that replays open, edit, save and close.",
        "Postgres grants EXECUTE on new functions to PUBLIC by default, so 'revoke from anon' had no effect and every SECURITY DEFINER function was callable without logging in; one of them returned the name and e-mail address of arbitrary users. Closed with a dedicated migration and pgTAP tests.",
        "A deliberate decision against binary merging of .docx, .xlsx and .pptx, because it cannot be done reliably. Instead: conflict copies and versions for files, and a separate Yjs-based document type for what the team actually writes together. The trade-off between four architecture options is written down.",
      ],
    },
    metrics: [
      { label: { nl: "Ontwikkeltijd", en: "Build time" }, value: { nl: "6 dagen", en: "6 days" } },
      { label: { nl: "Uitgebrachte versies", en: "Released versions" }, value: { nl: "6", en: "6" } },
      { label: { nl: "pgTAP-tests op rechten", en: "pgTAP permission tests" }, value: { nl: "42", en: "42" } },
      { label: { nl: "Rust-unittests", en: "Rust unit tests" }, value: { nl: "31", en: "31" } },
      { label: { nl: "Integratietests met twee engines", en: "Two-engine integration tests" }, value: { nl: "13", en: "13" } },
      { label: { nl: "Vitest-tests", en: "Vitest tests" }, value: { nl: "82", en: "82" } },
      { label: { nl: "Commits", en: "Commits" }, value: { nl: "45", en: "45" } },
    ],
    stack: ["Tauri 2", "Rust", "React 19", "TypeScript", "Supabase", "Yjs", "Tiptap", "SQLite", "GitHub Actions"],
    links: [
    ],
  },
  {
    slug: "strength-tracker",
    name: "Strength Tracker",
    status: "live",
    period: { from: "2026-03-22", to: "2026-07-28" },
    category: { nl: "Web-app (PWA)", en: "Web app (PWA)" },
    short: {
      nl: "Krachttraining loggen op telefoon en laptop, offline in de sportschool en elke week een concreet advies.",
      en: "Strength training logged on phone and laptop, offline in the gym, with concrete advice every week.",
    },
    summary: {
      nl: "Strength Tracker is een React 19 PWA waarmee je sets, gewichten en reps logt, solo of met meerdere profielen tegelijk (\"samen trainen\"). Data staat eerst lokaal op het apparaat en synchroniseert via Supabase (Auth, PostgreSQL met row level security en Realtime) naar andere apparaten. Daarnaast zijn er een bibliotheek van ruim 100 tweetalige oefeningen, een 3D-spierfiguur in Three.js, een regelgebaseerde weekfeedback, zeven rekentools (onder andere 1RM en sterkte-standaarden) en een eigen service worker voor offline gebruik. In versie 2 is de code in tien fasen omgebouwd naar een feature-first structuur met React Query, 110 unit tests, CI en een main bundle die van 103 kB naar 14 kB gzip ging.",
      en: "Strength Tracker is a React 19 PWA for logging sets, weights and reps, either solo or with several profiles in one session (\"train together\"). Data lives locally on the device first and syncs to other devices through Supabase (Auth, PostgreSQL with row level security, and Realtime). It also includes a library of 100+ bilingual exercises, a Three.js 3D muscle figure, rule-based weekly feedback, seven calculators (including 1RM and strength standards) and a custom service worker for offline use. Version 2 restructured the code in ten phases into a feature-first layout with React Query, 110 unit tests and CI, and cut the main bundle from 103 kB to 14 kB gzip.",
    },
    problem: {
      nl: "Trainingsapps zijn vaak Engelstalig, werken slecht offline of laten je niet met meerdere mensen tegelijk loggen. Pim wilde één app voor zichzelf en zijn trainingspartner die op telefoon en laptop dezelfde data toont, ook in de sportschool zonder bereik werkt en na elke week concreet zegt welk gewicht je volgende keer pakt.",
      en: "Training apps are often English-only, work poorly offline, or do not let several people log in one session. Pim wanted one app for himself and his training partner that shows the same data on phone and laptop, keeps working in a gym without signal, and tells you after each week which weight to use next time.",
    },
    highlights: {
      nl: [
        "Local-first sync: data staat in localStorage en Zustand, en wordt opgehaald uit Supabase bij het openen, als de app weer zichtbaar wordt en direct na inloggen. Een Realtime-kanaal per account verwerkt inserts, updates en deletes van profielen, sessies en plannen live op andere apparaten.",
        "Eigen service worker (v3): Supabase-verkeer wordt nooit gecachet, statische bestanden via stale-while-revalidate, en navigaties zijn network-first met de gecachte app-shell als fallback zodat diepe links zoals /workout offline blijven werken.",
        "Refactor in tien fasen naar v2.0: route-level code splitting voor 20 pagina's, aparte vendor-chunks, een virtuele lijst voor de oefeningen en zelf gehoste fonts. De main bundle ging van 103 kB naar 14 kB gzip; Three.js en Recharts laden alleen op de pagina's die ze nodig hebben.",
        "3D-spierfiguur in Three.js, opgebouwd uit bollen en capsules, die spiergroepen oplicht op basis van wat je deze week hebt getraind.",
        "Weekfeedback-engine die de huidige week met de vorige vergelijkt, per oefening de status bepaalt (verbeterd, gelijk, teruggang, nieuw) en een gewicht voor volgende week voorstelt met stappen van 2,5 kg of 1,25 kg.",
      ],
      en: [
        "Local-first sync: data lives in localStorage and Zustand and is pulled from Supabase on open, when the app becomes visible again and right after sign-in. A per-account Realtime channel applies inserts, updates and deletes of profiles, sessions and plans live on other devices.",
        "Custom service worker (v3): Supabase traffic is never cached, static files use stale-while-revalidate, and navigations are network-first with the cached app shell as fallback so deep links such as /workout keep working offline.",
        "Ten-phase refactor to v2.0: route-level code splitting for 20 pages, separate vendor chunks, a virtualized exercise list and self-hosted fonts. The main bundle went from 103 kB to 14 kB gzip; Three.js and Recharts only load on the pages that need them.",
        "Three.js 3D muscle figure built from sphere and capsule primitives that highlights muscle groups based on what you trained this week.",
        "Weekly feedback engine that compares the current week to the previous one, sets a status per exercise (improved, same, regression, new) and suggests next week's weight in steps of 2.5 kg or 1.25 kg.",
      ],
    },
    hardProblems: {
      nl: [
        "Op een nieuw apparaat bleef de app leeg terwijl de cloud-data wel binnenkwam: het actieve profiel verwees naar een lokaal profiel dat niet in Supabase bestond. Na het samenvoegen schakelt de app nu automatisch naar het eerste cloudprofiel als het actieve profiel ongeldig is.",
        "Het gratis Supabase-project pauzeert na inactiviteit, waardoor gebruikers een kale 'Failed to fetch' of 'Load failed' zagen. Netwerkfouten worden herkend aan een ontbrekende status en vertaald naar de melding dat de server opstart en je het zo opnieuw kunt proberen.",
        "Diepe links in de geïnstalleerde PWA werkten offline niet. De service worker behandelt navigaties nu network-first met de gecachte index.html als fallback.",
      ],
      en: [
        "On a new device the app stayed empty even though cloud data arrived: the active profile pointed to a local profile that did not exist in Supabase. After merging, the app now switches to the first cloud profile when the active one is invalid.",
        "The free Supabase project pauses after inactivity, so users saw a raw 'Failed to fetch' or 'Load failed'. Network failures are detected by a missing status and turned into a message that the server is waking up and to retry shortly.",
        "Deep links in the installed PWA failed offline. The service worker now handles navigations network-first with the cached index.html as fallback.",
      ],
    },
    metrics: [
      { label: { nl: "Main bundle (gzip)", en: "Main bundle (gzip)" }, value: { nl: "103 naar 14 kB", en: "103 to 14 kB" } },
      { label: { nl: "Unit tests", en: "Unit tests" }, value: { nl: "110", en: "110" } },
      { label: { nl: "Commits", en: "Commits" }, value: { nl: "54", en: "54" } },
      { label: { nl: "Oefeningen in de bibliotheek", en: "Exercises in the library" }, value: { nl: "101", en: "101" } },
      { label: { nl: "Lazy geladen pagina's", en: "Lazy-loaded pages" }, value: { nl: "20", en: "20" } },
    ],
    stack: ["React 19", "TypeScript", "Vite 8", "Tailwind CSS 4", "Supabase", "React Query", "Zustand", "Three.js", "Vitest", "Netlify"],
    links: [
      { label: { nl: "Live app", en: "Live app" }, href: "https://strengttracker.netlify.app" },
      { label: { nl: "Broncode op GitHub", en: "Source on GitHub" }, href: "https://github.com/pimdaanbram-prog/strength-tracker" },
    ],
  },
  {
    slug: "belhulp",
    name: "Belhulp",
    status: "local",
    period: { from: "2026-09-23", to: "2026-09-25" },
    category: { nl: "Lokale Mac-tool met browservenster", en: "Local Mac tool with a browser window" },
    short: {
      nl: "Luistert mee tijdens belgesprekken, schrijft live uit en vult het belformulier vanzelf in.",
      en: "Listens in on sales calls, transcribes live and fills in the call form by itself.",
    },
    summary: {
      nl: "Belhulp is een Python-programma dat Pim met Claude Code bouwde voor de belgesprekken die hij voor school voert. Zijn eigen stem komt binnen via de ingebouwde microfoon en de klant via een virtueel audioapparaat (BlackHole), waarna faster-whisper small lokaal direct uitschrijft en Gemini per venster van 45 seconden een nauwkeurigere versie levert die de voorlopige tekst vervangt. Uit het transcript vult Gemini de velden van het belformulier in, elk gesprek komt als rij in een Excel-bestand en een Chrome-uitbreiding zet de antwoorden in het webformulier van het belsysteem. Zonder vinkje voor toestemming van de klant wordt er niets uitgeschreven of bewaard, en geluid komt nooit op de schijf.",
      en: "Belhulp is a Python program Pim built with Claude Code for the sales calls he makes for school. His own voice comes in through the built-in microphone and the customer through a virtual audio device (BlackHole); faster-whisper small transcribes locally and instantly, and Gemini returns a more accurate version for every 45 second window that replaces the provisional text. Gemini then fills in the call form fields from the transcript, every call is saved as a row in an Excel file, and a Chrome extension copies the answers into the web form of the calling software. Without a consent checkbox for the customer nothing is transcribed or stored, and audio is never written to disk.",
    },
    problem: {
      nl: "Tijdens een verkoopgesprek moet je tegelijk luisteren, doorvragen en een formulier met een rij vragen bijhouden. Achteraf overtypen kost tijd, en juist details zoals namen, telefoonnummers en mailadressen raken dan kwijt of komen er verkeerd in.",
      en: "During a sales call you have to listen, ask follow-up questions and keep a form with a list of questions up to date, all at once. Typing it up afterwards takes time, and details like names, phone numbers and email addresses get lost or end up wrong.",
    },
    highlights: {
      nl: [
        "Hybride transcriptie: faster-whisper small (int8 op de CPU) zet meteen grijze voorlopige tekst in beeld, en Gemini schrijft het geluid van elk afgesloten venster van 45 seconden opnieuw uit en vervangt die tekst door een definitieve zwarte versie.",
        "Neemt beide kanten van het gesprek apart op: Pim via de ingebouwde microfoon, de klant via BlackHole. Een eigen Swift-programma maakt met CoreAudio een gecombineerd uitgangsapparaat (koptelefoon plus BlackHole met driftcorrectie) en Belhulp zet de geluidsuitgang bij de start van een gesprek automatisch om en daarna weer terug.",
        "Velden worden ingevuld met een JSON-schema voor Gemini: keuzevelden worden een enum met een vaste uitweg 'Onbekend' zodat het model niet gaat gokken, en een veld dat Pim zelf aanpast wordt vergrendeld en alleen nog als achtergrond meegestuurd.",
        "Opslaan dat niets kan verliezen: elk gesprek gaat eerst als JSON-bestand in een wachtrij en pas daarna naar Excel. Staat het Excel-bestand open, dan blijft het in de wachtrij en probeert Belhulp het elke 20 seconden opnieuw.",
        "Privacy ingebouwd: een toestemmingsvenster met vinkje voor elk gesprek (AVG), zonder vinkje wordt er niets uitgeschreven of opgeslagen, en het geluid voor Gemini wordt als WAV in het geheugen gemaakt en nooit naar schijf geschreven.",
      ],
      en: [
        "Hybrid transcription: faster-whisper small (int8 on the CPU) shows provisional grey text right away, and Gemini re-transcribes the audio of each closed 45 second window and replaces that text with a final black version.",
        "Records both sides of the call separately: Pim through the built-in microphone, the customer through BlackHole. A small Swift program uses CoreAudio to create a multi-output device (headphones plus BlackHole with drift compensation), and Belhulp switches the sound output automatically when a call starts and back when it ends.",
        "Fields are filled through a JSON response schema for Gemini: choice fields become an enum with a forced 'Unknown' option so the model does not guess, and any field Pim edits himself is locked and only sent along as context.",
        "Saving that cannot lose a call: every call is first written as a JSON file to a queue folder and only then to Excel. If the workbook is open, it stays queued and Belhulp retries every 20 seconds.",
        "Privacy built in: a consent dialog with a checkbox before every call (GDPR); without it nothing is transcribed or stored, and the audio sent to Gemini is built as a WAV in memory and never written to disk.",
      ],
    },
    hardProblems: {
      nl: [
        "Wegvallend geluid sloopte de transcriptie: stemdetectie en omzetten naar 16 kHz draaiden in de geluids-callback, en zodra Whisper de processor opeiste vielen er stukjes weg en werden namen verminkt. Oplossing: de callback kopieert alleen nog naar een wachtrij, al het rekenwerk gebeurt in een eigen draad met blokken van 100 ms en hoge latency, en Whisper krijgt het aantal fysieke kernen min een.",
        "Snelheid tegenover nauwkeurigheid op een Intel-laptop uit 2017: Whisper small haalde 1,1x realtime met 9,6% woordfouten, large-v3-turbo 2,5% fouten maar slechts 0,20x realtime, en Gemini 3,4%. De gekozen oplossing is hybride: lokaal small voor het directe beeld en Gemini die per venster van 45 seconden de tekst vervangt.",
        "Whisper verzint tekst bij stilte: hij gaf de woordenlijst uit de prompt letterlijk terug of herhaalde een woord eindeloos. Opgelost met filters op no_speech_prob, avg_logprob en compression_ratio, detectie van prompt-echo en herhalingen, een lijst bekende verzinsels en een volumedrempel zodat kamergeluid Whisper niet eens bereikt.",
      ],
      en: [
        "Dropped audio was ruining the transcription: voice detection and resampling to 16 kHz ran inside the audio callback, and whenever Whisper claimed the CPU, chunks went missing and names came out mangled. Fix: the callback now only copies data into a queue, all processing runs in its own thread with 100 ms blocks and high latency, and Whisper gets the number of physical cores minus one.",
        "Speed versus accuracy on a 2017 Intel laptop: Whisper small ran at 1.1x realtime with a 9.6% word error rate, large-v3-turbo reached 2.5% but only 0.20x realtime, and Gemini scored 3.4%. The chosen design is hybrid: local small for instant feedback and Gemini replacing the text per 45 second window.",
        "Whisper hallucinates during silence: it echoed the prompt's term list word for word or repeated a single word over and over. Solved with filters on no_speech_prob, avg_logprob and compression_ratio, prompt-echo and repetition detection, a list of known hallucinations, and a volume threshold so room noise never reaches Whisper.",
      ],
    },
    metrics: [
      { label: { nl: "Woordfouten, Whisper small met vakwoordenlijst", en: "Word error rate, Whisper small with term list" }, value: { nl: "9,6%", en: "9.6%" } },
      { label: { nl: "Woordfouten, zonder vakwoordenlijst", en: "Word error rate, without term list" }, value: { nl: "17,8%", en: "17.8%" } },
      { label: { nl: "Woordfouten, Whisper large-v3-turbo (0,20x realtime)", en: "Word error rate, Whisper large-v3-turbo (0.20x realtime)" }, value: { nl: "2,5%", en: "2.5%" } },
      { label: { nl: "Woordfouten, Gemini op het geluid", en: "Word error rate, Gemini on the audio" }, value: { nl: "3,4%", en: "3.4%" } },
      { label: { nl: "Correctievenster", en: "Correction window" }, value: { nl: "45 s", en: "45 s" } },
      { label: { nl: "Gemini-modellen in de terugvalketen", en: "Gemini models in the fallback chain" }, value: { nl: "6", en: "6" } },
    ],
    stack: ["Python", "faster-whisper", "Gemini API", "Flask (SSE)", "Swift + CoreAudio", "BlackHole", "Chrome-extensie (MV3)", "openpyxl"],
    links: [
    ],
  },
  {
    slug: "capcraft",
    name: "CapCraft",
    status: "local",
    period: { from: "2026-08-22", to: "2026-08-22" },
    category: { nl: "Webshop-front-end", en: "Storefront front-end" },
    short: {
      nl: "De winkel voor Pims eigen pettenmerk: snel op een telefoon, toegankelijk en klaar voor een echte backend.",
      en: "The shop for Pim's own cap brand: fast on a phone, accessible and ready for a real backend.",
    },
    summary: {
      nl: "CapCraft is een Nederlandstalige webshop-front-end met zeven routes: homepage, productoverzicht met filters, productpagina, over ons, contact, winkelwagen en een 404. De catalogus bevat veertien modellen in zes categorieën, en alle teksten en gegevens staan los van de componenten in twee databestanden. Er is nog geen backend: een mock-API met bewuste vertraging maakt laad-, lege en foutstaten echt bereikbaar, en kan later worden vervangen zonder de hooks aan te passen. Pim bouwde het met Claude Code als gereedschap en stuurde op meetbare resultaten: toegankelijkheid, best practices en SEO scoren 100 op alle routes.",
      en: "CapCraft is a Dutch-language storefront front-end with seven routes: home, a filterable product listing, product detail, about, contact, cart and a 404 page. The catalogue holds fourteen models across six categories, and all copy and data live in two data files, separate from the components. There is no backend yet: a mock API with deliberate latency makes loading, empty and error states reachable, and it can be swapped for a real API without touching the hooks. Pim built it with Claude Code as his tool and steered on measurable results: accessibility, best practices and SEO score 100 on every route.",
    },
    problem: {
      nl: "Een klein pettenmerk wil online laten zien waarom zijn petten anders zijn (zwaar katoen, extra stiksels, veel prototypes) zonder te doen alsof er een groot atelier achter zit. De winkel moet snel laden op een telefoon, toegankelijk zijn en later aan een echte backend te koppelen zijn.",
      en: "A small cap brand wants to show online why its caps are different (heavy cotton, extra stitching, many prototypes) without pretending there is a big workshop behind it. The shop has to load fast on a phone, be accessible and be ready to plug into a real backend later.",
    },
    highlights: {
      nl: [
        "Filters op /products (model, kleur, prijs, sortering, zoekterm) leven in de URL, zodat een selectie deelbaar is. Paginering gaat via useInfiniteQuery met een echte 'meer laden'-knop.",
        "Elke route laadt zijn eigen LCP-afbeelding vooraf via een inline script in index.html, met een srcset die exact gelijk is aan wat de Image-component opvraagt, zodat de browser niets twee keer downloadt.",
        "Eigen beeldpijplijn op Unsplash: per foto zes breedtes, WebP/AVIF via auto=format, lagere kwaliteit op grotere breedtes, een geblurde mini-versie tijdens het laden en een getekende pet als terugval bij een fout.",
        "Winkelwagen in Zustand met persistentie, samengevoegde regels per product, kleur en maat, voorraadlimiet en een voortgangsbalk naar gratis verzending vanaf 75 euro.",
        "prefers-reduced-motion schakelt parallax, de aangepaste cursor, het introscherm en doorlopende animaties uit; het introscherm verschijnt maximaal één keer per sessie.",
      ],
      en: [
        "Filters on /products (model, colour, price, sort, search) live in the URL, so a selection can be shared. Pagination uses useInfiniteQuery with a real 'load more' button.",
        "Each route preloads its own LCP image through an inline script in index.html, with a srcset that matches exactly what the Image component requests, so the browser never downloads the image twice.",
        "Custom image pipeline on Unsplash: six widths per photo, WebP/AVIF via auto=format, lower quality at larger widths, a blurred tiny placeholder while loading and a drawn cap as fallback on error.",
        "Cart in Zustand with persistence, merged lines per product, colour and size, a stock cap and a progress bar towards free shipping from 75 euros.",
        "prefers-reduced-motion turns off parallax, the custom cursor, the intro screen and looping animations; the intro screen shows at most once per session.",
      ],
    },
    hardProblems: {
      nl: [
        "Layout shift bij lazy routes: de footer sprong omhoog zodra een route-chunk de skeleton verving. Door zowel de paginacontainer als de route-fallback min-h-[100svh] te geven daalde de CLS van 0,21 naar vrijwel nul.",
        "Dubbele beelddownloads voorkomen: de preload-srcset per route in index.html moet byte voor byte overeenkomen met imageUrl(), inclusief de regel die de kwaliteit per breedte kiest, anders haalt de browser de hero twee keer op.",
        "De homepage bewust niet lazy laden: lazy() kostte een extra netwerkronde vóór de eerste render. De overige routes worden gesplitst en de twee meest bezochte worden vooraf geladen zodra de browser stil is.",
      ],
      en: [
        "Layout shift on lazy routes: the footer jumped once a route chunk replaced the skeleton. Giving both the page container and the route fallback min-h-[100svh] brought CLS down from 0.21 to near zero.",
        "Avoiding double image downloads: the per-route preload srcset in index.html has to match imageUrl() exactly, including the rule that picks quality per width, otherwise the browser fetches the hero twice.",
        "Deliberately not lazy-loading the homepage: lazy() cost an extra network round trip before first render. The other routes are split, and the two most visited are prefetched once the browser is idle.",
      ],
    },
    metrics: [
      { label: { nl: "Lighthouse performance, desktop", en: "Lighthouse performance, desktop" }, value: { nl: "98 tot 100", en: "98 to 100" } },
      { label: { nl: "Lighthouse performance, mobiel", en: "Lighthouse performance, mobile" }, value: { nl: "88 tot 97", en: "88 to 97" } },
      { label: { nl: "Toegankelijkheid, best practices, SEO", en: "Accessibility, best practices, SEO" }, value: { nl: "100", en: "100" } },
      { label: { nl: "Cumulative Layout Shift", en: "Cumulative Layout Shift" }, value: { nl: "0,21 naar 0,001", en: "0.21 to 0.001" } },
      { label: { nl: "Routes", en: "Routes" }, value: { nl: "7", en: "7" } },
    ],
    stack: ["React 18", "TypeScript strict", "Vite 6", "Tailwind CSS", "Framer Motion", "React Query", "Zustand", "Netlify"],
    links: [
    ],
  },
  {
    slug: "kdp-kleurboek",
    name: "KDP-kleurboek",
    status: "delivered",
    period: { from: "2026-09-28", to: "2026-09-29" },
    category: { nl: "Drukwerk en Python-pijplijn", en: "Print product and Python pipeline" },
    short: {
      nl: "Een print-klaar kleurboek van 50 platen voor Amazon KDP, gemaakt met een pijplijn die AI-tekeningen opschoont en keurt.",
      en: "A print-ready 50-plate coloring book for Amazon KDP, made with a pipeline that cleans up and inspects AI line art.",
    },
    summary: {
      nl: "Het is een vierkant kleurboek (8,5 x 8,5 inch, 108 pagina's) met 50 platen van vijf vaste dierenfiguren in boekwinkels, bibliotheken en leeshoekjes. Pim bouwde met Claude Code een Python-pijplijn die tekeningen maakt via de OpenAI Image API, ze opschoont en omzet naar vector, elke plaat automatisch controleert en daarna binnenwerk, CMYK-cover, listing en marketingbeelden bouwt, elk met een eigen preflight. De 147 API-calls kostten samen $3,85, onder een harde grens van $7 die in de code is afgedwongen. Uit dezelfde platen is ook een Nederlandse editie van 200 x 200 mm voor Brave New Books gemaakt. Het uploaden en bestellen van een proefexemplaar doet Pim zelf.",
      en: "It is a square coloring book (8.5 x 8.5 inch, 108 pages) with 50 plates featuring five recurring animal characters in bookshops, libraries and reading nooks. Pim used Claude Code to build a Python pipeline that generates drawings through the OpenAI Image API, cleans them up and converts them to vector, checks every plate automatically, and then builds the interior, a CMYK cover, the listing and marketing images, each with its own preflight. All 147 API calls together cost $3.85, under a hard $7 limit enforced in code. A Dutch 200 x 200 mm edition for Brave New Books was built from the same plates. Uploading and ordering a proof copy is Pim's own step.",
    },
    problem: {
      nl: "Een kleurboek op Amazon verkopen vraagt meer dan mooie plaatjes. AI-kleurboeken worden afgerekend op grijze pixels, dichte zwarte vlakken, piepkleine details, verkeerde anatomie en tekeningen die tegen de rand lopen, en KDP stelt strenge eisen aan het binnenwerk en de cover. Dat moest lukken voor 50 platen, met een API-budget van een paar dollar.",
      en: "Selling a coloring book on Amazon takes more than nice pictures. AI coloring books get criticised for gray pixels, solid black areas, tiny details, wrong anatomy and drawings that run into the page edge, and KDP has strict rules for the interior and cover files. All of that had to work for 50 plates on an API budget of a few dollars.",
    },
    highlights: {
      nl: [
        "Budgetbewaking in de code: elke call komt in qc/kosten.csv, generate.py weigert een call die het totaal boven $7 brengt en stopt direct bij een 429 of tegoedfout (geen automatische herhaling). Eindstand: $3,85 voor 147 calls, 0 fouten.",
        "Automatische QC per plaat op 300 DPI zonder anti-aliasing: grijze pixels, ingevulde vlakken boven 1 cm², lijndikte via skeletten, kleurvlakjes kleiner dan 4 mm, zwevende vormen en het tekenvlak, met een kleuroverlay per plaat. Uitkomst: 0 grijze pixels, 0 ingevulde vlakken, 50 van 50 platen binnen het tekenvlak.",
        "Opschoonstap van ruwe PNG naar vector op echte drukmaat: bijsnijden, 3x opschalen, threshold, spikkels en kiertjes onder 3 mm² weg, dunne lijnen plaatselijk aandikken tot 1,5 pt, nieuwe zwarte vlekken terugdraaien en vectoriseren met potrace.",
        "Gerichte vereenvoudigingsronde via het edit-endpoint: zelfde scène en figuren, minder kleine vlakjes. Plaat p20 ging van 120 naar 18 kleine vlakjes, p44 van 137 naar 56.",
        "Nederlandse editie voor Brave New Books (200 x 200 mm met afloop) uit dezelfde 50 platen, zonder nieuwe API-calls, met eigen binnenwerk, omslag en preflights.",
      ],
      en: [
        "Budget control in code: every call is logged to qc/kosten.csv, generate.py refuses any call that would push the total past $7 and stops immediately on a 429 or quota error (no automatic retries). Final total: $3.85 for 147 calls, 0 errors.",
        "Automatic per-plate QC at 300 DPI without anti-aliasing: gray pixels, filled areas over 1 cm², line thickness via skeletons, color regions under 4 mm, floating shapes and drawing-area bounds, with a color overlay per plate. Result: 0 gray pixels, 0 filled areas, 50 of 50 plates inside the drawing area.",
        "Cleanup step from raw PNG to vector at real print size: crop, 3x upscale, threshold, remove specks and slivers under 3 mm², locally thicken lines thinner than 1.5 pt, revert newly created black blobs, then vectorize with potrace.",
        "Targeted simplification round through the edit endpoint: same scene and characters, fewer tiny regions. Plate p20 went from 120 to 18 small regions, p44 from 137 to 56.",
        "Dutch edition for Brave New Books (200 x 200 mm with bleed) built from the same 50 plates without new API calls, with its own interior, cover and preflights.",
      ],
    },
    hardProblems: {
      nl: [
        "AI-rasterbeelden omzetten naar drukklare vectorlijnen: na opschalen en thresholden ontstonden dunne lijnstukjes, gaatjes en nieuwe zwarte vlekken. De opschoonstap dikt dunne lijnen plaatselijk aan tot 1,5 pt, dicht kiertjes onder 3 mm² maar laat glimlichtjes in de ogen staan, en draait elke nieuwe zwarte vlek groter dan 12 mm² terug voordat potrace vectoriseert.",
        "Een scherpe, ingekleurde cover maken uit een AI-kleurversie: het ingekleurde beeld wordt met ECC (affien) uitgelijnd op de lijntekening, waarna elk gesloten vlak de mediane kleur krijgt. Zo blijft de tekening exact de vectorplaat uit het boek en drukken de lijnen als puur zwart (K) in CMYK.",
        "Figuren consistent houden over 50 platen: de character sheet gaat als referentiebeeld mee in elke edit-call, en de prompts zijn bijgestuurd op fouten uit tests (de kat kreeg snorharen, de egel kreeg een wolkvorm zonder snuit of twee neusjes). Namen staan bewust niet in de beeldprompts, omdat het model ze anders als tekst tekent.",
      ],
      en: [
        "Turning AI raster images into print-ready vector lines: upscaling and thresholding produced thin line segments, pinholes and new black blobs. The cleanup step locally thickens thin lines to 1.5 pt, closes slivers under 3 mm² while keeping eye highlights, and reverts any new black blob larger than 12 mm² before potrace vectorizes the result.",
        "Building a sharp colored cover from an AI color version: the colored image is aligned to the line art with ECC (affine), then each closed region gets its median color. The drawing stays exactly the vector plate from the book and the lines print as pure black (K) in CMYK.",
        "Keeping characters consistent across 50 plates: the character sheet is sent as a reference image with every edit call, and the prompts were adjusted after test failures (the cat got whiskers, the hedgehog lost its snout or got two noses). Names are deliberately left out of image prompts because the model would otherwise draw them as text.",
      ],
    },
    metrics: [
      { label: { nl: "Kleurplaten", en: "Coloring plates" }, value: { nl: "50", en: "50" } },
      { label: { nl: "Pagina's binnenwerk", en: "Interior pages" }, value: { nl: "108", en: "108" } },
      { label: { nl: "API-kosten voor 147 calls", en: "API cost for 147 calls" }, value: { nl: "$3,85", en: "$3.85" } },
      { label: { nl: "Harde budgetgrens in de code", en: "Hard budget limit in code" }, value: { nl: "$7", en: "$7" } },
      { label: { nl: "Grijze pixels over alle platen", en: "Gray pixels across all plates" }, value: { nl: "0", en: "0" } },
      { label: { nl: "Preflightcontroles, binnenwerk en cover", en: "Preflight checks, interior and cover" }, value: { nl: "19 + 22", en: "19 + 22" } },
    ],
    stack: ["Python", "OpenAI Image API", "OpenCV", "scikit-image", "potrace", "PyMuPDF", "pikepdf"],
    links: [
    ],
  },
  {
    slug: "solana-forensics",
    name: "Solana Forensics",
    status: "local",
    period: { from: "2026-08-23", to: "2026-08-23" },
    category: { nl: "Onderzoekstoolkit (CLI)", en: "Research toolkit (CLI)" },
    short: {
      nl: "Reconstrueert memecoin-launches uit on-chain data. Alleen lezen: geen sleutel, geen handtekening, geen trades.",
      en: "Reconstructs meme-coin launches from on-chain data. Read-only: no key, no signature, no trades.",
    },
    summary: {
      nl: "Solana Forensics is een command-line toolkit in Node.js die transacties, wallets, tokens en complete launches analyseert via Helius RPC, DAS en WebSocket. Trades worden op poolniveau gereconstrueerd uit de vault-saldo's, pools worden gevonden via program-ownership in plaats van vaste account-layouts, en walletclusters krijgen een bewijsniveau (HIGH, MEDIUM, LOW, EXCLUDED) dat in de code wordt afgedwongen. De tool heeft geen keypair, ondertekent niets en handelt niet; resultaten gaan als JSON-rapport naar een lokaal dashboard. Pim bouwde het met Claude Code als gereedschap, zonder één npm-dependency.",
      en: "Solana Forensics is a Node.js command-line toolkit that analyzes transactions, wallets, tokens and full launches through Helius RPC, DAS and WebSocket. Trades are reconstructed at the pool level from vault balance changes, pools are found through program ownership instead of hardcoded account layouts, and wallet clusters get an evidence grade (HIGH, MEDIUM, LOW, EXCLUDED) that is enforced in code. The tool holds no keypair, signs nothing and never trades; results are saved as JSON reports and shown on a local dashboard. Pim built it with Claude Code as his tool, without a single npm dependency.",
    },
    problem: {
      nl: "Na een memecoin-rug wil je precies weten wat er gebeurde: wie de token aanmaakte, wie de pool vulde, wie verkocht en waar het geld daarna heen ging. Gewone wallet-overzichten raken in de war door aggregator-routes, position-NFT's van AMM's en address poisoning, en leveren dan conclusies op die er overtuigend uitzien maar niet kloppen.",
      en: "After a meme-coin rug pull you want to know exactly what happened: who created the token, who seeded the pool, who sold and where the money went next. Ordinary wallet views get confused by aggregator routes, AMM position NFTs and address poisoning, and produce conclusions that look convincing but are wrong.",
    },
    highlights: {
      nl: [
        "Trades worden gereconstrueerd uit wat er werkelijk in en uit de token-accounts van de pool ging, zodat een aggregator-route (A naar SOL naar B) die het SOL-saldo van de trader vlak laat de prijs niet vertekent.",
        "Pools worden herkend aan program-ownership: een account dat in een transactie met de mint voorkomt en eigendom is van een bekend AMM-programma. Dat werkt voor Orca, Raydium, Meteora en Pump.fun zonder per protocol struct-offsets bij te houden.",
        "Walletclustering met bewijsniveaus die in code zijn vastgelegd: HIGH vereist een echte overboeking boven de dust-grens, alleen timing komt nooit boven LOW, en rent-grootte overboekingen tellen niet als funding.",
        "Address poisoning wordt actief uitgesloten: een relatie die alleen uit dust bestaat en een lookalike-adres met dezelfde prefix en suffix heeft, krijgt EXCLUDED in plaats van het cluster op te blazen.",
        "Eerlijk over wat RPC kan zien: elk signaal vóór een dev-sell is gelabeld POST_CONFIRMATION, omdat Solana geen publieke mempool heeft. De tool claimt nooit een pre-confirmation signaal dat hij niet kan bewijzen.",
      ],
      en: [
        "Trades are rebuilt from what actually entered and left the pool's own token accounts, so an aggregator route (A to SOL to B) that leaves the trader's SOL balance flat cannot distort the price.",
        "Pools are detected by program ownership: an account that appears in a transaction moving the mint and is owned by a known AMM program. This works for Orca, Raydium, Meteora and Pump.fun without maintaining struct offsets per protocol.",
        "Wallet clustering with evidence grades fixed in code: HIGH requires a real transfer above the dust threshold, timing alone never rises above LOW, and rent-sized transfers do not count as funding.",
        "Address poisoning is actively excluded: a relationship made only of dust that has a lookalike address with the same prefix and suffix is marked EXCLUDED instead of inflating the cluster.",
        "Honest about what RPC can see: every signal before a dev sell is labelled POST_CONFIRMATION, because Solana has no public mempool. The tool never claims a pre-confirmation signal it cannot prove.",
      ],
    },
    hardProblems: {
      nl: [
        "Een aggregator kan A naar SOL naar B routeren, waardoor het SOL-saldo van de trader nauwelijks beweegt en een wallet-gebaseerde prijs fout is. Opgelost door prijzen alleen af te leiden uit de vault-delta's van de pool zelf.",
        "Bij een sell verlaat SOL de WSOL-vault van de pool, waardoor die vault eruitzag als de grootste funder van de dev en de funding-keten ontspoorde. Opgelost door elk adres te classificeren op basis van het programma dat het account bezit.",
        "Hub- en servicewallets met honderden tegenpartijen trokken ongerelateerd verkeer in een cluster en kostten duizenden RPC-calls. Tracering en clustering stoppen nu bij een drempel van 400 transacties en melden waarom.",
      ],
      en: [
        "An aggregator can route A to SOL to B, leaving the trader's SOL balance almost unchanged and making a wallet-based price wrong. Solved by deriving prices only from the pool's own vault deltas.",
        "During a sell, SOL leaves the pool's WSOL vault, which made that vault look like the dev's biggest funder and sent the funding chain off course. Solved by classifying every address by the program that owns the account.",
        "Hub and service wallets with hundreds of counterparties pulled unrelated traffic into clusters and cost thousands of RPC calls. Tracing and clustering now stop at a 400-transaction threshold and report why.",
      ],
    },
    metrics: [
      { label: { nl: "npm-dependencies", en: "npm dependencies" }, value: { nl: "0", en: "0" } },
      { label: { nl: "CLI-commando's", en: "CLI commands" }, value: { nl: "10", en: "10" } },
      { label: { nl: "Herkende AMM- en launchpad-programma's", en: "Recognised AMM and launchpad programs" }, value: { nl: "12 + 4 routers", en: "12 + 4 routers" } },
      { label: { nl: "Regels JavaScript", en: "Lines of JavaScript" }, value: { nl: "3.097", en: "3,097" } },
      { label: { nl: "Pre-sell tijdvensters", en: "Pre-sell time windows" }, value: { nl: "6", en: "6" } },
    ],
    stack: ["Node.js 24 (ESM)", "Helius RPC + DAS", "WebSocket", "Vanilla JS + SVG"],
    links: [
    ],
  },
  {
    slug: "offerte-pdf-generator",
    name: "OfferteVlot",
    status: "local",
    period: { from: "2026-06-22", to: "2026-06-22" },
    category: { nl: "Web-app zonder backend", en: "Web app without a backend" },
    short: {
      nl: "Een nette offerte-PDF voor aannemers in een paar minuten, volledig in de browser.",
      en: "A clean quote PDF for contractors in a few minutes, entirely in the browser.",
    },
    summary: {
      nl: "OfferteVlot is een webapp die volledig in de browser draait. Je vult bedrijfsgegevens met logo, klantgegevens (met apart klusadres) en offerteregels in, en ziet ondertussen een live A4-voorbeeld dat meebeweegt met de uiteindelijke PDF. De PDF wordt met jsPDF als scherpe vectortekst opgebouwd, met eigen paginering, een tabelkop die op elke nieuwe pagina terugkomt en \"Pagina X van Y\" in de footer. Er is geen backend: historie en offertenummering staan in localStorage en de build is een los HTML-bestand dat zonder server opent.",
      en: "OfferteVlot is a web app that runs entirely in the browser. You enter company details with a logo, customer details (with a separate job address) and line items, and a live A4 preview follows along with the final PDF. The PDF is built with jsPDF as sharp vector text, with its own pagination, a table header that repeats on every new page and \"Page X of Y\" in the footer. There is no backend: history and quote numbering live in localStorage, and the build is a single HTML file that opens without a server.",
    },
    problem: {
      nl: "Een aannemer of dakdekker wil na een inspectie of telefoongesprek snel een nette offerte kunnen sturen, met eigen logo en correcte btw-berekening, zonder eerst een account aan te maken of software te installeren.",
      en: "A contractor or roofer wants to send a clean quote right after a site visit or phone call, with their own logo and correct VAT totals, without signing up for an account or installing software.",
    },
    highlights: {
      nl: [
        "Live voorbeeld: een HTML-document op echte A4-maat (794 x 1123 px) dat met een ResizeObserver naar de kolombreedte wordt geschaald en dezelfde reken- en opmaakfuncties gebruikt als de PDF.",
        "Eigen PDF-layout in jsPDF op A4 in millimeters: handmatige paginering voor inleiding, offerteregels, totalen, voorwaarden en handtekeningblok, met een tabelkop die op elke vervolgpagina opnieuw wordt getekend.",
        "\"Pagina X van Y\" wordt in een slotronde op elke pagina gestempeld zodra het totaal aantal pagina's bekend is, in plaats van een placeholder die niet werd vervangen.",
        "Logo-upload met drag and drop (PNG, JPG, SVG, max. 4 MB). Elk logo, ook SVG, wordt via een canvas op 3x resolutie naar PNG omgezet zodat jsPDF het scherp kan insluiten.",
        "Totalen met btw-keuze (21, 9 of 0 procent), korting als percentage of vast bedrag (nooit hoger dan het subtotaal) en een aparte regel \"Subtotaal na korting\" zodat zichtbaar is waarover btw wordt berekend.",
      ],
      en: [
        "Live preview: an HTML document at true A4 size (794 x 1123 px), scaled to the column width with a ResizeObserver and sharing the same calculation and formatting functions as the PDF.",
        "Custom A4 PDF layout in jsPDF, measured in millimetres: manual pagination for intro, line items, totals, terms and signature block, with the table header redrawn on every follow-up page.",
        "\"Page X of Y\" is stamped on every page in a final pass once the total page count is known, replacing a placeholder that was never substituted.",
        "Drag and drop logo upload (PNG, JPG, SVG, max 4 MB). Every logo, SVG included, is rasterised to PNG at 3x resolution through a canvas so jsPDF can embed it sharply.",
        "Totals with a VAT choice (21, 9 or 0 percent), a percentage or fixed discount (never more than the subtotal) and a separate \"subtotal after discount\" line so it is clear what VAT is calculated on.",
      ],
    },
    hardProblems: {
      nl: [
        "jsPDF heeft geen automatische layout. Elke y-positie wordt zelf bijgehouden, en voor inleiding, tabelregels, totalenblok, voorwaarden en handtekeningblok wordt vooraf gecontroleerd of het nog op de pagina past; zo niet, dan volgt een nieuwe pagina met footer en, bij de tabel, een herhaalde kop.",
        "Het totaal aantal pagina's is pas bekend als alles getekend is. De eerste versie liet een niet-vervangen placeholder \"{tp}\" in de footer staan; dit is opgelost met een slotronde die na afloop elke pagina opnieuw opent en \"Pagina X van Y\" stempelt.",
        "Het wiskundige minteken (U+2212) werd door de standaard fontcodering van jsPDF als een vreemd teken weergegeven bij het kortingsbedrag. Opgelost door een gewoon ASCII-koppelteken te gebruiken.",
      ],
      en: [
        "jsPDF has no automatic layout. Every y position is tracked by hand, and for the intro, table rows, totals block, terms and signature block the code checks up front whether it still fits on the page; if not, a new page with footer is started and, for the table, the header is repeated.",
        "The total page count is only known after everything is drawn. The first version left an unreplaced \"{tp}\" placeholder in the footer; this was fixed with a final pass that revisits every page and stamps \"Page X of Y\".",
        "The mathematical minus sign (U+2212) rendered as a garbled character in the discount amount because of jsPDF's standard font encoding. Fixed by using a plain ASCII hyphen.",
      ],
    },
    metrics: [
      { label: { nl: "Regels in de PDF-generator", en: "Lines in the PDF generator" }, value: { nl: "468", en: "468" } },
      { label: { nl: "Runtime-dependencies", en: "Runtime dependencies" }, value: { nl: "3", en: "3" } },
      { label: { nl: "Build", en: "Build" }, value: { nl: "1 HTML-bestand, 953 KB", en: "1 HTML file, 953 KB" } },
      { label: { nl: "Btw-tarieven", en: "VAT rates" }, value: { nl: "21, 9, 0%", en: "21, 9, 0%" } },
    ],
    stack: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "jsPDF", "vite-plugin-singlefile"],
    links: [
      { label: { nl: "Broncode op GitHub", en: "Source on GitHub" }, href: "https://github.com/pimdaanbram-prog/Whatsapp-analyser-" },
    ],
  },
  {
    slug: "paletteforge",
    name: "PaletteForge",
    status: "local",
    period: { from: "2026-03-20", to: "2026-03-22" },
    category: { nl: "Micro-SaaS (prototype)", en: "Micro-SaaS (prototype)" },
    short: {
      nl: "Kleurenpaletten genereren en exporteren naar CSS, Tailwind, SCSS en JSON, ook zonder een enkele API-sleutel.",
      en: "Generate colour palettes and export them to CSS, Tailwind, SCSS and JSON, even without a single API key.",
    },
    summary: {
      nl: "PaletteForge is een micro-SaaS in Next.js 16 waarmee je kleurenpaletten genereert (willekeurig, analoog of complementair), bewaart en downloadt als CSS-variabelen, Tailwind-config, SCSS of JSON. De app heeft een landingspagina met live paletdemo, een bibliotheek van 12 templates met zoeken en filters, een prijspagina met maand- en jaarabonnementen, Supabase-login en een Stripe-checkout in testmodus. Zonder API-sleutels draait alles in een demomodus: accounts in localStorage, een gesimuleerde betaling en e-mails die naar de terminal worden gelogd. Het is een lokaal werkend prototype: paletten in het dashboard staan nog niet in een database en de webhook zet abonnementen nog niet door naar Supabase.",
      en: "PaletteForge is a Next.js 16 micro-SaaS for generating colour palettes (random, analogous or complementary), saving them and downloading them as CSS variables, a Tailwind config, SCSS or JSON. It has a landing page with a live palette demo, a library of 12 templates with search and filters, a pricing page with monthly and yearly plans, Supabase login and a Stripe checkout in test mode. Without API keys the whole app runs in a demo mode: accounts in localStorage, a simulated payment and e-mails logged to the terminal. It is a locally working prototype: dashboard palettes are not yet stored in a database and the webhook does not yet sync subscriptions to Supabase.",
    },
    problem: {
      nl: "Designers en developers die een consistent kleurenschema nodig hebben, kopiëren hexcodes vaak met de hand naar hun CSS, Tailwind-config of SCSS. PaletteForge genereert harmonieuze paletten en levert ze direct in het formaat dat de codebase gebruikt.",
      en: "Designers and developers who need a consistent colour scheme often copy hex codes by hand into their CSS, Tailwind config or SCSS. PaletteForge generates harmonious palettes and hands them over in the format the codebase already uses.",
    },
    highlights: {
      nl: [
        "Eigen kleurwiskunde zonder library: hex (3 of 6 tekens) naar RGB naar HSL en terug, met analoge, complementaire en triadische harmonieën via tintrotatie.",
        "Export naar vier formaten (CSS-variabelen, Tailwind-config, SCSS, JSON) als downloadbaar bestand vanuit het dashboard.",
        "Volledige demomodus: elke koppeling controleert of de sleutel echt is en valt anders terug op localStorage-login, een gesimuleerde checkout en e-mails in de terminal.",
        "Stripe-webhook met handtekeningcontrole op de ruwe request body, voor afgeronde checkouts, abonnementswijzigingen en mislukte betalingen.",
        "Templatebibliotheek met 12 paletten, zoeken op naam en omschrijving, 6 categorieën en een filter voor premium templates.",
      ],
      en: [
        "Own colour maths without a library: hex (3 or 6 digits) to RGB to HSL and back, with analogous, complementary and triadic harmonies via hue rotation.",
        "Export to four formats (CSS variables, Tailwind config, SCSS, JSON) as a downloadable file from the dashboard.",
        "Full demo mode: each integration checks whether its key looks real and otherwise falls back to localStorage login, a simulated checkout and e-mails logged to the terminal.",
        "Stripe webhook with signature verification on the raw request body, handling completed checkouts, subscription changes and failed payments.",
        "Template library with 12 palettes, search on name and description, 6 categories and a premium-only filter.",
      ],
    },
    hardProblems: {
      nl: [
        "De hele app moest klikbaar zijn zonder accounts bij Supabase, Stripe of Resend. Elke koppeling herkent placeholder-sleutels en schakelt dan over: login via localStorage, een eigen kaartformulier dat het gedrag van Stripe-testkaarten nabootst (inclusief een geweigerde kaart) en e-mails die naar de console gaan.",
        "Stripe controleert de webhook-handtekening op de exacte ruwe body. De route leest daarom de request-stream eerst volledig in een Buffer voordat constructEvent draait, en geeft 503 terug als het webhook-secret ontbreekt.",
        "Kleurconversie en harmonieën zonder externe library: hex naar RGB naar HSL en terug, met tintrotatie (30 graden voor analoog, 180 voor complementair, 120 en 240 voor triadisch) en grenzen op lichtheid en verzadiging zodat de kleuren bruikbaar blijven.",
      ],
      en: [
        "The whole app had to be clickable without Supabase, Stripe or Resend accounts. Each integration detects placeholder keys and switches over: login through localStorage, a custom card form that mimics Stripe test-card behaviour (including a declined card) and e-mails sent to the console.",
        "Stripe verifies the webhook signature against the exact raw body. The route therefore reads the request stream fully into a Buffer before calling constructEvent, and returns 503 when the webhook secret is missing.",
        "Colour conversion and harmonies without an external library: hex to RGB to HSL and back, with hue rotation (30 degrees for analogous, 180 for complementary, 120 and 240 for triadic) and clamps on lightness and saturation so the colours stay usable.",
      ],
    },
    metrics: [
      { label: { nl: "Regels TypeScript", en: "Lines of TypeScript" }, value: { nl: "4.390", en: "4,390" } },
      { label: { nl: "Pagina's", en: "Pages" }, value: { nl: "9", en: "9" } },
      { label: { nl: "API-routes", en: "API routes" }, value: { nl: "6", en: "6" } },
      { label: { nl: "Templates", en: "Templates" }, value: { nl: "12", en: "12" } },
      { label: { nl: "Exportformaten", en: "Export formats" }, value: { nl: "4", en: "4" } },
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Supabase Auth", "Stripe (testmodus)", "Resend"],
    links: [
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
