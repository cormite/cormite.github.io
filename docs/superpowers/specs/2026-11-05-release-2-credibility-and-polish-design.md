# Release 2: credibility, restrained wow, discoverability (design)

Status: DRAFT for the owner's approval. Nothing here is built. Everything lands on the `test` branch first;
production changes only through the existing gated flow (PR to `master`, then `Deploy production` with DEPLOY and reviewer approval).

## Current state (facts a builder needs)
- Production runs on **Cloudflare Pages** (project `cormite-production`, domain www.cormite.com) since 2026-11-05; DNS is on Cloudflare; DNSSEC is on.
  GitHub Pages stays only as the rollback target (`PRODUCTION_TARGET=github-pages`).
- DNS today (6 records): proxied apex placeholder, `www` CNAME, SPF `v=spf1 -all`, DMARC `p=reject; sp=reject`, null MX, Google verification TXT.
- Headers come from `scripts/security-headers.mjs` -> `_headers` (Cloudflare). New file types need rules there; `verify-live` must cover them.

## Intent and why
cormite.com is the owner's public window as a Head of ICT / Acting CIO and board advisor. A review of the live site found the foundation excellent
(12 KB HTML, 68 KB JS, 32 KB CSS, 17 KB AVIF portrait, strict CSP, real security headers, DNSSEC) but three credibility gaps that matter to a C-level audience:
1. The only contact is a gmail.com address, and the contact form just opens an email draft.
2. The achievements are one-liners that repeat the PDF CV; there is no story and no proof.
3. Nothing makes the site memorable for technical executives, and nothing helps search/AI assistants describe the owner accurately.

