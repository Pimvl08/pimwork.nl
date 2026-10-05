# Security

This is a personal website, but it is built as if it were a production app. This file lists what is in place, how to keep it that way, and what the known risks are.

## Reporting a problem

Open an issue on GitHub (github.com/pimdaanbram-prog) with the label `security`, without including exploit details in public. Pim will move the conversation to a private channel.

## Secrets

- No secret is ever stored in the repository. `.env*` is ignored by git, only `.env.example` (empty values) is committed.
- The only optional secret (`RESEND_API_KEY`) is read **only in the server route handler** (`src/app/api/contact`). It is never prefixed with `NEXT_PUBLIC_`, so Next.js cannot inline it into client bundles.
- Without it the site still works: the contact form validates and says honestly that delivery is not configured.
- The site has no AI features and calls no AI service.
- Check before every release: `git grep -nE "sk-ant-|re_[A-Za-z0-9]{10,}|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY"` must return nothing, and `grep -r "RESEND_API_KEY" .next/static` must return nothing after a build.

## HTTP headers

Set in `next.config.ts` (static) and `src/proxy.ts` (per request):

| Header | Value |
|---|---|
| Content-Security-Policy | per request, with a fresh nonce: `script-src 'self' 'nonce-…' 'strict-dynamic'`, `style-src 'self' 'nonce-…'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src 'self'`, images and media only from self, data: and blob:, `upgrade-insecure-requests` in production |
| CSP for `/api/*` | `default-src 'none'; frame-ancestors 'none'` |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` (production only) |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | camera, microphone, geolocation, payment, usb, topics and motion sensors off; fullscreen self |
| Cross-Origin-Opener-Policy | `same-origin` |
| Cross-Origin-Resource-Policy | `same-origin` |

Trade-offs, stated honestly:

- `style-src-attr 'unsafe-inline'` allows inline **style attributes** (React `style` props and animation transforms). They cannot execute code. `<style>` elements still need the nonce.
- In development only, `style-src` allows `'unsafe-inline'` (Turbopack injects hot-reload CSS without a nonce) and `script-src` allows `'unsafe-eval'` (React's dev error overlays). Production does not.
- Nonces require per-request rendering, so pages are dynamically rendered. That costs a little time to first byte and is the price of a strict CSP without `'unsafe-inline'` scripts.
- Trusted Types are not enforced yet; React and Next.js do not ship a Trusted Types policy that works with `'strict-dynamic'` out of the box.

## Input handling

- **No HTML from data.** The site never uses `dangerouslySetInnerHTML`, `eval` or `new Function`. Command palette output is a list of typed lines rendered as React text, so a command can never inject markup.
- **Contact form** (`POST /api/contact`): same-origin check on the `Origin` header, `application/json` only, 8 KB body limit, Zod schema shared with the client (lengths and formats), honeypot field (silently dropped), minimum fill time of 3 seconds and maximum of 24 hours, rate limit of 5 requests per 10 minutes per client, all values HTML-escaped and CR/LF stripped before they reach an e-mail. Message contents and addresses are never logged.
- The particle lab accepts a custom word: max 8 letters or digits, rendered as text on a canvas.

## Rate limiting

`src/lib/rate-limit.ts` is an in-memory sliding window with a hard cap on tracked keys. **Known limitation:** on serverless hosting each warm instance has its own memory, so the limit is per instance. For a busier deployment, swap the implementation for a shared store (Redis, Upstash); the interface is one `check(key)` call.

## Dependencies

- `npm audit --omit=dev` must report zero vulnerabilities for runtime dependencies.
- Current dev-only advisory: `eslint-config-next` pulls in an old `braces` through `fast-glob` (stack exhaustion on malicious glob patterns). It only runs on the developer machine against our own files, not in the deployed site. Re-check on every `eslint-config-next` upgrade.
- No third-party scripts, fonts, images or analytics are loaded by the browser. Fonts are self-hosted by `next/font`; the PDF fonts in `assets/fonts` are SIL OFL licensed.

## Privacy

- No cookies except two first-party preference cookies without personal data: `pim-theme` (dark or light) and `pim-lang` (nl or en), both `SameSite=Lax` and `Secure` on HTTPS.
- No tracking, no analytics, no fingerprinting.
- Project content was collected read-only from Pim's own folders. Client names, campaign names, e-mail addresses, phone numbers, wallet addresses, API keys and pen names are deliberately excluded. Screenshots were checked by eye for personal data before they were added.

## Checks to run

```bash
npm run lint
npm run typecheck
npm test
npm audit --omit=dev
npm run test:e2e
```
