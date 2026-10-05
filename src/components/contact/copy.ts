import type { Bilingual } from "@/i18n/config";
import type { ContactField, FieldErrorCode } from "@/lib/contact-schema";

/**
 * All visible text of plate 07. Error messages are keyed by the short codes
 * of the shared schema, so the browser and the server speak the same words.
 */
export const contactCopy = {
  title: { nl: "Contact", en: "Contact" },
  lead: {
    nl: "Schrijf Pim een bericht, over een project, een vraag of een idee.",
    en: "Write Pim a message, about a project, a question or an idea.",
  },
  alt: {
    heading: { nl: "Liever zonder formulier", en: "Rather without a form" },
    body: {
      nl: "Al zijn projecten staan op GitHub. Daar kun je hem ook vinden.",
      en: "All his projects live on GitHub. You can find him there too.",
    },
    button: { nl: "Pim op GitHub", en: "Pim on GitHub" },
  },
  formLabel: { nl: "Contactformulier", en: "Contact form" },
  fields: {
    name: {
      label: { nl: "Naam", en: "Name" },
      placeholder: { nl: "Hoe mag Pim je noemen", en: "What should Pim call you" },
    },
    email: {
      label: { nl: "E-mail", en: "Email" },
      placeholder: { nl: "naam@voorbeeld.nl", en: "name@example.com" },
    },
    message: {
      label: { nl: "Bericht", en: "Message" },
      placeholder: { nl: "Waar gaat het over?", en: "What is it about?" },
    },
  } satisfies Record<ContactField, { label: Bilingual<string>; placeholder: Bilingual<string> }>,
  honeypot: { nl: "Website (laat leeg)", en: "Website (leave empty)" },
  counter: {
    nl: (count: number, max: number) => `${count} van ${max} tekens`,
    en: (count: number, max: number) => `${count} of ${max} characters`,
  },
  errors: {
    name: {
      required: { nl: "Vul je naam in.", en: "Fill in your name." },
      too_short: { nl: "Vul je naam in.", en: "Fill in your name." },
      too_long: { nl: "Je naam mag hoogstens 80 tekens zijn.", en: "Your name can be 80 characters at most." },
      invalid: { nl: "Je naam bevat tekens die niet kunnen.", en: "Your name contains characters that are not allowed." },
    },
    email: {
      required: { nl: "Vul je e-mailadres in.", en: "Fill in your email address." },
      too_short: { nl: "Vul je e-mailadres in.", en: "Fill in your email address." },
      too_long: { nl: "Je e-mailadres mag hoogstens 120 tekens zijn.", en: "Your email address can be 120 characters at most." },
      invalid: { nl: "Dit lijkt geen geldig e-mailadres, bijvoorbeeld naam@voorbeeld.nl.", en: "This does not look like a valid email address, for example name@example.com." },
    },
    message: {
      required: { nl: "Schrijf een bericht.", en: "Write a message." },
      too_short: { nl: "Je bericht moet minstens 10 tekens zijn.", en: "Your message needs at least 10 characters." },
      too_long: { nl: "Je bericht mag hoogstens 2000 tekens zijn.", en: "Your message can be 2000 characters at most." },
      invalid: { nl: "Je bericht bevat tekens die niet kunnen.", en: "Your message contains characters that are not allowed." },
    },
  } satisfies Record<ContactField, Record<FieldErrorCode, Bilingual<string>>>,
  summary: {
    title: {
      nl: (n: number) => (n === 1 ? "Eén veld vraagt nog aandacht" : `${n} velden vragen nog aandacht`),
      en: (n: number) => (n === 1 ? "One field still needs attention" : `${n} fields still need attention`),
    },
  },
  submit: { nl: "Verstuur", en: "Send" },
  submitting: { nl: "Bezig met versturen", en: "Sending" },
  notices: {
    not_configured: {
      title: { nl: "Verzenden staat nog uit", en: "Sending is switched off for now" },
      body: {
        nl: "Verzenden staat nog uit: er is nog geen mailkoppeling ingesteld. Je bericht is niet verstuurd. Bereik Pim via GitHub.",
        en: "Sending is switched off for now: no mail connection has been set up yet. Your message was not sent. Reach Pim through GitHub.",
      },
    },
    rate_limited: {
      title: { nl: "Even wachten", en: "Please wait a moment" },
      body: {
        nl: (wait: string) => `Er zijn kort na elkaar veel berichten verstuurd. Je bericht is niet verstuurd. Probeer het over ${wait} opnieuw.`,
        en: (wait: string) => `Many messages were sent in a short time. Your message was not sent. Try again in ${wait}.`,
      },
    },
    network: {
      title: { nl: "Geen verbinding", en: "No connection" },
      body: {
        nl: "Je bericht kon de server niet bereiken en is niet verstuurd. Controleer je verbinding en probeer het opnieuw. Je tekst staat er nog.",
        en: "Your message could not reach the server and was not sent. Check your connection and try again. Your text is still here.",
      },
    },
    too_fast: {
      title: { nl: "Dat ging erg snel", en: "That was very quick" },
      body: {
        nl: "Het formulier werd binnen een paar seconden verstuurd, zo snel typt bijna niemand. Wacht even en verstuur opnieuw.",
        en: "The form was sent within a few seconds, almost nobody types that fast. Wait a moment and send it again.",
      },
    },
    expired: {
      title: { nl: "Het formulier is verlopen", en: "The form has expired" },
      body: {
        nl: "Deze pagina staat al langer dan een dag open. Kopieer je tekst, ververs de pagina en verstuur opnieuw.",
        en: "This page has been open for more than a day. Copy your text, reload the page and send it again.",
      },
    },
    failed: {
      title: { nl: "Niet verstuurd", en: "Not sent" },
      body: {
        nl: "Er ging iets mis bij het versturen. Je bericht is niet aangekomen. Probeer het later opnieuw of bereik Pim via GitHub.",
        en: "Something went wrong while sending. Your message did not arrive. Try again later or reach Pim through GitHub.",
      },
    },
  },
  wait: {
    nl: (seconds: number) => (seconds < 60 ? `${seconds} seconden` : `${Math.ceil(seconds / 60)} ${Math.ceil(seconds / 60) === 1 ? "minuut" : "minuten"}`),
    en: (seconds: number) => (seconds < 60 ? `${seconds} seconds` : `${Math.ceil(seconds / 60)} ${Math.ceil(seconds / 60) === 1 ? "minute" : "minutes"}`),
  },
  success: {
    title: { nl: "Dank je, je bericht is verstuurd", en: "Thank you, your message has been sent" },
    body: {
      nl: "Het staat nu in de mailbox van Pim. Een antwoord komt op het e-mailadres dat je opgaf.",
      en: "It is now in Pim's inbox. A reply will go to the email address you gave.",
    },
    again: { nl: "Nog een bericht", en: "Another message" },
  },
  github: { nl: "GitHub", en: "GitHub" },
};