Primary audience: executive recruiters first, boards and advisory second (owner's confirmation pending, see Open questions).

## Goals
- G1 Professional identity: a `@cormite.com` address on the site, receiving mail through Cloudflare Email Routing (free, no payment details).
- G2 Evidence: achievements become short "impact stories"; a proof strip shows credentials and institutions, each linked to its authoritative source.
- G3 Distinct, tasteful interaction: a command palette (Cmd/Ctrl+K) and a "now" line. No new runtime libraries.
- G4 Discoverability: `llms.txt`, `security.txt`, and structured data kept accurate (the existing JSON-LD already has Person, worksFor, alumniOf, knowsAbout, sameAs).

## Non-goals
- No page-transition effects, scroll-driven timeline, per-language social cards, speed budget in CI, uptime monitoring, or generated CV PDFs in this release (later packages).
- No contact-form backend, no sending mail from the domain, no new analytics, no cookies, no tracking.
- No redesign: the existing elegant dark/gold look stays.

## Anti-goals (a failure even if it technically works)
- Anything gimmicky or loud; anything that makes the page slower, heavier than +10 KB gzip of JS in total, or lowers Lighthouse-style quality.
- Inventing facts: every claim, story detail, credential and link must come from the owner or an authoritative source.
- Weakening security: no inline scripts/styles beyond the current CSP, no third-party requests, no relaxed headers.
- Breaking mail protection: `sp=reject` DMARC and SPF `-all` stay; the domain only RECEIVES.

## Constraints (already true, must stay true)
- Static EN/ES/IT site; content source of truth is `assets/js/site-content.js`; pages are pre-rendered at build with the real client renderer.
- CSP has no inline script and no third-party origins except Google Analytics after consent. `scripts/security-headers.mjs` is the single source of headers.
- Quality gates must stay green: axe zero violations, WCAG AA contrast, CLS budget, reproducible build under Node 22, `verify-live` after deploy.
- All three languages ship together. `prefers-reduced-motion` is respected.

## Features

### F1 Professional address (G1)
- Owner chooses the address (proposal: `carlos@cormite.com`; see Open questions). Forwards to the owner's current gmail. Catch-all stays OFF.
- Cloudflare setup (owner clicks, assistant verifies): enable Email Routing, add destination, verify it, create the one rule. This replaces the null MX with Cloudflare's MX records. SPF stays `v=spf1 -all` only if Cloudflare accepts it; otherwise the minimal include Cloudflare requires. DMARC stays `p=reject; sp=reject`. Re-verify with public DNS afterwards.
- Site: `profile.contactEmail` becomes the new address in all languages; JSON-LD `email`, the contact section, the mailto draft and `security.txt` follow automatically.
- Limitation, stated to the owner: replies are sent from gmail unless "send as" is configured later; sending as `@cormite.com` requires an SPF change and is out of scope here.

### F2 Impact stories (G2)
- The "Key Strategic Achievements" cards become expandable stories with a fixed structure: Situation, Decision, Outcome, plus the headline metric already on the card. Keyboard- and screen-reader-accessible (disclosure pattern), works without JS (content visible when JS is off).
- Content: the owner supplies 2-4 factual bullets per story; the assistant writes polished copy in EN/ES/IT and the owner approves it. The four existing metrics are the headlines. No story ships with invented detail.

### F3 Proof strip (G2)
- A compact row (near the hero or achievements) listing credentials and institutions as text wordmarks, each linking to its issuer/verification page where one exists. No third-party logos unless the owner supplies them with permission.
- Owner supplies the list (e.g. ITIL 4, PRINCE2, degrees, institutions) and verification URLs. Optional JSON-LD `hasCredential` only for items with a public verification URL.

### F4 Command palette (G3)
- Cmd/Ctrl+K (and `/`) opens a dialog: filter-as-you-type list of actions: jump to each section, switch language, download CV (current language), email, LinkedIn, GitHub. Enter runs, Esc closes, arrows navigate, focus is trapped and restored.
- Discoverable on mobile and desktop through a small, labelled button in the navigation (keyboard hint shown on desktop only). Strings localised EN/ES/IT. No libraries, no inline script, lazy to initialise (does not delay first paint).
- Analytics: reuse the existing consent-gated event helper for one event (`palette_open`); nothing is sent without consent.

### F5 "Now" line (G3)
- No new element: the existing hero location chip ("Milan, Italy") gains the live local time: "Milan, Italy · 14:32". The availability badge stays exactly as it is (no duplicate availability text).
  Time computed in the visitor's browser with `Intl` for `Europe/Rome`; updates each minute; no geolocation, no network. The time part is `aria-hidden` (a ticking clock must not chatter to screen readers); the static "Milan, Italy" remains the accessible text.
  Width is reserved with tabular numerals so there is no layout shift; reduced motion has no effect because nothing animates.

### F6 `llms.txt`, `security.txt`, structured data (G4)
- `/llms.txt`: concise Markdown summary of who the owner is, key facts, links to the three language pages, CV PDFs and LinkedIn; generated at build from `site-content.js` so it cannot drift.
- `/.well-known/security.txt` (RFC 9116): Contact (the new address), Expires (1 year ahead, generated at build from SOURCE_DATE), Preferred-Languages, Canonical. A CI test fails when it is within 30 days of expiry; the release doc explains renewal.
- Both are added to the assembler allowlist, covered by `verify-live`, served as `text/plain; charset=utf-8` with a short cache (`_headers` rules; Cloudflare only).
  The rehearsal deploy must prove `.well-known/` is actually published by `wrangler pages deploy`; if it is skipped, the fallback is a Pages Function-free alternative decided then.
  The GitHub Pages rollback layout also gets a `.nojekyll` file so the dot-folder is served there too.
- JSON-LD: keep as is; update `email`; add `hasCredential` only per F3.

## Acceptance criteria
- A1 Mail: from an outside account, a message to the new address arrives in the owner's gmail; public DNS shows the MX, SPF and DMARC as designed; `verify-live` and the existing mail-protection checks still pass.
- A2 Stories: keyboard and screen-reader operable; axe zero violations; content present with JS disabled; EN/ES/IT parity test passes.
- A3 Palette: opens with Cmd/Ctrl+K and `/`; fully keyboard operable; focus trapped and restored; no CSP violation; Playwright tests cover open/filter/run/close on desktop and mobile; JS size increase documented and within budget.
- A4 Now line: deterministic tests using a fixed clock and timezone; no layout shift (CLS budget test still passes); reduced motion respected.
- A5 Files: `/llms.txt` and `/.well-known/security.txt` return 200 with correct content type on the live domain; expiry guard test exists.
- A6 Whole suite green locally and in CI; reproducible build check passes; `verify-live` passes on `https://www.cormite.com` after deploy.

## Rollout
Branch `test` -> PR -> merge to `master` -> `Deploy production` (DEPLOY + approval). Staging preview first. Cloudflare Email Routing is configured by the owner independently of the code, before the address appears on the site.

## Open questions (owner)
1. Which address (`carlos@cormite.com`? other?) and which gmail receives it.
2. Impact stories: facts for each of the four achievements (2-4 bullets each: what was wrong, what you decided, what changed).
3. Proof strip: credentials/institutions to show and their verification URLs; permission and files if logos are wanted.
4. Audience priority confirmed (recruiters first, boards second).

## Decided by the assistant (owner may overrule)
- Sequencing: Cloudflare Email Routing is configured and proven (A1) FIRST; the code release shows the new address only after that. Staging also keeps gmail until A1 passes.
- Stories and proof strip tolerate partial content: an achievement without a `story` renders as today (no disclosure); the proof strip renders 3-8 items and is hidden when empty; items without a public verification URL appear unlinked only if the owner confirms they are real; `hasCredential` only for linked items. Stories feed `llms.txt` as headline plus outcome.
- Palette ships inside the single hashed bundle (no separate chunk), initialised on idle or first interaction. The +10 KB gzip budget is measured as total gzip delta of `app.*.js` against the current build.
- Palette "Download CV" uses the current page language. `/` is inactive while focus is in an input, textarea, select or contenteditable.
- Receive-only mail (no "send as"); catch-all off.
- Text wordmarks instead of logos by default.
- Palette trigger keys: Cmd/Ctrl+K and `/`; one analytics event only.
- "Now" line uses Europe/Rome time computed client-side.
- `llms.txt` and `security.txt` generated at build.
