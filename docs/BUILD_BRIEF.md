# Build brief (read this instead of the whole codebase)

Project root: `/Users/pimvanleeuwen/Documents/claude code/pim-world`. Personal site of **Pim**, a showcase of what he builds with code and AI. Dutch first, English second. Visitors: friends, classmates, teachers, curious developers, phone first.

## Stack
Next.js 16.3 App Router (`src/proxy.ts`, not middleware; route `params` are Promises; global type helpers `PageProps<'/[lang]'>` and `LayoutProps`; `ViewTransition` is imported from `react`), React 19.2, TypeScript strict, Tailwind CSS 4, `motion` v14 (`import { motion } from "motion/react"`), `lenis`, `three` r186, `zod` 4, `@anthropic-ai/sdk`. Before using a Next.js API you have not used before, read its doc under `node_modules/next/dist/docs/` (this Next differs from training data). Pages render per request (CSP nonce): page components call `await connection()` from `next/server`.

## The world: "Gevouwen Schaal" (binding)
One line makes the form. Graphite paper by night (default theme), cotton paper by day, via `<html data-theme="dark|light">`. Monochrome: the crease ink is the only ink that marks the active element; graphite shading only on curved surfaces. Layout ruled by sweeping compass arcs, arched-top buttons and cards, circle-arrow buttons, numbered plates. Motion: paper unfolding from a crease, arcs being drawn, exponential ease-out. Quality bar images: `.impeccable/quality-bar/*.png` (look once if you build visible UI).

### Tokens (only use these; never hardcode hex in components)
Tailwind colours: `bg-paper` `bg-raised` `bg-sunk` `text-ink` `text-ink-soft` (body) `text-ink-mute` (secondary, AA) `text-ink-faint` (decorative/large only) `border-rule` `border-rule-strong` `text-on-ink` (text on ink fills) `bg-shade-1/2/3`.
CSS vars: `--paper --paper-raised --paper-sunk --ink --ink-soft --ink-mute --ink-faint --rule --rule-strong --shade-1..3 --highlight --on-ink`; WebGL triples `--gl-paper --gl-sheet --gl-ink` ("r g b" 0..1, read with `readGlColor(name)` from `@/lib/theme`, re-read on `window` event `pim:theme`). For canvas 2D read colours with `getComputedStyle(document.documentElement).getPropertyValue("--ink")` and re-read on `pim:theme`.
Type: `font-serif` = Bodoni Moda (default body font, variable opsz, italic available), `font-mono` = Fragment Mono (ONLY code, data, measurements, terminal). Scale vars: `--step--1 --step-0 --step-1 --step-2 --step-3 --step-4` (max 6rem) and `--step-name` (the hero name only). Use like `text-[length:var(--step-3)]`. Classes: `label` (italic tracked capitals), `numeral`, `data` (mono tabular), `measure` (66ch), `plate` (section padding incl. left rail), `unfold` (scroll-driven unfold reveal, CSS only), `arc-draw` (on an SVG path with pathLength=1: draws on scroll).
Easings: `var(--ease-out-expo)` `var(--ease-paper)` `var(--ease-crease)`; durations `--dur-1..5` (160, 260, 420, 700, 1100 ms). Spacing: `--gutter`, `--rail`, `--section-y`.

### Primitives (import, do not re-implement)
- `@/components/ui/ArchButton`: `<ArchButton variant="primary|secondary" size="md|lg" icon?="arrowSE" href? onClick? cursor?="Bekijk">label</ArchButton>`; href internal uses next/link, external opens safely.
- `@/components/ui/CircleButton`: `<CircleButton icon="terminal" label="Accessible name" size="sm|md|lg" href? onClick? pressed? />`.
- `@/components/ui/Icon`: `<Icon name="arrowNE" size={20} title? />`. Names: arrowNE arrowSE arrowRight arrowLeft arrowDown close plus minus sun moon globe terminal play pause fullscreen exitFullscreen volume mute github chevronLeft chevronRight download reset mail command keyboard crease pin shuffle lock unlock.
- `@/components/ui/ArcRule`: decorative compass arc, `<ArcRule className="inset-0 ..." d? draw? />` (absolute positioned SVG, 0..1000 box).
- `@/components/ui/PlateHeading`: `<PlateHeading numeral="02" id? as? lead={sentence}>Werk</PlateHeading>` (numeral sits inside the heading; lead goes BELOW, never a label above).
- `@/components/ui/ArcCard`: card with arched top outline, `<ArcCard active?>...</ArcCard>`.
- `@/components/ui/CreaseMark`: the logo disc, `<CreaseMark size={32} title? />`.
- `@/components/ui/OpenSlot`: honest empty slot, `<OpenSlot lang what="Portret" compact? />`.

