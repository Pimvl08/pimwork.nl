# PimWork (pimwork.nl)

The website of PimWork, the one-person software business of Pim van Leeuwen: a professional introduction for businesses and people who want to know what he can build. Dutch first, with a full English version.

The site shows six real projects (TeamSync, Strength Tracker, OfferteVlot, Belhulp, a print-ready coloring book and Solana Forensics), what Pim can build for others, how he works, a lab with interactive experiments, and a contact form. Every text and image comes from his own project folders; nothing is invented.

## Start

Requirements: Node.js 22 or newer (developed on Node 24) and npm.

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

### Environment variables

All optional. Without them the site works fully; only contact delivery stays off and says so.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public base URL for canonical links, sitemap and social images |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Turn on real delivery of the contact form through Resend |

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm run start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:e2e` | End-to-end and accessibility tests (Playwright with Google Chrome, axe) |
| `npm run catalogue` | Regenerates the portfolio PDFs in `public/` from the same content |

## Technology

- **Next.js 16** (App Router, Turbopack) with **React 19** and **TypeScript** in strict mode
- **Tailwind CSS 4** with semantic design tokens, plus CSS modules per component
- **motion** for interface animation, CSS scroll-driven animations where supported
- **Raw WebGL2** for the folding paper shell on the home page (no 3D library on the first visit)
- **three.js** only inside the 3D lab experiment, loaded on demand
- **zod** for validation shared between the contact form and its API route
- **@react-pdf/renderer** (build time only) for the portfolio PDF
- **Vitest**, **Testing Library**, **Playwright** and **axe-core** for tests

## Features

- Six pages per language: home, work, a page per project, about, lab and contact, plus a hidden page for curious visitors.
- Project pages open as a sheet from links (intercepting routes with a shared-element view transition), and as full pages when visited directly.
- A folding paper disc in WebGL that follows the pointer or a finger, with a still frame for reduced motion.
- Five lab experiments: graphite particles that form words, a 3D shell you can turn and bend, a small physics engine with real technologies, generative compass drawings you can save as PNG or SVG, and letters with weight.
- Dark (graphite) and light (cotton) themes, stored in a cookie so the server renders the right one without a flash; the new theme unfolds from the button.
- A command palette with Ctrl+K (Cmd+K on a Mac) and keyboard shortcuts (press `?`).
- A contact form with server-side validation, rate limiting, honeypot and timing checks.
- A downloadable portfolio PDF in both languages.
- A strict Content-Security-Policy with a fresh nonce per request, and the usual security headers. See [SECURITY.md](SECURITY.md).

## Editing content

All text lives in `src/content/`:

- `projects.ts`: the six projects (problem, solution, benefits, how it is built, the hardest part, links).
- `person.ts`: facts about Pim, what he can build (`services`), and the about page text. Facts with value `null` are hidden; fill them in to show them. Set `person.portrait` to show a photo.
- `media.ts`: screenshots and recordings per project, each with its source.

After changing project or about text, run `npm run catalogue` to update the PDFs.

## Project structure

```
src/
  app/
    [lang]/                 root layout per language, home page
      werk/                 work index and project pages
      @modal/(.)werk/       the project sheet (intercepting route)
      over/ lab/ contact/   about, lab and contact pages
      geheim/               hidden page
    api/contact/            contact form endpoint
    sitemap.ts robots.ts manifest.ts icon.svg apple-icon.tsx
  components/
    chrome/                 header, footer, mobile navigation, shortcuts
    hero/                   home hero and the WebGL shell renderer
    home/                   home sections (services, about teaser, contact band)
    work/                   project index, featured work, project detail, diagrams
    media/                  lightbox, video player, project media
    about/ contact/ lab/    page components and the five experiments
    terminal/ easter/       command palette and hidden extras
    ui/                     shared primitives (buttons, arcs, icons, headings)
  content/                  all text and media metadata
  i18n/                     languages and the locale provider
  lib/                      store, theme, scroll, geometry, rate limiting, request guards
  proxy.ts                  language redirect and per-request CSP
scripts/                    screenshot helper, media capture, portfolio PDF
tests/unit, tests/component, tests/e2e
```

More detail: [ARCHITECTURE.md](ARCHITECTURE.md). Design decisions: [DESIGN.md](DESIGN.md) and [PRODUCT.md](PRODUCT.md).
