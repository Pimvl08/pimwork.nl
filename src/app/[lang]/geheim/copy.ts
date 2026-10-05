export const secretCopy = {
  nl: {
    meta: "Het verborgen blad",
    title: "Het verborgen blad",
    lead: "Deze pagina staat niet in het menu. Hier houd ik bij wat er op de site verstopt zit, en wat jij al gevonden hebt.",
    found: "Gevonden",
    hidden: "Nog verborgen",
    progress: (n: number, total: number) => `${n} van ${total} gevonden`,
    note: "Wat je vindt, onthoudt alleen jouw browser. Er gaat niets naar een server.",
    back: "Terug naar de homepagina",
    terminal: "Open de terminal",
  },
  en: {
    meta: "The hidden sheet",
    title: "The hidden sheet",
    lead: "This page is not in the menu. Here I keep track of what is hidden on the site, and what you have already found.",
    found: "Found",
    hidden: "Still hidden",
    progress: (n: number, total: number) => `${n} of ${total} found`,
    note: "What you find is remembered by your browser only. Nothing goes to a server.",
    back: "Back to the home page",
    terminal: "Open the terminal",
  },
};