### Libraries
- `@/i18n/config`: `Locale` ("nl"|"en"), `Bilingual<T>` = `{ nl: T; en: T }`, `pick(copy, lang)`, `locales`, `isLocale`, `htmlLang`.
- `@/i18n/LocaleProvider`: client hooks `useLang()`, `useCopy(copy)`.
- `@/lib/store`: `uiStore.get/set/subscribe`, `useUI(selector)`, `unlockEgg(id)`. State: `terminalOpen`, `terminalSeed` (command to run on open), `shortcutsOpen`, `soundOn`, `introState` ("idle"|"playing"|"done"), `theme`, `eggs` (string[]).
- `@/lib/theme`: `applyTheme(theme, origin?)`, `toggleTheme(origin?)` (View Transition from the given point, cookie, store, `pim:theme` event), `readGlColor(name)`.
- `@/lib/scroll`: `scrollToSection(id)`, `registerScroller(lenis)`, `lockScroll(bool)`.
- `@/lib/locale`: `localizedPath(pathname, target)`. `@/lib/prefs`: `persistTheme`, `persistLocale`, `THEME_COOKIE`.
- `@/lib/hooks`: `useMediaQuery`, `useReducedMotion`, `useFinePointer`, `useMounted`, `useInView(ref, rootMargin?)`, `useVisible(ref)`.
- `@/lib/crease`: `buildShell(params, rings?, segments?)` returns `{ positions, normals, flat, creaseDistance, indices, vertexCount }`; `creaseLine(params)`; `defaultCrease`; `creaseStates` (flat, curving, stable, buckled, reversed); `mixCrease(a, b, t)`; `foldPoint`. Disc lies in x/y, z is up.
- `@/lib/rate-limit`: `createRateLimiter({ limit, windowMs })` returns `{ check(key) }` -> `{ ok, remaining, retryAfterMs }`.
- `@/lib/request-guard`: `clientKey(req)`, `isSameOrigin(req)`, `readJsonBody(req, maxBytes)` (throws `RequestError(status, code)`), `json(body, status, headers?)`.
- `@/lib/site`: `siteUrl()`. `@/lib/cn`: `cn(...)`.

### Content (the only source of facts)
- `@/content/projects`: `projects: Project[]` (8, in display order), `getProject(slug)`, `statusLabel`. Project: `slug name status("live"|"local"|"delivered") period{from,to} category short summary problem highlights[] hardProblems[] metrics[{label,value}] stack[] links[{label,href}]` (text fields are `Bilingual`).
- `@/content/person`: `person` (name, github, portrait null), `facts` (value null = open), `interests` (with evidence slug).
- `@/content/sections`: plates `cover about work lab media data machine contact`, numerals 00 to 07.
- `@/content/media`: `images`, `videos`, `imagesFor(slug)`, `videoFor(slug)` (filled by the media task; may be empty).

## Rules
- Copy: NEVER the em dash or en dash character, anywhere (UI, comments, docs, alt text). Use commas, colons, periods, parentheses, a middle dot or a hyphen. All visible text bilingual in a co-located `copy.ts` (`Bilingual<...>`). Natural Dutch, third person about Pim ("Pim bouwde"), calm, direct, slightly nerdy, never salesy. Never invent facts; missing facts use `<OpenSlot>`.
- Craft floor: no eyebrow above headings, no gradient text, no glass/blur decoration, no glow, no emoji or unicode icons, no grid of identical icon cards as page structure, no hero-metric row, no coloured border-left accents, no hard offset shadows, mono only for code/data. Every control: hover, focus-visible, active, disabled, plus loading/error/empty where relevant. Body text 65 to 75ch. Check contrast in both themes.
- Security: no secrets client-side, no `dangerouslySetInnerHTML`, no `eval`, all assets local (CSP: only self, data:, blob:), user input rendered as text, external links `rel="noopener noreferrer"`.
- Performance: heavy code lazy (`next/dynamic` ssr:false or dynamic import) and mounted near the viewport; rAF loops stop off-screen (`useVisible`) and when `document.hidden`; DPR cap 2 (canvas) / 1.75 (WebGL); animate transform/opacity/clip-path; dispose GPU resources on unmount.
- Accessibility: landmarks, headings, keyboard for everything, visible focus, aria where needed, text alternatives for canvas/WebGL, `useReducedMotion()` gives a calm or static version, targets at least 44px, works at 360px wide.
- Ownership: edit only your owned paths. Shared files (`globals.css`, `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx`, `src/content/*`, `src/components/ui/*`, `src/lib/*`, `src/i18n/*`, `package.json`) are read-only; put needed changes in `sharedChangesNeeded`.
- If your owned files already exist from an earlier interrupted attempt, read them and continue from them instead of starting over.

## Working method (keep it lean: the account has usage limits)
1. Read this brief, then ONLY the files you need (your stubs, the primitives you use, the content file you render). Do not read Next docs you do not need.
2. Write the code early. Prefer a few complete files over many tiny ones.
3. Verify: `npx tsc --noEmit -p .` (fix your errors), `npx eslint <your files>`, unit tests for pure logic in `tests/unit/<area>.test.ts` (`npx vitest run tests/unit/<area>.test.ts`).
4. Look at it once or twice, not more: the dev server runs at http://localhost:3100 (never start or stop servers, never `next build`). `node scripts/shot.mjs --url "http://localhost:3100/nl" --selector "#<section>" --out "<scratchpad>/shots/<name>.png" [--theme light] [--mobile] [--reduced] [--click "<selector>"] [--wait 2500]`, then Read the PNG. One desktop dark and one mobile light shot is usually enough. Fix what looks wrong, then stop.
5. Report honestly which skills and tools you used.
