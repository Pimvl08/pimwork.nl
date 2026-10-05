# Benchmark report

How this site was built with Claude Code, which capabilities of the environment were used, and an honest self-assessment. Only what actually happened is listed; counts come from the session and the agents' own transcripts.

## Timeline in short

1. **Research.** Inventory of skills, plugins and MCP servers; Pim's memory notes and project folders; a workflow of 8 read-only agents that collected verified facts per project.
2. **Direction.** The Impeccable skill: a product interview (4 questions), a seeded concept roll, a visual decision page in the browser. Pim re-rolled once ("kakker stijl, netjes en chic") and chose "Gevouwen Schaal", with dark graphite as the default theme.
3. **First build.** Foundation by hand (tokens, CSP proxy, i18n, content, primitives, geometry), then 10 builder agents. The account's usage limit cut the first attempts off several times; the build was restructured to a compact brief and at most 3 to 4 agents at a time.
4. **Pim's redirect.** A professional site to introduce himself to businesses and people: first person, multi-page, fewer and only relevant projects, no AI chatbot, no cursor ring, no dates or costs, Claude Code only in "Hoe ik werk". Content rewritten by hand; 3 agents rebuilt the structure.
5. **Quality.** Visual QA on four device sizes and both themes, a new Playwright and axe suite, Lighthouse, security checks, and the Impeccable finish review with an independent reviewer, one fix batch, a verdict pass and DESIGN.md.

## Skills found

The environment offers roughly 70 local skills (design, animation, marketing, CRO, SEO, testing), the claude.ai skills (docx, pdf, xlsx, pptx, react-pdf, frontend-design, hallmark, playwright-browser-automation, humanizer and more) and plugin skills (Bright Data, marketing, pdf-viewer, mcpmarket).

## Skills actually used

