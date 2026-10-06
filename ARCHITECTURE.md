# Architecture

## Overview

A Next.js 16 App Router site with one root layout per language (`src/app/[lang]/layout.tsx`). There is no `src/app/layout.tsx`: the language segment is the root, so `<html lang>` is always correct, and a `global-not-found.tsx` handles URLs that match nothing.

Every request first passes `src/proxy.ts`:

1. Paths without a language prefix are redirected to `/nl` or `/en` (cookie `pim-lang` first, then `Accept-Language`, Dutch as default).
2. A fresh nonce is generated and a strict Content-Security-Policy is set. Next.js reads the nonce from the request header and attaches it to its own scripts. Because of the nonce, pages render per request (`await connection()`).

## Pages and routing

| Route | File | Notes |
|---|---|---|
| `/<lang>` | `app/[lang]/page.tsx` | Hero, featured work, services, about teaser, contact band |
| `/<lang>/werk` | `app/[lang]/werk/page.tsx` | Index of all projects |
| `/<lang>/werk/<slug>` | `app/[lang]/werk/[slug]/page.tsx` | Full project page, `generateStaticParams` and metadata per project |
| (sheet) | `app/[lang]/@modal/(.)werk/[slug]/page.tsx` | Intercepting route: the same project as a sheet when opened from a link; direct visits get the full page |
| `/<lang>/over`, `/lab`, `/contact` | `app/[lang]/*/page.tsx` | About, lab and contact |
| `/<lang>/geheim` | `app/[lang]/geheim/page.tsx` | Hidden page, `noindex` |
| `/api/contact` | `app/api/contact/route.ts` | Contact endpoint (POST only) |
| metadata | `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.svg`, `apple-icon.tsx`, `[lang]/opengraph-image.tsx` | |

## Component structure

Components are grouped by feature in `src/components/<feature>/`. Each feature keeps its own `copy.ts` (bilingual text that is not content), its CSS module, and, where there is logic, a `logic.ts` with pure functions that are unit tested.

- `ui/` holds the shared primitives of the visual world: `ArchButton` (arched top edge), `CircleButton`, `ArcRule` (hairline compass arcs), `PlateHeading`, `ArcCard`, `CreaseMark` (the logo), `Icon` (one authored icon set).
- `chrome/` wraps every page: header with page navigation, language switch and theme toggle, the arched mobile bar with its menu sheet, footer, keyboard shortcuts, and the mount points for the command palette and the hidden extras (both loaded lazily with `next/dynamic`).
- Server components render content; client components are used only where there is interaction (`"use client"` at the top).

## Content and data

There is no database. All content is typed TypeScript in `src/content/`:

- `projects.ts`: the projects, with bilingual fields (`Bilingual<T> = { nl: T; en: T }`).
- `person.ts`: facts (null facts are hidden), services, and the about page text.
- `media.ts`: screenshots and recordings per project, each with dimensions, alt text and the exact source it was captured from. Files live in `public/media/`.
- `sections.ts`: the page registry used by navigation, shortcuts and the command palette.

Copy that is part of the interface (button labels, headings) lives next to the component in `copy.ts`, selected with `pick(copy, lang)` on the server or `useCopy(copy)` on the client.

## State management

Almost all state is local to a component. The few things shared across the page live in a 20-line store (`src/lib/store.ts`) built on `useSyncExternalStore`: whether the command palette is open (and a command to run when it opens), whether the shortcut sheet is open, the theme, and which hidden extras a visitor found. Components subscribe through a selector so only what changes re-renders. No state library is needed.

Preferences persist in two first-party cookies (`pim-theme`, `pim-lang`), so the server renders the right theme and language on the first byte.

## Theme

`<html data-theme="dark|light">` switches every CSS custom property in `src/app/globals.css`. Tailwind 4 maps semantic colour names (`bg-paper`, `text-ink`, `border-rule`, ...) to those variables, so components never contain colours. WebGL and canvas code read the same tokens (`readGlColor` in `src/lib/theme.ts`) and listen for a `pim:theme` event. Switching uses the View Transitions API: the new paper unfolds as a circle from the toggle.

## Animation

One motion grammar: paper unfolding from a crease and arcs being drawn, with exponential ease-out.

- **CSS first.** Reveals and arc drawing use scroll-driven animations (`animation-timeline: view()`), so content is visible without JavaScript and in browsers without support.
- **motion** handles interface transitions (sheets, folds of the hero line).
- **Raw WebGL2** renders the home page shell: a disc folded along one curved crease. The geometry (`src/lib/crease.ts`) is pure math shared with the 3D lab experiment and unit tested (paper keeps its length across the fold).
- **three.js** runs only in the 3D lab experiment and is imported when that experiment opens.
- Every animation loop stops when it is off screen or the tab is hidden, the device pixel ratio is capped, GPU resources are disposed on unmount, and `prefers-reduced-motion` gets a calm or static version.

## Integrations

- **Resend** delivers contact messages through the `resend` SDK (`src/lib/mail.ts`): subject "Nieuw bericht via pimwork.nl van {naam}", reply-to set to the visitor, plain text plus escaped HTML. Nothing is stored and no confirmation goes to the visitor. Without its keys the endpoint logs the missing variable names and answers `500 server_error`; the form then suggests calling or emailing. A filled honeypot or a form sent within 3 seconds gets a quiet `200` and nothing is sent.
- No other external services, scripts, fonts or images are loaded by the browser. Fonts are self-hosted through `next/font`.

## Security

Covered in [SECURITY.md](SECURITY.md): per-request CSP with nonces, security headers, validation and rate limiting on the API, no secrets in the client, typed output instead of HTML strings, privacy-friendly preferences.

## Testing

- `tests/unit/`: pure logic (geometry, physics engine, command engine, rate limiter, schema and escaping, page logic). Vitest.
- `tests/e2e/`: Playwright against a running server on four device profiles (desktop, laptop, tablet, phone): pages and headers, navigation, theme and language, home, work and project sheets, about, lab, command palette, contact (including API abuse cases), hidden extras, responsive overflow, and axe accessibility scans.
- `scripts/shot.mjs`: a screenshot helper used during development for visual checks in both themes and on phones.

## Portfolio PDF

`scripts/catalogue.tsx` renders `public/portfolio-pim-nl.pdf` and `public/portfolio-pim-en.pdf` with `@react-pdf/renderer` from the same content files, using local static instances of the site's fonts (`assets/fonts`, SIL OFL). Run `npm run catalogue` after content changes.
