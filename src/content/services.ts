import type { Bilingual } from "@/i18n/config";

/**
 * The services Pim offers, each with its own page under /[lang]/diensten/[slug].
 * Every service points to the real projects that show it. The first sentence
 * of `intro` doubles as the short summary on the home page and the overview.
 */

export interface ServiceProof {
  /** Project slug from content/projects.ts. */
  slug: string;
  /** One sentence about the project, read in the context of this service. */
  blurb: Bilingual<string>;
}

export interface ServicePoint {
  title: Bilingual<string>;
  body: Bilingual<string>;
}

export interface Service {
  slug: string;
  /** Short name for cards, menus and breadcrumbs. */
  name: Bilingual<string>;
  meta: { title: Bilingual<string>; description: Bilingual<string> };
  /** The h1. */
  title: Bilingual<string>;
  intro: Bilingual<string>;
  problem: Bilingual<string>;
  audience: Bilingual<string>;
  how: Bilingual<string>;
  /** Optional numbered points under "Hoe ik werk". */
  points?: ServicePoint[];
  /** Optional paragraph about an example of Pim's own work (the website page). */
  example?: Bilingual<string>;
  /** Show the sample sites from content/sample-sites.ts (the website page). */
  sampleSites?: boolean;
  proof: ServiceProof[];
  /** Optional pointer to another service that fits as an extra. */
  extra?: { service: string; body: Bilingual<string> };
  closing: { title: Bilingual<string>; body: Bilingual<string> };
}

