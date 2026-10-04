# CTSD Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the CTSD marketing site: a brown-wood premium site with a data-driven "Explore Designs" shop, a live in-browser admin demo, and two lead forms that save to Supabase and email the owner.

**Architecture:**
- Static HTML, CSS and vanilla ES modules live in `public/`, served by a Cloudflare Worker with static assets. The Worker runs first only for `/api/*`, `/designs/*` and `/sitemap.xml`.
- The design catalog is one JSON file rendered by two templates.
- Lead validation is one shared ES module, imported by both the browser forms and the Worker.

**Tech Stack:**
- Cloudflare Workers + static assets (wrangler 4)
- Supabase (Postgres + Storage) via REST from the Worker
- Resend for email
- Cloudflare Turnstile against spam
- Vitest with `@cloudflare/vitest-pool-workers` for Worker tests, plain Vitest for pure modules
- Playwright + `@axe-core/playwright` for page smoke tests and accessibility tests
- No front-end framework and no build step for the site itself

**Spec:** `docs/superpowers/specs/2026-10-03-ctsd-website-design.md`

**Repo:** `https://github.com/amanorsac/CUSTOM-TECHNOLOGY-SOFTWARE-DEVELOPMENT.git`. It deploys automatically through Cloudflare Workers Builds to the Worker `custom-technology-software-development` **on every push to `main`. Pushing is a production deploy.**

**Deviation from spec §3.2:** site files live under `public/` instead of the repo root, so `docs/`, `tests/`, `src/` and `package.json` are never served. All spec paths read as `public/<path>`.

## Global Constraints

- **Colors** (exact): `--deep-brown #3E2723`, `--wood-brown #6B4F32`, `--warm-tan #C89B6B`, `--gold #D4AF37`, `--cream #F7EFE4`, `--charcoal #1A1A1A`, `--sage #556B2F`, `--off-white #FBF9F6`. **No blue anywhere.**
- **Fonts:** Montserrat 600/700 (headings), Poppins 500 (labels and subheads), Inter 400/500 (body). Self-hosted woff2 with `font-display: swap`.
- **Prices:** none shown anywhere, in copy or in data.
- **Concept label:** every design shows a visible **Concept** badge (`concept: true`). Fictional organizations are never called clients.
- **Calls to action:** wording comes from: Start a Project · Start Your Project · Build Your System · Discuss Your Project · Tell Us What You Need · Build Something Like This · Get a free mockup. Never "Get a Website".
- **Accessibility:** WCAG 2.1 AA; all text and background pairs at AA contrast; a gold focus ring; `prefers-reduced-motion` respected.
- **Layout:** 375px wide with no horizontal scroll.
- **Lighthouse:** Performance ≥ 90 and Accessibility ≥ 95 (desktop and mobile).
- **Page weight:** JS per page ≤ ~50KB uncompressed, excluding the demo.
- **Owner email:** the Worker variable `LEAD_EMAIL = "amanorsac@gmail.com"`. Never hard-code the address in the site source.
- **Supabase keys:** the `service_role` key is used **only** as the Worker secret `SUPABASE_SERVICE_KEY`. The browser never talks to Supabase directly.
- **Storage access:** every `localStorage` / `sessionStorage` call is wrapped in try/catch.

## Review Focus

1. **Double-clicking Submit, or a slow network,** must not create duplicate leads. The submit button is disabled while a request is in flight. *Test in Task 9.*
2. **HTML or script in form fields** (`<img onerror>` as the org name) must arrive in the owner's email as escaped text. *Test in Task 8.*
3. **A design whose images haven't been generated yet** must show no broken-image icons: empty sections are hidden, and a missing cover uses `images/designs/_placeholder.webp`. *Test in Task 4.*
4. **Blocked storage** (Safari private mode, storage blocked) must not break the demo: it runs from memory. *Test in Task 10.*
5. **Unknown inputs** (unknown `?cat=`, unknown slug, or `?design=` with a bad slug on the start form) must degrade gracefully: the shop shows "All", the design page shows "Design not found" with a link back, and the start form ignores the chip. *Tests in Tasks 3, 4 and 9.*

---

## File Structure

