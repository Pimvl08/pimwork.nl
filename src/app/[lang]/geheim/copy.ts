export const secretCopy = {
  nl: {
    meta: "Plaat 99",
    title: "Het verborgen blad",
    lead: "Deze plaat staat niet in het rijtje van 00 tot en met 07. Hier ligt bij wat er op de site verstopt zit, en wat jij al gevonden hebt.",
    found: "Gevonden",
    hidden: "Nog verborgen",
    progress: (n: number, total: number) => `${n} van ${total} gevonden`,
    note: "Wat je vindt, onthoudt alleen jouw browser. Er gaat niets naar een server.",
    back: "Terug naar de omslag",
    terminal: "Open de terminal",
  },
  en: {
    meta: "Plate 99",
    title: "The hidden sheet",
    lead: "This plate is not in the row from 00 to 07. It keeps track of what is hidden on the site, and what you have already found.",
    found: "Found",
    hidden: "Still hidden",
    progress: (n: number, total: number) => `${n} of ${total} found`,
    note: "What you find is remembered by your browser only. Nothing goes to a server.",
    back: "Back to the cover",
    terminal: "Open the terminal",
  },
};
