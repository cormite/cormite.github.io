# Website Assessment — www.cormite.com (2026-11-04)

Scope: repo `cormite/cormite.github.io` @ `7914973` (master, last commit 2026-04-07) + live site. Read-only audit; nothing changed.

## 1. What exists

- Static site on GitHub Pages, custom domain `www.cormite.com` (`CNAME`). `cormite.github.io` 301s to it.
- 3 languages: `/`, `/es/`, `/it/` (pre-rendered by `scripts/build-static-pages.mjs`, hreflang + sitemap OK).
- Stack: Tailwind 3 (compiled), vanilla JS modules (6 files, ~75 KB raw), self-hosted EB Garamond + Cormorant Garamond, JSON-LD (Person/ProfilePage), GA4.
- Design: navy/gold, serif, glass navbar, floating hero badges, scroll-reveal. Elegant, C-level tone — **keep**.
- Single branch `master` = production. No CI, no `.github/`, no staging, no tests (Playwright/jsdom are devDeps but unused).

## 2. Scorecard

| Area | Grade | Summary |
|---|---|---|
| Visual identity / tone | A- | Cohesive, credible, executive. Hero is strong but static. |
| "WOW" first impression | C+ | Good, not memorable. No signature moment, no motion beyond fade-up. |
| Performance | B+ | ~1.3 s load, tiny payloads (CSS 7 KB, fonts 90 KB, photo.webp 53 KB). Gaps below. |
| SEO / structured data | A- | Canonical, hreflang, OG, JSON-LD, sitemap all present. |
| Accessibility | B | Skip link, focus-visible, reduced-motion, ARIA menu, labels. Needs contrast + motion pass. |
| Security / privacy | C | No CSP, GA loads with no consent (GDPR/ePrivacy exposure, EU/Italy), outdated deps. |
| Engineering / release process | D | No env separation, no CI, **broken build script**, no tests. |
| Content | B | Strong positioning; some claims need proof points (see 3.7). |

## 3. Findings

### 3.1 Release process (highest priority — your explicit requirement)
- **F1** Only `master`; every push is live. No staging, no preview, no approval gate.
- **F2** No GitHub Actions. Built artifacts (`tailwind.css`, `index.html`, `es/`, `it/`) are committed by hand; easy to ship stale output.
- **F3** `npm run build:css` **fails**: `scripts/postbuild-css.mjs` uses `fileURLToPath` and `path` without importing them (`ReferenceError`, verified). Source CSS can't be rebuilt via the documented script.
- **F4** Playwright and jsdom are in devDependencies, but no test files or scripts exist.
- **F5** `project_architecture/` is git-ignored; docs live only on one machine.

### 3.2 Security & privacy
- **F6** GA4 (`G-6TC2GBF93J`) loads unconditionally on first paint. Site targets EU/Italian audience: needs consent banner or consent-mode (default denied) or a cookieless alternative. No privacy notice found.
- **F7** No Content-Security-Policy. GitHub Pages can't send headers, so use a `<meta http-equiv>` CSP (limited: no `frame-ancestors`) or front with Cloudflare for real headers (CSP, HSTS preload, Permissions-Policy, COOP).
- **F8** `npm audit`: 5 vulns (1 moderate, 4 high), all dev-time (undici etc.). Dependabot PR `undici-7.28.0` open and unmerged. Low runtime risk, still hygiene debt.
- **F9** Personal Gmail address in JSON-LD and as contact target: scraper-exposed. Contact "form" is only a `mailto:` redirect (no real submission, fails silently without a mail client).
- **F10** External links use `noopener noreferrer`: good. No SRI needed (all assets self-hosted): good. GA loader is the only third-party script.

### 3.3 Performance (measured, live, desktop)
- DCL ~1.0 s, load ~1.3 s, FCP ~1.47 s. Acceptable, not "instant".
- **F11** Seven JS files loaded as separate deferred requests, serialized (resource timings stagger 278→566 ms). Bundle + minify → one request.
- **F12** `photo.jpg` (800 KB, 1200 px) used as in-page `<img>` fallback and OG image; hero displays at 312 px. Serve responsive `srcset` (AVIF/WebP at 320/640/960) and a 1200×630 OG image (<150 KB).
- **F13** Hero image is `loading=auto` with no `fetchpriority="high"`, no explicit width/height on all images (CLS risk).
- **F14** Content is pre-rendered in HTML *and* re-rendered client-side by JS (`renderAll`): duplicate work, possible flash/reflow, and 33 KB of content JS shipped that the HTML already contains.
- **F15** `cache-control: max-age=600` (Pages default, can't change). Cache-busting via manual `?v=` strings. Fine, but automate with content hashes in CI.
- **F16** CV PDFs ~870 KB each; compress (likely image-heavy).
- **F17** GA script adds a third-party connection on the critical path.

### 3.4 Accessibility
- Positives: `lang` set, one `<h1>`, landmarks (`nav`, `main`, `footer`), labelled form fields, `role="status"` success area, focus trap in mobile menu, `prefers-reduced-motion` honoured.
- **F18** No `<header>` landmark (0 found); heading order jumps (hero subtitle is an `<h2>`).
- **F19** Gold `#8A6508` on navy and on light surfaces, plus small `white/10` translucent chips: contrast needs an automated check (WCAG AA 4.5:1 for small text).
- **F20** Scroll-reveal hides content until IntersectionObserver fires; if it fails or print mode is used, content stays invisible. Mid-transition states captured in my scroll test looked washed-out.
- **F21** Floating hero badges overlap/clip at narrow widths (right badges cut off in the 800 px capture: "Head of…", "Cybersecur…").

### 3.5 UX / design
- **F22** Hero is a flat gradient + photo + badges. Nothing interactive, no signature moment.
- **F23** Experience timeline and skills are text-heavy; no data visualisation of impact (€14M budget, 25+ team, 15+ yrs are plain stat chips).
- **F24** No dark/light preference handling, no scroll progress, no section-aware nav highlight state confirmed.
- **F25** Single-page only: no case studies, writing, speaking or board-advisory page, which a C-level portal normally needs for depth and SEO.
- **F26** Language switch is client-side detection; confirm no redirect loops and that the choice persists.

### 3.6 SEO / discoverability
- Solid base. Gaps: `dateModified` hard-coded `2026-04-07` while footer says "Updated Nov 2026" (inconsistent); sitemap `lastmod` stale; no `og:image:width/height/alt`; OG image is the raw portrait, not a designed 1200×630 card; no `Person.sameAs` extras (ORCID, Google Scholar if relevant); no `llms.txt`.

### 3.7 Content
- Claims like "14M € Budget Managed", "25+ Team Size" read well; add 1-line context or proof (year, scope) for credibility. Footer says "Updated: Nov 2026" but repo last commit is April: confirm it is generated, not hand-typed.

## 4. Priority summary

| Pri | Items |
|---|---|
| P0 | F1–F3 (environments, CI, broken build), F6 (consent) |
| P1 | F7, F11–F14, F18–F21, F22 |
| P2 | F8, F9, F16, F23–F26, SEO polish |

## 5. Not verified (honest gaps)
- No Lighthouse/axe run (Playwright browsers not installed here); perf numbers come from in-browser Navigation/Resource Timing on one load.
- Mobile layout checked only by code/CSS reading, not rendered.
- Real-user data (GA) not available to me.