```
package.json                devDeps + scripts (test, test:e2e, dev)
wrangler.jsonc              Worker config, assets dir ./public
vitest.config.mjs           two projects: unit (node) + worker (workers pool)
playwright.config.mjs       serves via `wrangler dev`, tests in tests/e2e
.dev.vars.example           names of local secrets (never real values)
src/worker.js               router only: dispatches to route modules, else ASSETS
src/routes/lead.js          POST /api/lead, POST /api/upload-url
src/routes/design-page.js   GET /designs/:slug → design.html + meta via HTMLRewriter
src/routes/sitemap.js       GET /sitemap.xml
src/lib/email.js            escapeHtml, ownerEmail(lead), visitorEmail(lead)
src/lib/supabase.js         insertLead(env, row), signedUploadUrl(env, path)
supabase/leads.sql          table + RLS + storage bucket
public/                     everything served
  index.html solutions.html designs.html design.html about.html start.html
  mockup.html thanks.html privacy.html 404.html
  industries/{business,church,education,nonprofit}.html
  data/designs.json
  assets/css/{tokens,site,shop,design,forms,demo}.css
  assets/js/shell.js        injects header/footer, mobile menu, reveal-on-scroll
  assets/js/catalog.js      pure catalog functions (shared)
  assets/js/lead-schema.js  pure validateLead (shared with Worker)
  assets/js/shop.js design-page.js industry.js forms.js
  assets/brand/             logo.svg, logo-horizontal.svg, mark.svg, favicon.svg, og-default.jpg
  fonts/                    woff2 files
  images/designs/<slug>/    generated images (placeholders until owner generates)
  images/site/
  demo/index.html demo/store.js demo/seed/{church,school,business}.json demo/app.js
tests/unit/                 vitest (node)
tests/worker/               vitest workers pool
tests/e2e/                  playwright
docs/image-prompts/         prompt sheets
```

---

### Task 1: Repo, tooling and a deploying skeleton

**Files:**
- Create: `package.json`, `wrangler.jsonc`, `vitest.config.mjs`, `playwright.config.mjs`, `.gitignore`, `.dev.vars.example`, `src/worker.js`, `public/index.html` (placeholder "Coming soon" in brand colors), `tests/worker/router.test.js`

**Interfaces:**
- Produces: `export default { fetch(request, env, ctx) }` in `src/worker.js`; route modules register with `routes: Array<{ method, test: (url) => boolean, handle: (request, env, ctx, url) => Promise<Response> }>`.
- Env names used by later tasks: `ASSETS` (binding); `LEAD_EMAIL`, `SUPABASE_URL`, `TURNSTILE_SITE_KEY`, `MAIL_FROM` (vars); `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET` (secrets).

- [ ] **Step 1: Make the working folder the repo.** In `IT Solutions/`:
  - run `git init -b main`
  - add the remote with `git remote add origin <repo url>`
  - run `git pull origin main` to bring in the README
  - confirm with `git log --oneline` that it shows `Initial commit`
- [ ] **Step 2: Add `package.json`** with:
  - devDependencies: `wrangler@^4`, `vitest`, `@cloudflare/vitest-pool-workers`, `@playwright/test`, `@axe-core/playwright`
  - scripts: `"dev": "wrangler dev"`, `"test": "vitest run"`, `"test:e2e": "playwright test"`
  - then run `npm install`
- [ ] **Step 3: Add `wrangler.jsonc`:**
  - `name: "custom-technology-software-development"`, `main: "src/worker.js"`, `compatibility_date: "2026-09-01"`
  - `assets: { directory: "./public", binding: "ASSETS", not_found_handling: "404-page", run_worker_first: ["/api/*", "/designs/*", "/sitemap.xml"] }`
  - `vars: { LEAD_EMAIL: "amanorsac@gmail.com", SUPABASE_URL: "", TURNSTILE_SITE_KEY: "1x00000000000000000000AA", MAIL_FROM: "" }`. That site key is Cloudflare's always-pass test key until the real one exists.
- [ ] **Step 4: Write the failing test** `tests/worker/router.test.js`:
  - `GET /` returns what `env.ASSETS.fetch` returns
  - `GET /api/nope` → 404 JSON `{ ok:false, error:"not_found" }`
- [ ] **Step 5: Run** `npx vitest run tests/worker`. Expected: FAIL (no worker).
- [ ] **Step 6: Implement the router** in `src/worker.js`: match `routes`, otherwise `/api/*` → 404 JSON, otherwise `env.ASSETS.fetch(request)`.
- [ ] **Step 7: Run** `npx vitest run tests/worker`. Expected: PASS. Then `npx wrangler dev`: `http://localhost:8787/` shows the placeholder.
- [ ] **Step 8: Commit.** Ask the owner before the first `git push`, because it deploys to production. After pushing, confirm the Cloudflare build shows success and the workers.dev URL serves the placeholder.

```bash
git add -A && git commit -m "chore: scaffold CTSD worker, tooling and placeholder page"
```

---

### Task 2: Brand system: tokens, fonts, logo, site shell

**Files:**
- Create:
  - `public/assets/css/tokens.css`, `public/assets/css/site.css`
  - `public/fonts/*.woff2`
  - `public/assets/brand/{mark,logo,logo-horizontal,favicon}.svg`
  - `public/assets/js/shell.js`
  - `tests/e2e/shell.spec.js`