| Skill | Used by | For |
|---|---|---|
| plugin-check | main session | First check for an installed tool that fits the task (as Pim's own skill requires) |
| impeccable | main session, 2 shipped Impeccable agents | Product record, concept roll, decision page, direction contract, craft floor, design detector, finish review, verdict, provenance, DESIGN.md |
| workflow-authoring | main session | Orchestrating the multi-agent workflows |
| emil-design-eng | builder agents (17 loads, across restarts) | Interaction and motion craft for chrome, hero, about and work |
| animate | builder agents (10 loads) | Motion in the hero and the 3D lab |
| find-animation-opportunities | work builder (3 loads) | Project index hover and transitions |
| animation-vocabulary | lab builder (2 loads) | Lab experiments |
| playwright-cli | media builder | Capturing real screenshots and recordings |
| dataviz | data builder | Charts of measured disk data (later removed at Pim's request) |
| ask-sonner | terminal builder (3 loads) | Toast patterns for the hidden extras |
| claude-api | main session | Correct API usage for the AI terminal (later removed at Pim's request) |
| react-pdf | main session | The downloadable portfolio PDF |

## MCP servers and connectors used

| MCP | Used for |
|---|---|
| Claude Browser (built-in browser pane) | Running the dev server preview, the Impeccable decision page, console checks |
| ccd_session_mgmt (get_usage) | Checking usage and context after the usage limit stopped the agents |
| impeccable decision server (local, started by the skill) | The visual direction choice Pim made in the browser |

## Tools used

Bash, Read, Write, Edit, Workflow (7 workflow runs, 38 agent runs in total), AskUserQuestion (2 rounds), Skill, ToolSearch, TaskStop, ListSkills, ListPlugins, SearchPlugins, the Impeccable CLI (context, concept-seed, serve-question, surface-brief, detect, embed-prompt), Playwright 1.63 with Google Chrome and axe-core, Lighthouse 13, Vitest, ffmpeg and sips (media), PyMuPDF (rendering coloring-book plates and checking the PDF), git.

## Libraries and frameworks

Runtime: Next.js 16.3, React 19.2, TypeScript 5, Tailwind CSS 4, motion 14, three 0.186, zod 4.
Build and test: Vitest 5, Testing Library, Playwright, @axe-core/playwright, @react-pdf/renderer, tsx, ESLint.
Removed again: lenis (smooth scroll, felt laggy), @anthropic-ai/sdk (the AI terminal was dropped).

## Which technology made which part

| Part | Technology |
|---|---|
| Visual world, tokens, both themes | Impeccable direction process, CSS custom properties, Tailwind 4 |
| Folding paper shell on the home page | Raw WebGL2 with own shaders; geometry in `src/lib/crease.ts` (unit tested) |
| 3D lab experiment | three.js, loaded only on demand |
| Physics lab experiment | Own 2D physics engine (unit tested) |
| Particles, compass drawings, letters with weight | Canvas and WebGL, Bodoni Moda variable axes |
| Project sheets | Next.js intercepting routes and React ViewTransition |
| Reveals | CSS scroll-driven animations |
| Command palette | Own command engine with typed output (XSS-safe) |
| Contact form | zod schema shared by client and route handler, rate limiting, origin and timing checks |
| Security | Per-request nonce CSP in `src/proxy.ts`, headers in `next.config.ts` |
| Screenshots and recordings | Playwright and ffmpeg, from Pim's own apps |
| Portfolio PDF | @react-pdf/renderer with local OFL fonts |
| DESIGN.md | Impeccable documenter agent, derived from the shipped code |

## Found in the environment, built without being asked

1. **A visual decision page.** Impeccable's concept roll and browser decision page let Pim choose the world himself instead of getting a default.
2. **Real media from his own apps.** Screenshots and a screen recording captured from his actual projects with Playwright and ffmpeg, coloring-book plates rendered from his own pipeline with PyMuPDF, and the origin embedded in every image file.
3. **A portfolio PDF** in both languages, generated from the same content as the site, to send to a company.
4. **Measured data from his disk** (lines of code, tests, commit weeks per project). Built and working, then removed because Pim found it not relevant.

## Not used, and why

| Capability | Reason |
|---|---|
| Higgsfield | Pim asked not to use it (it also disconnected during the session) |
| B12 Website Generator | Generates a template site hosted by a third party; the opposite of this custom build |
| Canva image generation | Would create imagery that looks real but is not; real screenshots were preferred |
| Figma MCP | No Figma files for this project |
| 21st.dev magic MCP | Failed to connect: its API key is missing or expired |
| Marketing plugin connectors (Canva, Figma, Notion, Slack, HubSpot and more) | Need authorization in claude.ai first |
| Supabase MCP | The site needs no database |
| Gmail, Apple Notes, Drafts, Word, PDF Tools, Market Data | Not relevant; personal notes and mail were deliberately not read |
| Playwright MCP and Claude in Chrome | Headless Chrome scripts were more reliable for repeatable screenshots (see the memory note about the browser pane) |
| brag / brag-slim launch video | Skipped because of the usage limits and Pim's shift to a professional site; can be made later |
| Axe Accessibility and securitymaxxing plugins | Found in the plugin catalog but not installed; axe-core was used directly |

## Honest notes

- The account's 5-hour usage limit stopped the agents several times. In the first night no file was written in about nine hours, because ten heavy agents read the whole codebase before writing. The fix was a compact brief, fewer agents at once, and agents that continue from what is already on disk.
- Strength Tracker shows a mechanism diagram instead of screenshots: real screens of the app need Pim's own login.
- The contact form only sends once a Resend key is set on the server; until then it says so.

## Self-assessment

| Part | Score | Why |
|---|---:|---|
| Design | 8/10 | A distinctive, coherent world kept through a full restructure and checked by an independent reviewer. Strength Tracker still lacks real product images. |
| Animations | 7/10 | The WebGL shell, folds, view transitions and scroll-driven reveals are purposeful. Several effects were removed on request; smoothness on real phones was not measured. |
| UX | 8/10 | Clear pages, short home page, every project tells problem, solution and result. Contact delivery is still off. |
| Responsiveness | 8/10 | Tested on four device profiles with overflow checks at 360 to 1440 px. |
| Performance | 8/10 | Desktop 99 to 100, mobile 77 to 93 on a 2017 Intel host; the WebGL start is deferred to idle time. |
| Accessibility | 9/10 | Lighthouse 100 on all pages, no serious axe violations, keyboard and reduced motion covered. Not tested with a real screen reader. |
| Security | 9/10 | Strict nonce CSP, headers, validated and rate-limited API, no runtime vulnerabilities. Rate limiting is per server instance. |
| Code quality | 8/10 | Strict TypeScript, clean lint, 148 unit tests and 288 end-to-end tests on desktop and phone (552 across four profiles). Built by many agents, so style varies a little. |
| Creativity | 8/10 | An own visual language derived from a curved paper fold, not a template. |
| Tool and skill usage | 7/10 | Many skills, agents and tools used for real, but the usage limit cost a lot of time and some capabilities were skipped. |
