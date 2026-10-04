# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Pim asked for "the best technology for the problem". Chosen: Next.js 16 (App Router) with React 19 and TypeScript, because the site needs real server code (a validated, rate limited contact endpoint and an optional AI endpoint that keeps API keys off the client), per-request CSP nonces, file-based routes for project pages, and route-level code splitting for heavy WebGL experiments. Tailwind CSS 4 for tokens and layout. Heavy 3D (three.js) only loads inside the experiment that needs it.

## Users

Pim's own showcase (confirmed 2026-10-04: "puur showcase"). The visitor is a friend, classmate, teacher or curious developer who opens the link Pim shares, usually on a phone first and later on a laptop, to see what Pim builds with AI and code. Secondary: Pim himself, who uses the site as a benchmark of what Claude Code can produce in his environment.

## Product Purpose

A personal website about Pim that doubles as a technical showcase. Success: a visitor leaves knowing who Pim is, what he has actually built, and that he can make demanding interactive web work; and Pim can point to every feature as working, tested code.

## Positioning

Every project, number and image on the site comes from Pim's own disk: real repositories, real git history, real measurements (Lighthouse scores, transcription error rates, test counts). A template portfolio or another developer could not truthfully copy that material.

## Operating Context

- Pim builds with Claude Code on a 2017 Intel MacBook Pro (i7-7820HQ, macOS Ventura). Many hard problems in his projects came from that machine (Whisper speed, Homebrew Tier 3).
- Shared as a link via chat apps, so the first visit is often on mobile.
- Bilingual: Dutch default with a real switch to English (confirmed).
- Contact: a contact form with server-side validation and rate limiting plus a GitHub link (github.com/pimdaanbram-prog). Mail delivery only goes live once Pim adds a mail API key in the environment; until then the form says so honestly (confirmed).

## Capabilities and Constraints

- Only Pim's own projects are shown with name and screenshots (confirmed): Strength Tracker, CapCraft, PaletteForge, TeamSync, Belhulp, Solana Forensics, Offerte PDF Generator, KDP Kleurboek. Client pitches and school assignments are not named.
- No invented personal facts. Missing facts (photo of Pim, location, age, school name) stay open and get clearly marked, easy-to-fill slots.
- No secrets in the repository or client bundle. Never publish e-mail addresses, phone numbers, client or campaign names, wallet addresses or internal ids from project folders.
- Must respect prefers-reduced-motion, keyboard use and screen readers.
- Undecided: final domain and hosting (Netlify and Vercel are both used in his other projects); whether to wire a real LLM to the AI terminal (only when Pim adds a key server-side).

## Brand Commitments

- Never use the em dash or en dash anywhere: UI copy, code comments, docs (standing rule from Pim). Use commas, colons, periods, parentheses, a middle dot (·) in meta lines and a vertical bar in page titles.
- Name shown as "Pim". GitHub handle: pimdaanbram-prog.

## Evidence on Hand

- Project folders under ~/Documents/claude code, ~/Documents/Belhulp and ~/Projects/KDP-kleurboek, with READMEs, docs, git history and real assets (KDP cover and interior plates, design handoff screenshots).
- Live public app: https://strengttracker.netlify.app and public repos on github.com/pimdaanbram-prog.
- Measured numbers from his own notes: CapCraft Lighthouse 98 to 100 desktop, CLS 0.21 to 0.002; Belhulp Whisper small 9.6% word errors with term list vs 17.8% without; TeamSync 14 vitest, 29 Rust unit, 12 integration and 42 pgTAP tests.
- Absent and not to be fabricated: photos of Pim, testimonials, client logos, employment history, awards, follower counts.

## Product Principles

1. Prove, don't claim: each claim on the site links to a real project, number or working demo.
2. Every interaction does something real; nothing that looks functional is a mock.
3. Honest gaps beat invented filler: an open slot is labelled as open.
4. Fast and calm by default, spectacular on intent: heavy effects load when the visitor asks for them.
5. Pim's voice: direct, Dutch-first, a bit nerdy, never salesy.

## Accessibility & Inclusion

WCAG 2.2 AA as the floor: full keyboard navigation (including the terminal and experiments), visible focus, reduced-motion alternatives for every heavy animation, text alternatives for canvas and WebGL experiments, and sufficient contrast in both themes.