- Modify: `public/index.html` (use the shell)

**Interfaces:**
- Produces:
  - **CSS custom properties:** the Global Constraints colors, plus `--font-head`, `--font-label`, `--font-body`, `--radius: 16px`, `--space-1…8` and `--shadow-soft`.
  - **Utility classes:** `.section--wood`, `.section--cream`, `.container`, `.eyebrow` (Poppins uppercase, letter-spacing .2em), `.btn`, `.btn--primary` (tan background), `.btn--ghost`, `.badge-concept`, `.card`, `.reveal`.
  - **Shell markers:** every page has `<body data-page="<id>">`, plus `<div id="site-header"></div>` and `<div id="site-footer"></div>`, which `shell.js` fills in.
  - **Nav order:** Home · Solutions · Industries ▾ (Business, Church, Education, Nonprofit) · Explore Designs · Live Demo · About · [Start a Project].
  - **Footer:** service links, industry links, "Get a free mockup", privacy link, © CTSD.

- [ ] **Step 1: Copy font files** from `@fontsource/montserrat`, `@fontsource/poppins` and `@fontsource/inter` (latin, the needed weights) into `public/fonts/`, then declare `@font-face` rules in `tokens.css`.
- [ ] **Step 2: Draw the logo as SVG.** Use the brand board's hexagonal C+T mark in a wood-brown → tan gradient, plus the wordmark "CUSTOM TECHNOLOGY / & SOFTWARE DEVELOPMENT" set in Montserrat and converted to paths.
  - Check: the mark reads clearly at 32px (favicon) and 160px.
  - If the owner later supplies source files, those replace this drawing.
- [ ] **Step 3: Write the failing e2e test** `tests/e2e/shell.spec.js`, run on `/` at 375px and 1280px:
  - the header nav has the 7 items above
  - a "Skip to content" link is the first focusable element
  - `document.documentElement.scrollWidth <= innerWidth`
  - no console errors
  - axe finds 0 serious or critical violations
  - the mobile menu opens with a click and closes with Escape
- [ ] **Step 4: Run** `npx playwright test shell`. Expected: FAIL.
- [ ] **Step 5: Implement `shell.js`.**
  - Inject the header and footer, and mark the current page with `aria-current="page"` based on `data-page`.
  - Build the mobile menu as a disclosure with focus trap.
  - Add an `IntersectionObserver` that applies `.reveal`, disabled under `prefers-reduced-motion`.
  - Style the nav to amanorsac.studio's look: a slim deep-brown bar with a light blur, and the Start a Project button in tan.
- [ ] **Step 6: Run** `npx playwright test shell`. Expected: PASS.
- [ ] **Step 7: Commit** `feat: brand tokens, fonts, logo and site shell`.

---

### Task 3: Design catalog data and pure catalog module

**Files:**
- Create: `public/data/designs.json`, `public/assets/js/catalog.js`, `public/images/designs/_placeholder.webp`, `tests/unit/catalog.test.js`

**Interfaces:**
- Produces (ES module `catalog.js`):
  - `CATEGORIES = ['all','church','education','business','software']`
  - `normalizeCategory(cat: string|null) -> string`: anything unknown becomes `'all'`.
  - `filterDesigns(designs, cat) -> Design[]`: `'all'` returns everything; otherwise matches `d.category === cat || d.tags.includes(cat)`.
  - `findDesign(designs, slug) -> Design|null`
  - `relatedDesigns(designs, design, n = 3) -> Design[]`: same category first, then shared tags; never includes itself.
  - `imageOrPlaceholder(path?: string) -> string`
  - `designSections(design) -> Array<'website'|'app'|'portal'|'admin'>`: only sections whose images array is non-empty.
- **Design shape** is exactly spec §6.2.

- [ ] **Step 1: Write `designs.json`** with the 12 designs from spec §6.1. Slugs:
  - `modern-church`, `multi-campus-church`, `youth-ministry`
  - `private-school`, `music-school`, `online-academy`
  - `consulting-firm`, `real-estate`, `restaurant`
  - `custom-crm`, `client-portal`, `booking-system`

  Rules for the entries:
  - Add tag `nonprofit` to `modern-church`, `client-portal` and `booking-system`.
  - `featured: true` for `modern-church`, `private-school`, `consulting-firm` and `custom-crm`.
  - Every entry has `concept: true`.
  - Image paths follow `images/designs/<slug>/{cover,hero,web-1..3,app-1..3,portal-1,admin-1}.webp`.
  - Write a real tagline, features and integrations for each; the copy follows brand doc §11.