export const services: Service[] = [
  {
    slug: "software-op-maat",
    name: { nl: "Software op maat", en: "Custom software" },
    meta: {
      title: { nl: "Software op maat laten maken in Helmond", en: "Custom software development in Helmond" },
      description: {
        nl: "Software op maat voor bedrijven in Helmond en omgeving: een web-app of desktopapp die precies doet wat jouw werk vraagt. Met voorbeelden van mijn werk.",
        en: "Custom software for businesses in and around Helmond: a web app or desktop app that does exactly what your business needs. With examples of my work.",
      },
    },
    title: { nl: "Software op maat laten maken", en: "Custom software, built around your work" },
    intro: {
      nl: "Soms past geen enkel standaardpakket bij hoe je werkt. Dan laat je software op maat maken: een programma dat precies doet wat jouw bedrijf nodig heeft, en niets meer. Ik bouw dat voor bedrijven in Helmond, Laarbeek, Eindhoven en omgeving, als web-app die werkt op telefoon en laptop, of als desktopapp voor Mac en Windows.",
      en: "Sometimes no off-the-shelf package fits the way you work. That's when custom software makes sense: a program that does exactly what your business needs, and nothing more. I build it for businesses in Helmond, Laarbeek, Eindhoven and the surrounding area, as a web app that works on phone and laptop, or as a desktop app for Mac and Windows.",
    },
    problem: {
      nl: "Veel bedrijven werken met een mix van Excel-lijsten, mappen vol bestanden en een pakket dat net niet past. Dat gaat goed, tot iemand in een oude versie werkt of iets twee keer moet invoeren. Software op maat haalt die omwegen weg, omdat hij gebouwd is rond jouw manier van werken in plaats van andersom.",
      en: "Many businesses run on a mix of Excel sheets, folders full of files and a package that almost fits. That works fine until someone edits an old version or has to enter the same thing twice. Custom software removes those workarounds, because it is built around the way you work instead of the other way round.",
    },
    audience: {
      nl: "Kleine en middelgrote bedrijven met een vast werkproces dat nu met de hand of met losse lijstjes gaat. Je hoeft niet precies te weten wat je wilt. Als je kunt uitleggen wat er nu misgaat, kunnen we daarmee beginnen.",
      en: "Small and medium-sized businesses with a fixed way of working that now runs by hand or on loose lists. You don't need to know exactly what you want. If you can explain what goes wrong today, that's enough to start with.",
    },
    how: {
      nl: "Ik begin met een gesprek over hoe het nu gaat en wat er beter moet. Daarna bouw ik in kleine stappen, zodat je snel iets werkends ziet en kunt bijsturen. Elke stap test ik met automatische tests en door het zelf te gebruiken op telefoon en laptop. Je gegevens blijven binnen je bedrijf, en een geheimhoudingsverklaring teken ik zonder discussie.",
      en: "I start with a conversation about how things work now and what needs to improve. Then I build in small steps, so you quickly see something that works and can adjust course. I check every step with automated tests and by using it myself on phone and laptop. Your data stays inside your company, and I'm happy to sign a non-disclosure agreement.",
    },
    proof: [
      {
        slug: "teamsync",
        blurb: {
          nl: "Een desktopapp voor Mac en Windows waarmee een klein team bestanden deelt zonder werk kwijt te raken.",
          en: "A desktop app for Mac and Windows that lets a small team share files without losing work.",
        },
      },
      {
        slug: "strength-tracker",
        blurb: {
          nl: "Een web-app die je installeert als gewone app en die ook zonder internet werkt.",
          en: "A web app that installs like a regular app and keeps working without internet.",
        },
      },
    ],
    closing: {
      title: { nl: "Loop je vast op een lijstje of pakket dat niet past?", en: "Stuck with a spreadsheet or package that doesn't fit?" },
      body: {
        nl: "Vertel me hoe het nu gaat. Dan kijk ik wat ik ervoor kan bouwen.",
        en: "Tell me how things work now, and I'll look at what I could build for it.",
      },
    },
  },
  {
    slug: "exact-online-koppeling",
    name: { nl: "Exact Online koppeling", en: "Exact Online integration" },
    meta: {
      title: { nl: "Exact Online koppeling laten maken", en: "Exact Online integration, built for you" },
      description: {
        nl: "Ik bouw koppelingen en automatiseringen voor Exact Online, zodat gegevens er vanzelf in komen, zonder overtypen. Voor bedrijven in Helmond en omgeving.",
        en: "I build Exact Online integrations, so your data flows in automatically instead of being typed in by hand. For businesses in and around Helmond.",
      },
    },
    title: { nl: "Een Exact Online koppeling laten maken", en: "An Exact Online integration, built for you" },
    intro: {
      nl: "Werk je met Exact Online en typ je gegevens nog met de hand over uit andere bronnen? Dan kan een koppeling dat overnemen. Ik bouw koppelingen en automatiseringen die gegevens vanzelf in Exact Online zetten, voor bedrijven in Helmond, Laarbeek, Eindhoven en omgeving.",
      en: "Do you work in Exact Online and still copy data in by hand from other sources? An integration can take that over. I build integrations and automations that put your data into Exact Online automatically, for businesses in Helmond, Laarbeek, Eindhoven and the surrounding area.",
    },
    problem: {
      nl: "Exact Online is vaak de plek waar alles samenkomt, maar de gegevens komen ergens anders vandaan: uit een website, een spreadsheet, een ander pakket of openbare bronnen. Wie dat overtypt, verliest tijd en maakt vroeg of laat een fout.",
      en: "Exact Online is often where everything comes together, but the data starts somewhere else: a website, a spreadsheet, another package or public sources. Retyping it costs time, and sooner or later someone makes a mistake.",
    },
    audience: {
      nl: "Bedrijven die Exact Online gebruiken voor hun administratie of verkoop, en die merken dat er elke dag of week hetzelfde handwerk terugkomt.",
      en: "Businesses that use Exact Online for their accounts or sales, and notice the same manual work coming back every day or every week.",
    },
    how: {
      nl: "Ik begin bij de vraag welke gegevens waar vandaan komen en waar ze in Exact Online moeten landen. Daarna bouw ik de koppeling zo dat je team gewoon in Exact Online blijft werken. Er hoeft dus geen nieuw programma geleerd te worden. Ik test eerst met voorbeeldgegevens, voordat er iets in je echte administratie komt.",
      en: "I start by working out which data comes from where and where it should end up in Exact Online. Then I build the integration so your team simply keeps working in Exact Online, with no new program to learn. I test with sample data first, before anything touches your real records.",
    },
    proof: [
      {
        slug: "exact-online",
        blurb: {
          nl: "ExactTool zoekt bedrijven en contactpersonen op uit openbare bronnen en zet ze als verkoopkans in Exact Online. Zo begint een belteam met een lijst die al klaarstaat.",
          en: "ExactTool looks up companies and contact persons from public sources and adds them to Exact Online as sales opportunities, so a calling team starts the day with a list that is ready to go.",
        },
      },
    ],
    closing: {
      title: { nl: "Typ je elke week dezelfde gegevens over in Exact Online?", en: "Retyping the same data into Exact Online every week?" },
      body: {
        nl: "Laat me zien waar ze vandaan komen. Dan zeg ik je eerlijk of een koppeling de moeite waard is.",
        en: "Show me where it comes from, and I'll tell you honestly whether an integration is worth it.",
      },
    },
  },
  {
    slug: "offertesoftware",
    name: { nl: "Offertesoftware voor vakmensen", en: "Quoting software for tradespeople" },
    meta: {
      title: { nl: "Offertesoftware voor aannemers en vakmensen", en: "Quoting software for contractors and tradespeople" },
      description: {
        nl: "Snel een nette offerte als PDF, met je eigen logo en de btw goed uitgerekend. Offertesoftware voor aannemers en vakmensen in Helmond, Laarbeek en omgeving.",
        en: "A professional PDF quote in minutes, with your own logo and the VAT worked out for you. Quoting software for contractors and tradespeople around Helmond.",
      },
    },
    title: { nl: "Offertesoftware voor aannemers en vakmensen", en: "Quoting software for contractors and tradespeople" },
    intro: {
      nl: "Na een inspectie of een telefoontje wil je meteen een offerte sturen, niet 's avonds nog achter de laptop. Daarvoor bouwde ik OfferteVlot: een tool waarmee een aannemer of vakman in een paar minuten een nette offerte als PDF maakt. Ik richt OfferteVlot ook in voor jouw bedrijf, voor vakmensen in Helmond, Laarbeek, Eindhoven en omgeving.",
      en: "After an inspection or a phone call you want to send a quote straight away, not sit behind the laptop that evening. That's why I built OfferteVlot: a tool that lets a contractor or tradesperson make a professional PDF quote in a few minutes. I can also set up OfferteVlot for your business, for tradespeople in Helmond, Laarbeek, Eindhoven and the surrounding area.",
    },
    problem: {
      nl: "Offertes maken in Word of Excel kost tijd: regels kopiëren, btw narekenen, een logo dat verspringt. Grote pakketten kunnen het wel, maar vragen een account, een abonnement en tijd om het te leren. Die tijd heeft een klein bedrijf vaak niet.",
      en: "Writing quotes in Word or Excel takes time: copying lines, double-checking the VAT, a logo that keeps shifting. Big packages can do it, but they come with an account, a subscription and a learning curve, and a small business rarely has time for that.",
    },
    audience: {
      nl: "Aannemers, dakdekkers, schilders, installateurs en andere vakmensen die zelf hun offertes maken en daar minder tijd aan kwijt willen zijn.",
      en: "Contractors, roofers, painters, installers and other tradespeople who write their own quotes and want to spend less time on them.",
    },
    how: {
      nl: "OfferteVlot werkt in de browser, zonder account en zonder server. Je gegevens blijven op je eigen toestel. Terwijl je typt, zie je hoe de PDF eruitziet. De btw en kortingen worden goed uitgerekend, en je stuurt de offerte direct via WhatsApp. Wil je iets anders, zoals je eigen voorwaarden, vaste prijzen per klus of een koppeling met je boekhouding, dan bouw ik dat erbij.",
      en: "OfferteVlot runs in the browser, with no account and no server, so your data stays on your own device. As you type, you see exactly what the PDF will look like. VAT and discounts are worked out for you, and you can send the quote straight away via WhatsApp. Need something extra, such as your own terms, fixed prices per job or a link to your accounting software? I can build that in.",
    },
    proof: [
      {
        slug: "offerte-pdf-generator",
        blurb: {
          nl: "OfferteVlot, met je eigen logo, oplopende offertenummers en een overzicht van eerdere offertes.",
          en: "OfferteVlot, with your own logo, sequential quote numbers and a list of earlier quotes.",
        },
      },
    ],
    closing: {
      title: { nl: "Wil je sneller offertes sturen?", en: "Want to send quotes faster?" },
      body: {
        nl: "Vertel me hoe je nu je offertes maakt. Dan laat ik zien hoe het sneller kan.",
        en: "Tell me how you put your quotes together now, and I'll show you how it can be quicker.",
      },
    },
  },
  {
    slug: "systemen-koppelen",
    name: { nl: "Systemen koppelen en automatiseren", en: "Connecting systems and automation" },
    meta: {
      title: { nl: "Systemen koppelen en werk automatiseren", en: "Connecting systems and automating work" },
      description: {
        nl: "Gegevens die vanzelf van het ene systeem naar het andere gaan, zonder overtypen. Ik koppel systemen en automatiseer werk voor bedrijven rond Helmond.",
        en: "Data that moves between your systems automatically, with no retyping. I connect systems and automate routine work for businesses in and around Helmond.",
      },
    },
    title: { nl: "Systemen koppelen en werk automatiseren", en: "Connecting systems and automating work" },
    intro: {
      nl: "Veel bedrijven werken met pakketten die niet met elkaar praten. Wat in het ene systeem staat, wordt met de hand in het andere gezet. Ik koppel die systemen, zodat gegevens vanzelf de goede kant op gaan, en ik automatiseer werk dat elke dag terugkomt. Voor bedrijven in Helmond, Laarbeek, Eindhoven en omgeving.",
      en: "Many businesses use packages that don't talk to each other. What is in one system gets copied into the other by hand. I connect those systems so data ends up in the right place by itself, and I automate the work that comes back every day. For businesses in Helmond, Laarbeek, Eindhoven and the surrounding area.",
    },
    problem: {
      nl: "Overtypen kost tijd, en elke keer kan er een fout insluipen: een verkeerd telefoonnummer, een vergeten regel, een klant die twee keer in het systeem staat. Hoe meer pakketten, hoe meer van dat werk.",
      en: "Retyping costs time, and every time a mistake can slip in: a wrong phone number, a missed line, a customer who ends up in the system twice. The more packages you use, the more of that work there is.",
    },
    audience: {
      nl: "Bedrijven met een website, CRM, webshop, spreadsheet of mailbox, waartussen nu met de hand gegevens worden overgezet. Weet je niet zeker of een koppeling kan? Vaak kan het. En anders zeg ik dat eerlijk.",
      en: "Businesses with a website, CRM, web shop, spreadsheet or mailbox where data is moved between them by hand. Not sure whether they can be connected? Often they can, and if not, I'll tell you straight.",
    },
    how: {
      nl: "Ik kijk eerst welke gegevens waar vandaan komen en waar ze heen moeten. Heeft een systeem een koppeling (een API), dan gebruik ik die. Kan dat niet, dan laat ik de computer het werk doen zoals een medewerker het zou doen. Ik sluit aan op wat er al is, zodat je niet hoeft over te stappen op een nieuw pakket.",
      en: "I first look at which data comes from where and where it needs to go. If a system has an interface (an API), I use it. If it doesn't, I have the computer do the work the way an employee would. I build on what you already have, so you don't need to switch to a new package.",
    },
    proof: [
      {
        slug: "wordpress-koppeling",
        blurb: {
          nl: "De WordPress-koppeling, die portalsites automatisch gegevens laat uitwisselen met WordPress.",
          en: "The WordPress integration, which lets portal sites exchange data with WordPress automatically.",
        },
      },
      {
        slug: "belhulp",
        blurb: {
          nl: "Belhulp, die belgesprekken live uitschrijft en het belformulier vanzelf invult.",
          en: "Belhulp, which transcribes sales calls live and fills in the call form by itself.",
        },
      },
    ],
    closing: {
      title: { nl: "Zet je gegevens nog met de hand over?", en: "Still moving data around by hand?" },
      body: {
        nl: "Vertel me welke systemen je gebruikt. Dan kijk ik wat er te koppelen valt.",
        en: "Tell me which systems you use, and I'll look at what can be connected.",
      },
    },
  },
  {
    slug: "website-laten-maken",
    name: { nl: "Website laten maken", en: "Websites for small businesses" },
    meta: {
      title: { nl: "Website laten maken voor vakmensen in Helmond", en: "Websites for tradespeople in Helmond" },
      description: {
        nl: "Een snelle, moderne website die goed werkt op je telefoon en vindbaar is in Google. Voor vakmensen en kleine bedrijven in Helmond, Laarbeek en omgeving.",
        en: "A fast, modern website that works well on a phone and is easy to find in Google. For tradespeople and small businesses in and around Helmond and Laarbeek.",
      },
    },
    title: { nl: "Een website laten maken in Helmond en omgeving", en: "A website for your business in Helmond and nearby" },
    intro: {
      nl: "Als vakman of klein bedrijf wil je dat mensen uit de buurt je vinden als ze in Google zoeken, en dat ze op hun telefoon meteen zien wat je doet en hoe ze je bereiken. Ik maak websites die precies dat doen, voor vakmensen, aannemers en kleine bedrijven in Helmond, Laarbeek en omgeving.",
      en: "As a tradesperson or small business, you want people nearby to find you when they search Google, and to see on their phone straight away what you do and how to reach you. I build websites that do exactly that, for tradespeople, contractors and small businesses in Helmond, Laarbeek and the surrounding area.",
    },
    problem: {
      nl: "Veel websites van kleine bedrijven zijn traag, lastig te lezen op een telefoon of komen in Google niet boven. Dan bellen mensen de concurrent. Niet omdat die beter is, maar omdat ze die wel konden vinden.",
      en: "Many small business websites are slow, hard to read on a phone or never show up in Google. So people call a competitor instead. Not because they are better, but because they were easier to find.",
    },
    audience: {
      nl: "Aannemers, schilders, installateurs, hoveniers en andere vakmensen en kleine bedrijven die een eerste website willen, of een oude willen vervangen.",
      en: "Contractors, painters, installers, gardeners and other tradespeople and small businesses who want their first website, or want to replace an old one.",
    },
    how: {
      nl: "Een website moet doen waarvoor hij er is: mensen uit de buurt laten zien wat je doet en hoe ze je bereiken. Daar let ik op:",
      en: "A website has one job: showing people nearby what you do and how to reach you. This is what I focus on:",
    },
    points: [
      {
        title: { nl: "Snel", en: "Fast" },
        body: {
          nl: "De pagina's laden vlot, ook op een telefoon met matig bereik.",
          en: "Pages load quickly, even on a phone with a weak signal.",
        },
      },
      {
        title: { nl: "Modern en van jou", en: "Modern and yours" },
        body: {
          nl: "Geen standaardsjabloon, maar een ontwerp dat bij je bedrijf past.",
          en: "No off-the-shelf template, but a design that suits your business.",
        },
      },
      {
        title: { nl: "Goed vindbaar", en: "Easy to find" },
        body: {
          nl: "Elke pagina krijgt een duidelijke titel en beschrijving, ik vertel Google wat je doet en waar je werkt, en ik help je met je Google Bedrijfsprofiel.",
          en: "Every page gets a clear title and description, I tell Google what you do and where you work, and I help you set up your Google Business Profile.",
        },
      },
      {
        title: { nl: "Goed op mobiel", en: "Good on mobile" },
        body: {
          nl: "Ik bouw eerst voor de telefoon en controleer elke pagina op telefoon en laptop.",
          en: "I design for the phone first and check every page on both phone and laptop.",
        },
      },
    ],
    example: {
      nl: "Deze website, pimwork.nl, heb ik zelf ontworpen en gebouwd. Hij werkt in het Nederlands en het Engels, in licht en donker, en ik heb hem zelf vindbaar gemaakt voor Google.",
      en: "I designed and built this website, pimwork.nl, myself. It works in Dutch and English, in light and dark mode, and I did the work to make it findable in Google myself.",
    },
    sampleSites: true,
    proof: [],
    extra: {
      service: "offertesoftware",
      body: {
        nl: "Voor vakmensen: met OfferteVlot maak je in een paar minuten een nette offerte als PDF. Die kan ik ook voor jouw bedrijf inrichten.",
        en: "For tradespeople: with OfferteVlot you can make a professional PDF quote in a few minutes. I can set it up for your business too.",
      },
    },
    closing: {
      title: { nl: "Wil je een website die je klanten wel vinden?", en: "Want a website your customers can actually find?" },
      body: {
        nl: "Vertel me wat je doet en waar je werkt. Dan laat ik zien wat ik voor je kan maken.",
        en: "Tell me what you do and where you work, and I'll show you what I could make for you.",
      },
    },
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/** The first sentence of the intro: the short summary on cards. */
export function serviceSummary(service: Service, lang: keyof Bilingual<string>): string {
  const intro = service.intro[lang];
  const match = intro.match(/^.+?[.?!](?=\s|$)/);
  return match ? match[0] : intro;
}
