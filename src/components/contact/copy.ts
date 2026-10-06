import type { Bilingual } from "@/i18n/config";
import type { ContactField, FieldErrorCode } from "@/lib/contact-schema";

/**
 * All visible text of the contact page. Error messages are keyed by the short codes
 * of the shared schema, so the browser and the server speak the same words.
 */
export const contactCopy = {
  title: { nl: "Contact", en: "Contact" },
  lead: {
    nl: "Heb je een idee, een vraag of een probleem waar software bij kan helpen? Stuur me een bericht.",
    en: "Do you have an idea, a question or a problem that software could help with? Send me a message.",
  },
  alt: {
    heading: { nl: "Liever zonder formulier", en: "Rather without a form" },
    body: {
      nl: "Je kunt me ook gewoon bellen of mailen.",
      en: "You can also just call or email me.",
    },
    call: { nl: "Bel me", en: "Call me" },
    mail: { nl: "Mail me", en: "Email me" },
  },
  formLabel: { nl: "Contactformulier", en: "Contact form" },
  fields: {
    name: {
      label: { nl: "Naam", en: "Name" },
      placeholder: { nl: "Hoe mag ik je noemen?", en: "What should I call you?" },
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
      too_long: { nl: "Je naam mag hoogstens 100 tekens zijn.", en: "Your name can be 100 characters at most." },
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
    rate_limited: {
      title: { nl: "Even wachten", en: "Please wait a moment" },
      body: {
        nl: (wait: string) => `Er zijn kort na elkaar veel berichten verstuurd. Je bericht is niet verstuurd. Probeer het over ${wait} opnieuw, of bel of mail me.`,
        en: (wait: string) => `Many messages were sent in a short time. Your message was not sent. Try again in ${wait}, or call or email me.`,
      },
    },
    network: {
      title: { nl: "Geen verbinding", en: "No connection" },
      body: {
        nl: "Je bericht kon de server niet bereiken en is niet verstuurd. Je tekst staat er nog. Controleer je verbinding en probeer het opnieuw, of bel of mail me.",
        en: "Your message could not reach the server and was not sent. Your text is still here. Check your connection and try again, or call or email me.",
      },
    },
    expired: {
      title: { nl: "Het formulier is verlopen", en: "The form has expired" },
      body: {
        nl: "Deze pagina staat al langer dan een dag open. Kopieer je tekst, ververs de pagina en verstuur opnieuw. Bellen of mailen kan ook.",
        en: "This page has been open for more than a day. Copy your text, reload the page and send it again. Calling or emailing works too.",
      },
    },
    failed: {
      title: { nl: "Je bericht is niet verstuurd", en: "Your message was not sent" },
      body: {
        nl: "Er ging iets mis bij het versturen. Je tekst staat er nog, dus je kunt het zo nog een keer proberen. Lukt het niet, bel of mail me dan gerust.",
        en: "Something went wrong while sending. Your text is still here, so you can try again in a moment. If it still fails, feel free to call or email me.",
      },
    },
  },
  wait: {
    nl: (seconds: number) => (seconds < 60 ? `${seconds} seconden` : `${Math.ceil(seconds / 60)} ${Math.ceil(seconds / 60) === 1 ? "minuut" : "minuten"}`),
    en: (seconds: number) => (seconds < 60 ? `${seconds} seconds` : `${Math.ceil(seconds / 60)} ${Math.ceil(seconds / 60) === 1 ? "minute" : "minutes"}`),
  },
  success: {
    title: { nl: "Bedankt, je bericht is verstuurd", en: "Thank you, your message has been sent" },
    body: {
      nl: "Ik reageer zo snel mogelijk, op het e-mailadres dat je opgaf.",
      en: "I will reply as soon as I can, to the email address you gave.",
    },
    again: { nl: "Nog een bericht", en: "Another message" },
  },
};