- [ ] **Step 2: Write failing tests** `tests/unit/catalog.test.js`:
  - `filterDesigns(all,'church')` has length 3
  - `filterDesigns(all,'nonprofit')` has length 3
  - `normalizeCategory('xyz') === 'all'`
  - `findDesign(all,'nope') === null`
  - `relatedDesigns` for `modern-church` excludes itself and returns 3 results
  - `designSections({images:{website:['a'],app:[],portal:[]}})` deep-equals `['website']`
  - `imageOrPlaceholder(undefined)` ends with `_placeholder.webp`
  - every design has a unique slug, `concept === true`, and no field contains `$`
- [ ] **Step 3: Run** `npx vitest run tests/unit/catalog.test.js`. Expected: FAIL.
- [ ] **Step 4: Implement `catalog.js`.**
- [ ] **Step 5: Run** the same test. Expected: PASS.
- [ ] **Step 6: Commit** `feat: design catalog data and catalog module`.

---

### Task 4: Explore Designs shop and design page template

**Files:**
- Create:
  - `public/designs.html`, `public/design.html`
  - `public/assets/js/shop.js`, `public/assets/js/design-page.js`
  - `public/assets/css/shop.css`, `public/assets/css/design.css`
  - `src/routes/design-page.js`
  - `tests/e2e/designs.spec.js`, `tests/worker/design-page.test.js`
- Modify: `src/worker.js` (register the route)

**Interfaces:**
- Consumes: Task 3's `catalog.js`.
- Produces:
  - Shop URL: `/designs.html?cat=<cat>`
  - Design URL: `/designs/<slug>`, with `/design.html?id=<slug>` as a fallback
  - Each card links to `/designs/<slug>`
  - The call to action links to `/start.html?design=<slug>`

- [ ] **Step 1: Write failing worker tests** `tests/worker/design-page.test.js`:
  - `GET /designs/modern-church` → 200 HTML whose `<title>` contains "Modern Church Platform — Concept | CTSD", whose `og:title` matches, whose `og:image` points at the cover, and which contains `data-slug="modern-church"`
  - `GET /designs/nope` → 404 with the body still being `design.html` (so the client shows "Design not found")
- [ ] **Step 2: Write failing e2e tests** `tests/e2e/designs.spec.js`:
  - `/designs.html` shows 12 cards, each with a "Concept" badge
  - clicking the "Church" tab shows 3 cards and changes the URL to `?cat=church`
  - `?cat=xyz` shows 12 cards with "All" selected
  - `/designs/modern-church` shows the h1 "Modern Church Platform"
  - when a design's images are missing on disk, no `img` has `naturalWidth === 0` (the placeholder is used and empty sections are hidden)
  - `/designs/nope` shows "Design not found" with a link to `/designs.html`
  - "Build something like this" has `href` `/start.html?design=modern-church`
  - axe finds 0 serious violations on both pages
- [ ] **Step 3: Run both tests.** Expected: FAIL.
- [ ] **Step 4: Implement `src/routes/design-page.js`.**
  - Fetch `/data/designs.json` and `/design.html` through `env.ASSETS`.
  - Use `HTMLRewriter` to set the `title`, `meta[name=description]`, `og:*` and the canonical URL, and to add the `data-slug` attribute on `<main>`.
  - Return 404 when the slug is unknown.
- [ ] **Step 5: Implement the shop.**
  - Filter tabs are a `role="tablist"` row.
  - Cards are `<a>` elements with the cover image, name, category eyebrow, tagline, Concept badge and the systems line.
  - On hover the card crossfades to `app-1`, but only if that image loads.
  - Use `loading="lazy"`, `srcset` with the 600px `-sm` variants, and alt text `"<name> concept — <section> screen"`.
- [ ] **Step 6: Implement the design page.**
  - It reads the slug from `main[data-slug]`, or from `?id=` as a fallback.
  - Sections follow spec §4.5 in order; only those from `designSections()` render.
  - The website and app galleries are horizontal scroll-snap rows with previous/next buttons you can reach with the keyboard. They don't autoplay.
  - Related designs come from `relatedDesigns`.
- [ ] **Step 7: Run both tests.** Expected: PASS.
- [ ] **Step 8: Commit** `feat: explore designs shop and design product pages`.

---

### Task 5: Home page

**Files:**
- Modify: `public/index.html`
- Create: `public/assets/js/home.js` (featured tiles plus the journey animation), `tests/e2e/home.spec.js`

**Interfaces:**
- Consumes: `catalog.js` (`d.featured`).

- [ ] **Step 1: Write a failing e2e test:**
  - the h1 reads exactly "Technology built around your organization."
  - the buttons "Start Your Project" → `/start.html` and "Explore What We Build" → `/designs.html` exist
  - there are 4 featured tiles
  - a link to `/demo/` exists
  - the 6 process steps appear in order Discover, Design, Build, Test, Launch, Handoff
  - the page text contains no `$`
  - Lighthouse-style checks: the hero image has `fetchpriority="high"`; every other image is `loading="lazy"`
  - axe finds 0 serious violations; there is no horizontal scroll at 375px
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Build the 9 sections** in the order and with the copy from spec §4.1.
  - Featured tiles use amanorsac.studio's stacked full-bleed tile pattern, with two text links each ("View design ›", "Build something like this ›").
  - The journey animation is CSS and SVG: a step highlights as it scrolls into view. Under reduced motion it is a static list.
  - The integrations wall is text wordmarks in Poppins, not third-party logo images, to avoid trademark issues.
  - Hero art is `images/site/hero.webp` (placeholder until generated).
- [ ] **Step 4: Run the test.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: home page`.

---

### Task 6: Solutions and four industry pages

**Files:**
- Create:
  - `public/solutions.html`
  - `public/industries/{business,church,education,nonprofit}.html`
  - `public/assets/js/industry.js`
  - `tests/e2e/industries.spec.js`

**Interfaces:**
- Consumes: `filterDesigns(designs, <industry tag>)`. The Education page uses `'education'` and the Nonprofit page uses `'nonprofit'`.
- Produces: each industry page has `<section id="industry-designs" data-cat="<tag>">`, which `industry.js` fills.

- [ ] **Step 1: Write a failing e2e test.** For each industry page:
  - the h1 exists
  - the `#industry-designs` grid shows ≥ 1 card (nonprofit: 3)
  - the call-to-action band links to `/start.html`

  Also:
  - the Education page contains a heading "Accessibility (WCAG 2.1 AA)" and does not contain the word "guarantee"
  - the Solutions page has the 3 group headings from spec §4.2
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Build the pages.**
  - Industry content comes from spec §4.3 and brand doc §6–9.
  - Integrations shown: Planning Center, Stripe and YouTube for churches; SIS and LMS integration (named generically), Stripe and Google Workspace for education; donor CRM, Stripe and Mailchimp for nonprofits; HubSpot, Salesforce, QuickBooks and Calendly for business.
- [ ] **Step 4: Run the test.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: solutions and industry pages`.

---

### Task 7: About, Privacy, Thanks, 404

**Files:**
- Create: `public/about.html`, `public/privacy.html`, `public/thanks.html`, `public/404.html`, `tests/e2e/static-pages.spec.js`

- [ ] **Step 1: Write a failing test:**
  - every page loads with the shell, with 0 serious axe violations
  - `/does-not-exist` returns status 404 and shows a link to `/designs.html`
  - About links to `https://www.amanorsac.studio/`
  - Privacy mentions Supabase, Resend, Cloudflare Turnstile and Cloudflare Web Analytics, plus the contact `amanorsac@gmail.com`. This page's text is written out, not taken from the `LEAD_EMAIL` variable.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Write the pages.**
  - About follows spec §4.7.
  - Privacy states what each form collects, why, where it's stored, how long it's kept (24 months), and how to ask for deletion.
  - Thanks reads `?kind=project|mockup` and shows the matching message.
- [ ] **Step 4: Run the test.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: about, privacy, thanks and 404 pages`.

---

### Task 8: Leads backend: schema, Supabase, Worker endpoint, email

**Files:**
- Create:
  - `supabase/leads.sql`
  - `public/assets/js/lead-schema.js`
  - `src/lib/email.js`, `src/lib/supabase.js`, `src/routes/lead.js`
  - `tests/unit/lead-schema.test.js`, `tests/worker/lead.test.js`
- Modify: `src/worker.js`

**Interfaces:**
- Produces:
  - `validateLead(input: object) -> { ok: true, value: Lead } | { ok: false, errors: Record<field, message> }`
    - `kind ∈ {'project','mockup'}`
    - `email` is required and valid
    - `name` is required, 1–120 characters
    - `org_name` is 1–160 characters
    - `org_type ∈ {'business','church','school','nonprofit','other'}`
    - `needs ⊆ {'website','app','portal','crm','crm-integration','booking','payments','automation','not-sure'}`
    - `timeline ∈ {'asap','1-3m','3-6m','exploring'}`
    - `budget ∈ {'<5k','5-15k','15-50k','50k+','not-sure', ''}`
    - `style ∈ {'modern','classic','bold','minimal'}` (mockup only)
    - `message` ≤ 4000 characters; every string is trimmed
    - `design_slug` must match `^[a-z0-9-]{1,60}$`, otherwise it is dropped
    - `contact_pref ∈ {'email','phone','either'}`
    - **Required for project:** `org_type`, `needs` (≥ 1), `name`, `email`
    - **Required for mockup:** `org_name`, `org_type`, `style`, `name`, `email`
  - `POST /api/lead`: body is `Lead & { turnstile: string, website_hp?: string }`. Responses:
    - `200 {ok:true}`
    - `400 {ok:false, errors}`
    - `403 {ok:false, error:'captcha'}`
    - `500 {ok:false, error:'server'}`
  - `POST /api/upload-url`: body `{ filename, type, size, turnstile }` → `{ ok:true, path, uploadUrl }`, or 400 if the type is not png/jpeg/svg+xml or the size is over 5_242_880.
  - `escapeHtml(s) -> string`, `ownerEmail(lead) -> {subject, html, text}`, `visitorEmail(lead) -> {subject, html, text}`

- [ ] **Step 1: Write `supabase/leads.sql`.**
  - Create the `leads` table with exactly the columns in spec §8.3. `status` has a check constraint and defaults to `'new'`.
  - `alter table leads enable row level security;` with **no policies**, so the anon role has no access.
  - Create a private storage bucket `lead-uploads`.
- [ ] **Step 2: Write failing unit tests** `tests/unit/lead-schema.test.js`:
  - a valid project passes
  - a missing email fails, with `errors.email` set
  - a mockup without `style` fails
  - `needs:['hack']` fails
  - an 8,000-character message fails
  - a `design_slug` of `"../x"` is dropped, not rejected
  - whitespace is trimmed
- [ ] **Step 3: Write failing worker tests** `tests/worker/lead.test.js`, using `fetchMock` to mock Turnstile siteverify, the Supabase REST insert and Resend:
  - a valid lead → 200; Supabase receives a row with `kind:'project'`; Resend is called with `to: 'amanorsac@gmail.com'`
  - a lead whose `org_name` is `<img src=x onerror=alert(1)>` → the owner email HTML contains `&lt;img` and no raw `<img src=x`
  - a non-empty honeypot `website_hp` → 200 `{ok:true}`, with **no** Supabase or Resend calls
  - Turnstile `success:false` → 403
  - Supabase returns 500 → the endpoint returns 500 and Resend is not called
  - Resend fails after the insert succeeds → still 200 (the lead is saved), and the failure is logged with `console.error`
  - an empty `MAIL_FROM` → the visitor confirmation is skipped, while the owner email still sends from `onboarding@resend.dev`
  - `upload-url` with `type:'application/pdf'` → 400; with size 6MB → 400
- [ ] **Step 4: Run** `npx vitest run`. Expected: FAIL.
- [ ] **Step 5: Implement the modules.**
  - Turnstile is checked through `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
  - The insert is `POST ${SUPABASE_URL}/rest/v1/leads` with `apikey` and `Authorization: Bearer ${SUPABASE_SERVICE_KEY}` headers and `Prefer: return=minimal`.
  - Signed upload URLs come from `POST ${SUPABASE_URL}/storage/v1/object/upload/sign/lead-uploads/<uuid>-<safe filename>`.
  - Email goes through `https://api.resend.com/emails`, the same pattern as amanorsac.studio's `worker.js`. The owner subject is `New lead: <kind> — <org_type> — <org_name or name>`.
- [ ] **Step 6: Run** `npx vitest run`. Expected: PASS.
- [ ] **Step 7: Commit** `feat: leads schema, validation and /api/lead endpoint`.
- [ ] **Step 8: Owner setup (needs the owner).**
  1. Create a Supabase project and run `leads.sql`.
  2. Set `SUPABASE_URL` in `wrangler.jsonc`.
  3. Set the secrets with `npx wrangler secret put` for `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY` and `TURNSTILE_SECRET`.
  4. Create a Turnstile widget and set `TURNSTILE_SITE_KEY`.
  5. Optionally set `MAIL_FROM` to a verified Resend sender, for example the amanorsac.studio domain, which is already verified in Resend.

  Until this is done, the forms show the fallback mail link.

---

### Task 9: Start a Project and Free Mockup forms

**Files:**
- Create:
  - `public/start.html`, `public/mockup.html`
  - `public/assets/js/forms.js`, `public/assets/css/forms.css`
  - `tests/e2e/forms.spec.js`

**Interfaces:**
- Consumes:
  - `validateLead` (Task 8), shared with the Worker
  - `findDesign` (Task 3), for the `?design=` chip
  - `POST /api/lead` and `POST /api/upload-url`
- Produces: on success, a redirect to `/thanks.html?kind=<kind>`.

- [ ] **Step 1: Write failing e2e tests.** Use Playwright `page.route` to mock `/api/*`, and test with a Turnstile test key:
  - `start.html` has 5 steps with a progress bar showing "Step 1 of 5"
  - Next is blocked until required fields are valid, with errors announced through `aria-describedby` and an `aria-live` region
  - Back keeps entered values
  - `?design=modern-church` shows the chip "Inspired by: Modern Church Platform" and sends `design_slug`
  - `?design=nope` shows no chip
  - double-clicking Submit sends exactly 1 request, and the button is disabled with `aria-busy="true"` while it's in flight
  - a mocked 500 shows the error with a `mailto:` fallback, and every field keeps its value
  - success → `/thanks.html?kind=project`
  - `mockup.html`: a 6MB logo shows the error "Logo must be 5MB or smaller", and a `.pdf` is rejected on the client
  - a valid submit calls `upload-url`, then the `PUT`, then `/api/lead` with `logo_path`
  - the whole form can be completed with the keyboard alone
- [ ] **Step 2: Run** `npx playwright test forms`. Expected: FAIL.
- [ ] **Step 3: Implement `forms.js`:** a step controller, per-step validation using `validateLead` on the fields seen so far, an in-flight lock, and the Turnstile widget loaded with `render=explicit` only on these two pages. The `mailto:` fallback address is set as a `data-fallback` attribute on the form by the HTML. The HTML carries `amanorsac@gmail.com`; this is the only place it appears in the public site source, and it's the same address the privacy page already shows.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: start a project and free mockup forms`.

---

### Task 10: Live admin demo

**Files:**
- Create:
  - `public/demo/index.html`, `public/demo/store.js`, `public/demo/app.js`
  - `public/demo/views/{dashboard,pages,events,people,inbox,notify}.js`
  - `public/demo/seed/{church,school,business}.json`
  - `public/assets/css/demo.css`
  - `tests/unit/demo-store.test.js`, `tests/e2e/demo.spec.js`

**Interfaces:**
- Produces:
  - `createStore(seeds: Record<orgId, Seed>, storage?: Storage|null) -> { getState(), subscribe(fn) -> unsubscribe, dispatch(action), reset() }`
  - **Org ids:** `'church'` (Grace Fellowship), `'school'` (Oakridge Academy), `'business'` (Summit Consulting).
  - **Actions:**
    - `{type:'org/switch', org}`
    - `{type:'page/update', field:'heading'|'body'|'image', value}`
    - `{type:'event/add', event}`, `{type:'event/update', id, patch}`, `{type:'event/delete', id}`
    - `{type:'inbox/handle', id}`
    - `{type:'notify/send', title, body}`
  - The state is saved under the `sessionStorage` key `ctsd-demo-v1`.
  - **Seed shape:** `{ org:{name,type,logoText,palette}, kpis:[{label,value,delta}], series:[{label, points:number[]}], page:{heading,body,image}, events:[{id,title,date,location}], people:[{id,name,email,role,status,joined}], inbox:[{id,from,subject,body,date,handled}] }`

- [ ] **Step 1: Write failing unit tests** `tests/unit/demo-store.test.js`:
  - the initial org is `'church'`
  - `page/update` changes the heading
  - `event/add`, then `event/delete`, restores the count
  - `org/switch` keeps each org's edits separate
  - `reset()` restores the seeds and clears storage
  - `createStore(seeds, throwingStorage)`, where every method throws, still works
  - `createStore(seeds, null)` works
  - rehydrating from storage that holds invalid JSON falls back to the seeds
- [ ] **Step 2: Write failing e2e tests** `tests/e2e/demo.spec.js`:
  - the banner text appears and links to `/start.html`
  - editing the heading updates the preview immediately
  - adding an event shows it in the preview calendar
  - the org switcher changes the org name everywhere
  - Reset restores "Grace Fellowship" defaults
  - **zero network requests** go to any origin other than the page's own, and no `/api/` requests are made
  - at 375px the sidebar becomes a bottom tab bar with no horizontal scroll
  - with storage blocked through `page.addInitScript` overriding `sessionStorage` to throw, the demo still loads and edits
  - axe finds 0 serious violations
- [ ] **Step 3: Run both.** Expected: FAIL.
- [ ] **Step 4: Implement `store.js`,** then `app.js` (hash routing `#/dashboard`, `#/pages`, …) and the views.
  - Lift the layout and the chart look from amanorsac.studio's `portal/admin*.html`, `assets/charts.js` and `assets/admin-charts.css`, re-skinned to the wood palette. Copy only what's needed, with **no Supabase code**.
  - Seeds hold realistic data (spec brand doc §18: realistic data, uncluttered).
  - The Pages view is split: an editor on the left and a live preview of the org's homepage on the right; on phones they stack.
- [ ] **Step 5: Run both.** Expected: PASS.
- [ ] **Step 6: Commit** `feat: live admin demo`.

---

### Task 11: SEO, sitemap, structured data, analytics

**Files:**
- Create: `src/routes/sitemap.js`, `tests/worker/sitemap.test.js`, `tests/e2e/seo.spec.js`, `public/robots.txt`
- Modify: every `public/*.html` head; `src/worker.js`

**Interfaces:**
- Consumes: `/data/designs.json` through `ASSETS`.
- Produces: `GET /sitemap.xml`. The site origin comes from the request URL, so it works on workers.dev now and on the custom domain later.

- [ ] **Step 1: Write a failing worker test:** the sitemap contains `/`, `/solutions.html`, the 4 industry URLs, `/designs.html`, the 12 `/designs/<slug>` URLs, `/demo/`, `/about.html`, `/start.html` and `/mockup.html`, and does not contain `/thanks.html` or `/404.html`.
- [ ] **Step 2: Write a failing e2e test.** On every page:
  - one `<title>` and one meta description, both unique across pages
  - `link[rel=canonical]` and `og:image` present
  - the home page has JSON-LD of type `Organization` and `ProfessionalService` (no `priceRange`)
  - the design pages have `BreadcrumbList`
- [ ] **Step 3: Run both.** Expected: FAIL.
- [ ] **Step 4: Implement** the sitemap route, the head tags and the JSON-LD.
  - `robots.txt` allows everything and points to `/sitemap.xml`.
  - Add the Cloudflare Web Analytics beacon snippet with token `data-cf-beacon='{"token":"<owner token>"}'`. The token sits in one marked place in `shell.js`, which skips the beacon when the token is empty.
  - Cloudflare Web Analytics has no custom events, so lead conversions are counted as page views of `/thanks.html?kind=…`. This replaces the "track events" item in spec §9.
- [ ] **Step 5: Run both.** Expected: PASS.
- [ ] **Step 6: Commit** `feat: sitemap, structured data and analytics`.

---

### Task 12: Image prompt sheets

**Files:**
- Create: `docs/image-prompts/README.md`, `docs/image-prompts/site.md`, `docs/image-prompts/<slug>.md` ×12

- [ ] **Step 1: Write `README.md`.** It covers:
  - the workflow: generate in Higgsfield with Nano Banana, then export
  - export rules from spec §6.3: WebP, 2400px wide for desktop screens and 1200px for phones and cards, plus a 600px `-sm` thumbnail for each
  - the file naming that matches `designs.json`
  - a regeneration rule: text inside a screen must be legible, otherwise regenerate
  - a command for the owner to make the `-sm` thumbnails: `npx sharp-cli` with a resize to 600 width
- [ ] **Step 2: Write `site.md`.** About 10 prompts in the brown-wood CTSD world:
  - the homepage hero: desktop, phone, admin and CRM in a wood-slat office
  - the admin hero
  - 4 industry heroes
  - 2 wood textures
  - the OG image at 1200×630
- [ ] **Step 3: Write one sheet per design.** Each states:
  - a fictional organization name
  - that design's own palette and mood (no blue except where the design is not CTSD-branded; each design gets a distinct palette so the shop looks varied)
  - the exact prompt for `cover`, `hero`, `web-1..3`, `app-1..3`, `portal-1` and `admin-1`, with the exact on-screen copy to render and the device framing, following the brand doc's §20 visual rules (product is the hero, no stock-photo people)
  - the alt text for each image
- [ ] **Step 4: Check** that every image path in `designs.json` appears in exactly one prompt sheet. A small check in `tests/unit/prompts.test.js` reads both.
- [ ] **Step 5: Commit** `docs: nano banana prompt sheets for all designs`.

---

### Task 13: Launch QA

**Files:**
- Create: `tests/e2e/links.spec.js`, `docs/launch-checklist.md`

- [ ] **Step 1: Write a link-crawl test.** Starting from `/`, follow every same-origin `a[href]` and check that each returns 2xx, or 404 only for the deliberate `/designs/nope` test. Every `img` must have non-empty `alt`.
- [ ] **Step 2: Run the full suite** with `npm test && npm run test:e2e`. Expected: all PASS.
- [ ] **Step 3: Run Lighthouse** (`npx lighthouse <url> --preset=desktop` and the mobile default) on `/`, `/designs.html`, `/designs/modern-church`, `/start.html` and `/demo/`. Record the scores in `launch-checklist.md`. If anything is below Performance 90 or Accessibility 95, fix it in this task.
- [ ] **Step 4: Do manual passes** in Chrome, Firefox and Safari (WebKit via Playwright) at 375, 768, 1280 and 1920px, and note any issues in the checklist.
- [ ] **Step 5: Commit**, then ask the owner before pushing. Confirm the Cloudflare build succeeds, then run one real lead submission on production. A row should appear in Supabase and an email should arrive at amanorsac@gmail.com.
