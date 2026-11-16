# Kingsley Anyenor Artist Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the unlisted, music-first artist site for Kingsley Anyenor at `/preview/kingsley/` on the CTSD Cloudflare Worker.

**Architecture:** Static HTML pages generated at build time from one catalogue JSON by a small Node script, served by the existing Worker. One new Worker route (`GET /api/kingsley/latest`) reads YouTube's public channel feed so the newest release appears without edits. Client JS is plain ES modules: a persistent YouTube player, a same-site page swapper that keeps it playing, and CSS/IntersectionObserver motion. Forms reuse the existing `/api/lead` route.

**Tech Stack:** Cloudflare Workers + static assets (`wrangler`), vanilla ES modules, CSS, `sharp` for images, `@fontsource` fonts, Vitest (unit + `@cloudflare/vitest-pool-workers`), Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-16-kingsley-anyenor-design.md`

## Global Constraints

- Branch `build/kingsley`. Never merge to `main` without asking the owner.
- Every page under `/preview/kingsley/` carries `<meta name="robots" content="noindex, nofollow">` and the concept bar text exactly: `Concept for Kingsley Anyenor · prepared by CTSD · not yet published`.
- Menu, in order: `Home · Music · The Refined · Events · Book · Contact`.
- Palette ("Refined wood", dark): stage black `#0E0F14`, mahogany `#3B1C1F`, wood `#653231`, clay `#8B4740`, ember `#EC8746` (buttons, with stage-black text), rose sand `#D4ACA2`, cream `#F4EBDD`. The CTSD navy/ember palette is not used.
- Type: Fraunces (headings, quote) and Inter (body, UI), self-hosted woff2.
- YouTube embeds use `https://www.youtube-nocookie.com`. No third-party iframe loads before a click.
- All motion is skipped under `prefers-reduced-motion: reduce`; content is readable with JS off.
- Facts only: no view counts, no invented dates or venues. Awards line says only "Nominated, Praise Achievement Awards".
- YouTube channel ID: `UCkjUIJjNjY6sa2VYT1ZumGw`. Spotify artist `1TlaDAmkhwEJv7qz6WfsqE`. Apple Music artist `https://music.apple.com/ng/artist/kingsley-anyenor/1561319671`. Instagram `https://www.instagram.com/kingsleyanyenor/`.
- Quote (exact): `A new generation arose who knew not Jesus but they met me! I reveal the Glorified Jesus in my generation!`
- Motto `Revived to revive`; scripture `Malachi 3:1–3`; pillars and descriptions verbatim from the spec's brief (Revival, Consecration, Restoration).
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Feed holds only Shorts, or is empty/unreachable** → `/api/kingsley/latest` returns the catalogue's first entry with `source: "fallback"`, status 200; the home page keeps its built-in release. (Task 2 tests.)
2. **Newest upload is not in the catalogue** → the latest-release block shows its title and date with only the YouTube button; no Spotify/Apple buttons, no dead links. (Task 7 e2e.)
3. **YouTube iframe API fails to load (blocked, offline)** → pressing play shows "Couldn't load the player. Watch on YouTube" linking to the video, not a dead button. (Task 5 e2e.)
4. **Page swap fetch fails or JS is off** → links behave as normal navigation; nothing breaks. (Task 5 e2e.)
5. **Book/Contact on a branch preview, where Supabase is off and `/api/lead` returns 500** → the form shows an error with a `mailto:` link carrying what was typed; typed values stay in the fields. (Task 10 e2e.)

---

### Task 1: Catalogue data and validator

**Files:**
- Create: `public/assets/preview/kingsley/data/catalogue.json`
- Create: `public/assets/preview/kingsley/js/catalogue.js`
- Test: `tests/unit/kingsley-catalogue.test.js`

**Interfaces:**
- Produces: `catalogue.json` = array, **newest first**, of `{ slug, title, group, year, youtubeId, featuring?, spotifyUrl?, appleUrl?, credits?, live? }`. `group` ∈ `"deeper-worship" | "single" | "medley" | "unveiled"`.
- Produces: `export const GROUPS` (the four group ids with display names `Deeper Worship`, `Singles and live videos`, `Medleys`, `THE UNVEILED`), `export function validateCatalogue(entries) -> string[]` (list of problems; empty = valid), `export function findByYoutubeId(entries, id) -> entry | undefined`.

- [ ] **Step 1: Write the failing tests** — `validateCatalogue(realCatalogue)` returns `[]`; a duplicate slug yields a problem naming it; a missing `youtubeId` yields a problem; an unknown `group` yields a problem; slugs match `/^[a-z0-9-]+$/`; `findByYoutubeId(cat, 'LqwYHMrrYK0').slug === 'deeper-worship-6-0'`; `cat[0].youtubeId === 'LqwYHMrrYK0'`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/kingsley-catalogue.test.js` — expect FAIL (module missing).
- [ ] **Step 3: Write `catalogue.json`.** Collect every non-Short video ID from `https://www.youtube.com/@kingsleyanyenor/videos` (run in a browser: `[...document.querySelectorAll('ytd-rich-item-renderer a#video-title-link')].map(a=>[a.title,a.href])`). Known IDs: Deeper Worship 6.0 `LqwYHMrrYK0`, Deeper Worship 5.0 `JfxWXop_01c`, Praise The Lord `V0n5f8l2C_k`, Ghana Worship Medley `_zihdk3n628`, Amen `qjCvSLDNyrA`. Include all 26 titles listed in the spec's catalogue. Apple links from the spec research (album URLs). Spotify per-release links: open `https://open.spotify.com/artist/1TlaDAmkhwEJv7qz6WfsqE/discography` and copy each; omit `spotifyUrl` where not found.
- [ ] **Step 4: Implement `catalogue.js`** (pure ES module, no DOM) so the tests pass.
- [ ] **Step 5: Run** the test file — expect PASS.
- [ ] **Step 6: Commit** `feat(kingsley): release catalogue and validator`.

### Task 2: YouTube feed parser and `/api/kingsley/latest`

**Files:**
- Create: `src/lib/youtube-feed.js`
- Create: `src/routes/kingsley-latest.js`
- Modify: `src/worker.js` (import and add `kingsleyLatestRoute` to `routes`, before the lead routes)
- Test: `tests/unit/youtube-feed.test.js`, `tests/worker/kingsley-latest.test.js`

**Interfaces:**
- Consumes: `catalogue.json` (Task 1), imported as JSON by the Worker (`import catalogue from '../../public/assets/preview/kingsley/data/catalogue.json'`).
- Produces: `parseFeed(xml: string) -> Array<{ youtubeId, title, published, isShort }>` (never throws; malformed → `[]`); `pickLatest(entries) -> entry | null` (first entry with `isShort === false`).
- Produces: `kingsleyLatestRoute = { method: 'GET', test: url => url.pathname === '/api/kingsley/latest', handle }`. Response JSON: `{ ok: true, youtubeId, title, published, source: "feed" | "fallback" }`, `content-type: application/json; charset=utf-8`, `cache-control: public, max-age=1800`.
- Feed URL: `https://www.youtube.com/feeds/videos.xml?channel_id=UCkjUIJjNjY6sa2VYT1ZumGw`.

- [ ] **Step 1: Write failing unit tests** for `parseFeed`: a fixture with entries in this order — Short `8-Qv7zWQY-U` (link `/shorts/`), video `LqwYHMrrYK0` "DEEPER WORSHIP 6.0 || KINGSLEY ANYENOR [Live Official Video]" published `2026-11-13T08:00:10+00:00` — yields two entries with correct `isShort`; `pickLatest` returns `LqwYHMrrYK0`; empty string → `[]`; `'<feed><entry>'` (malformed) → `[]`; all-Shorts → `pickLatest` returns `null`. Decode `&amp;` `&#39;` `&quot;` in titles.
- [ ] **Step 2: Write failing worker tests** (stub `globalThis.fetch` like `tests/worker/lead.test.js`): feed OK → 200, `source: "feed"`, `youtubeId: "LqwYHMrrYK0"`, `cache-control` contains `max-age=1800`; feed 500 → 200, `source: "fallback"`, `youtubeId` equals `catalogue[0].youtubeId`; fetch throws → fallback; all-Shorts feed → fallback; `POST` → not matched (falls to 404 JSON).
- [ ] **Step 3: Run** `npx vitest run tests/unit/youtube-feed.test.js tests/worker/kingsley-latest.test.js` — expect FAIL.
- [ ] **Step 4: Implement.** Parse with regexes over `<entry>…</entry>` blocks (no DOMParser in Workers). Fetch with `AbortSignal.timeout(5000)`. Cache with `caches.default` keyed on the request URL; only `source: "feed"` responses are written to cache (`ctx.waitUntil(cache.put(...))`).
- [ ] **Step 5: Run** the tests — expect PASS. Then `npm test` — all existing tests still pass.
- [ ] **Step 6: Commit** `feat(kingsley): latest-release route from the YouTube feed`.

### Task 3: Lead kinds for booking and contact

**Files:**
- Modify: `public/assets/js/lead-schema.js` (`KINDS`)
- Modify: `src/lib/email.js` (`ownerEmail` subject)
- Create: `supabase/2026-11-16-leads-booking-contact.sql`
- Test: `tests/unit/lead-schema.test.js`, `tests/worker/lead.test.js`

**Interfaces:**
- Produces: `KINDS = ['project', 'mockup', 'booking', 'contact']`. For `booking` and `contact`, `needs` is not required (only `project` requires it, unchanged). `org_type` remains required for all kinds (the Kingsley forms send it). Kingsley forms send `design_slug: 'kingsley'` to tag the source, and put booking details in `message` (Task 10 composes it).
- Owner email subject for these kinds: `New booking request (Kingsley Anyenor) — <org_name or name>` and `New message (Kingsley Anyenor) — <name>` when `design_slug === 'kingsley'`; existing subjects unchanged otherwise.

- [ ] **Step 1: Write failing tests:** `validateLead({kind:'booking', org_type:'church', name:'A', email:'a@b.co', design_slug:'kingsley', message:'x'}).ok === true` with no `needs` error; `kind:'contact'` likewise; `kind:'spam'` still rejected; worker test: a `booking` lead inserts and the owner email subject starts with `New booking request (Kingsley Anyenor)`.
- [ ] **Step 2: Run** `npx vitest run tests/unit/lead-schema.test.js tests/worker/lead.test.js` — expect FAIL.
- [ ] **Step 3: Implement** the `KINDS` and subject changes. Write the SQL migration: drop and re-add the `leads_kind_check` constraint as `check (kind in ('project','mockup','booking','contact'))` (the inline check in `supabase/leads.sql` is unnamed, so Postgres named it `leads_kind_check`). Do **not** run it; note in the commit body that the owner must run it before production forms accept these kinds.
- [ ] **Step 4: Run** the tests, then `npm test` — expect PASS.
- [ ] **Step 5: Commit** `feat(leads): booking and contact kinds for client artist sites`.

### Task 4: Fonts, images, layout and page build script

**Files:**
- Modify: `scripts/client-assets.mjs` (add `kingsley`: Fraunces 400 + 500 latin normal, Inter 400 + 500 latin normal)
- Create: `scripts/kingsley-images.mjs`
- Create: `scripts/kingsley/layout.mjs`, `scripts/build-kingsley.mjs`
- Create: `public/assets/preview/kingsley/css/site.css`
- Modify: `package.json` (script `"build:kingsley": "node scripts/build-kingsley.mjs"`)
- Test: `tests/unit/kingsley-layout.test.js`

**Interfaces:**
- Produces: `layout({ title, description, active, body, preload? }) -> string` — full HTML document: `lang="en"`, robots noindex meta, `<link rel="stylesheet" href="/assets/preview/kingsley/css/site.css">`, concept bar `.ka-concept`, header (`.ka-header`: wordmark `KA | The Refined` linking to `/preview/kingsley/`, `<nav aria-label="Main">` with the six menu items, `aria-current="page"` on `active`, icon links to YouTube, Spotify, Apple Music, Instagram with `aria-label`s), `<main id="main">${body}</main>`, footer, the player root `<div id="ka-player" hidden>` **outside** `<main>`, and `<script type="module" src="/assets/preview/kingsley/js/app.js">`. Skip link to `#main`.
- Produces: `build-kingsley.mjs` loads `catalogue.json`, imports every `scripts/kingsley/pages/*.mjs` (each `export function render(ctx) -> Array<{ path, html }>`, `ctx = { catalogue, layout, img }`), writes each to `public/preview/kingsley/<path>/index.html`. Pages are added in Tasks 7–10; this task ships the script with an empty pages folder plus a stub `pages/home.mjs` rendering an `<h1>Kingsley Anyenor</h1>` placeholder so the route resolves.
- Produces: `img(name, { alt, sizes, eager? }) -> string` helper in `layout.mjs` emitting `<picture>` with WebP + JPEG, `width`/`height`, `loading="lazy"` unless `eager`.
- Produces: images at `public/assets/preview/kingsley/img/<name>-{800,1600}.{webp,jpg}` (max width 2000, quality 78) and `img/manifest.json` `{ name: { w, h } }`.
- CSS tokens in `site.css` `:root`: `--ka-black`, `--ka-mahogany`, `--ka-wood`, `--ka-clay`, `--ka-ember`, `--ka-rose`, `--ka-cream` with the Global Constraints values; `@font-face` for both families; base type, header, footer, concept bar, buttons (`.ka-btn` ember fill / stage-black text; `.ka-btn--ghost`), focus ring in ember, 16px side gutter at ≤480px, no horizontal overflow.

- [ ] **Step 1: Download photos** from the owner's Drive folder "KINGSLEY ANYENOR" into `assets-src/kingsley/` (gitignored). Needed: `_MG_9033`, `_MG_9032`, `_MG_9034`, `AMH_5849`, `AMH_5851` (carousel); `AMH_5843`, `AMH_5845`, `AMH_5789`, `AMH_5791`, `AMH_5953`, `AMH_5954`, `AMH_5821`, `_MG_9069`, `_MG_9012`, `_MG_9014`, `_MG_9025` (sections, galleries); `GREY7822.png`, `GREY78221.png`, `GREY7822-Recovered.png2.png` (portraits); six from `REFIENED EX OLD` for the past-events gallery.
- [ ] **Step 2: Write failing test** for `layout()`: output contains the robots meta, the exact concept bar text, six nav links in menu order, `aria-current="page"` only on the active item, `#ka-player` appears after `</main>`, exactly one `<main`.
- [ ] **Step 3: Run** `npx vitest run tests/unit/kingsley-layout.test.js` — expect FAIL.
- [ ] **Step 4: Implement** `layout.mjs`, `site.css`, the fonts entry, `kingsley-images.mjs` (sharp; rename outputs to lowercase-kebab, e.g. `mg-9033`), and `build-kingsley.mjs`. Run `node scripts/client-assets.mjs kingsley`, `node scripts/kingsley-images.mjs`, `npm run build:kingsley`.
- [ ] **Step 5: Run** the test — expect PASS. `npx wrangler dev`, open `/preview/kingsley/`: 200, concept bar shows, response header `x-robots-tag: noindex, nofollow`.
- [ ] **Step 6: Commit** `feat(kingsley): fonts, images, layout and page build`.

### Task 5: Persistent player and page swapper

**Files:**
- Create: `public/assets/preview/kingsley/js/app.js`, `js/player.js`, `js/nav.js`
- Modify: `public/assets/preview/kingsley/css/site.css` (player bar)
- Test: `tests/e2e/kingsley-player.spec.js`

**Interfaces:**
- Consumes: page markup convention — any `button[data-play]` with `data-play="<youtubeId>"`, `data-title`, optional `data-queue="<group id>"`. Group membership comes from `catalogue.json` (fetched once by `player.js`).
- Produces: `player.js` exports `initPlayer()`, `play(youtubeId, { title, queue? })`, `toggle()`, `next()`, `expand(bool)`. Loads `https://www.youtube.com/iframe_api` on first `play`, creates one `YT.Player` with `host: 'https://www.youtube-nocookie.com'`. The bar (`#ka-player`, un-hidden on first play) shows thumbnail `https://i.ytimg.com/vi/<id>/mqdefault.jpg`, title, play/pause, next, expand; buttons have `aria-label`s; the progress bar has `role="progressbar"`. If the API fails to load within 8 s, the bar shows `Couldn't load the player.` with a link `Watch on YouTube` → `https://www.youtube.com/watch?v=<id>`.
- Produces: `nav.js` exports `initNav()`: intercepts left-clicks without modifier keys on same-origin links whose path starts with `/preview/kingsley/` (excluding `#` links and `download`/`target` links), fetches the page, replaces `#main` content and `document.title`, `history.pushState`, scrolls to top, moves focus to the new `h1`, then dispatches `document.dispatchEvent(new CustomEvent('ka:page'))`. Handles `popstate`. On any fetch error or non-200, falls back to `location.href = url`.
- Produces: `app.js` calls `initPlayer()`, `initNav()`, and on load plus every `ka:page` event delegates `[data-play]` clicks (one document-level listener) and calls `initMotion(document.getElementById('main'))` once Task 6 exists (guard with a dynamic import that tolerates absence until then).

- [ ] **Step 1: Write failing e2e tests** (add two temporary `data-play` buttons to the stub home page via the home render, removed in Task 7): clicking play shows `#ka-player` with the title; with `**/iframe_api` routed to abort, the bar shows `Couldn't load the player.` and the YouTube link; after starting playback, clicking the `Music` nav link changes the URL and title without a full load (`page.evaluate(() => window.__kaMarker = 1)` before, still `1` after) and `#ka-player` is still visible; with `**/preview/kingsley/music/**` routed to return 500, clicking Music does a full navigation (marker gone); with JS disabled (`javaScriptEnabled: false` context), nav links still navigate.
- [ ] **Step 2: Run** `npx playwright test tests/e2e/kingsley-player.spec.js --project=chromium` — expect FAIL.
- [ ] **Step 3: Implement** the three modules and player styles (bar fixed to the bottom, mahogany background, ember progress, safe-area padding; body gets bottom padding equal to the bar height while it shows).
- [ ] **Step 4: Run** the spec — expect PASS.
- [ ] **Step 5: Commit** `feat(kingsley): persistent player that survives page changes`.

### Task 6: Motion and the hero carousel

**Files:**
- Create: `public/assets/preview/kingsley/js/motion.js`, `js/carousel.js`
- Modify: `public/assets/preview/kingsley/css/site.css`
- Test: `tests/e2e/kingsley-motion.spec.js`

**Interfaces:**
- Produces: `motion.js` `initMotion(root)`; classes pages use: `.ka-split` (heading; JS wraps each line in a mask span; lines rise, 500 ms, 80 ms stagger), `.ka-wedge` (image wipes in from the left through a slanted `clip-path` polygon, 700 ms), `.ka-up` (fade up 16 px), `.ka-parallax` (background moves at 0.6× scroll via `transform`, rAF-throttled). An IntersectionObserver adds `.is-in` once at 15% visibility. Under `prefers-reduced-motion: reduce`, or before JS runs, every element is in its final state (the CSS hides nothing unless `html.ka-motion` is set by JS).
- Produces: `carousel.js` `initCarousel(el)` for `.ka-carousel` markup: slides `.ka-slide` (first is `is-active`), prev/next buttons, dot buttons (`aria-label="Slide N of M"`, `aria-current` on active), region `aria-roledescription="carousel"`. Auto-advance every 6000 ms with cross-fade and 1.08→1 scale; pauses on hover, focus-within and when the tab is hidden; swipe via pointer events (40 px threshold); ArrowLeft/ArrowRight when focused. Reduced motion: no auto-advance, no zoom; manual controls still work. Also `initRow(el)` for `.ka-row` (horizontal scroll-snap row with dots and prev/next).

- [ ] **Step 1: Write failing e2e tests** on a fixture page `public/preview/kingsley/_motion-test/index.html` (generated by a `pages/_motion-test.mjs`, removed in Task 11): carousel shows slide 2 after 6.5 s; clicking next moves to the following slide and updates `aria-current`; ArrowRight works when focused; with `reducedMotion: 'reduce'` the slide stays on 1 after 7 s and `.ka-split` text is visible immediately; `.ka-up` element gains `.is-in` after scrolling into view; the row's next button scrolls it.
- [ ] **Step 2: Run** `npx playwright test tests/e2e/kingsley-motion.spec.js --project=chromium` — expect FAIL.
- [ ] **Step 3: Implement** both modules and their CSS.
- [ ] **Step 4: Run** the spec — expect PASS.
- [ ] **Step 5: Commit** `feat(kingsley): reveal motion, hero carousel and video row`.

### Task 7: Home page

**Files:**
- Modify: `scripts/kingsley/pages/home.mjs`
- Create: `public/assets/preview/kingsley/js/latest.js`
- Modify: `site.css`
- Test: `tests/e2e/kingsley-home.spec.js`

**Interfaces:**
- Consumes: `layout`, `img`, catalogue, `[data-play]`, motion classes, `initCarousel`, `initRow`, `GET /api/kingsley/latest`.
- Produces: sections in spec order — (1) hero `.ka-carousel` with slides `mg-9033` (eager, preloaded via `layout({ preload })`), `mg-9032`, `mg-9034`, `amh-5849`, `amh-5851`; `<h1>` "Revived to revive." with the visible line "Kingsley Anyenor · The Refined · Accra"; buttons "Listen now" (`href="#latest"`) and "Book Kingsley" (`/preview/kingsley/book/`). (2) `#latest` block built from `catalogue[0]`, with `data-latest` hooks for `latest.js`. (3) video row "Live worship": catalogue entries with `live: true` led by `deeper-worship-3-0`, `ghana-worship-medley`, `ghana-praise-medley`, six cards, "More videos" → `/preview/kingsley/music/`. (4) split quote panel: quote on wood, "Revived to revive" intro + "About The Refined" link on cream. (5) full-width live band `.ka-parallax` using `amh-5845`, one play button `data-play` = `catalogue[0].youtubeId`, `data-expand`. (6) pillars. (7) Spotify artist embed behind a "Load Spotify player" button that inserts `https://open.spotify.com/embed/artist/1TlaDAmkhwEJv7qz6WfsqE`. (8) events strip "The Refined Experience 2027 · coming soon" → Events.
- Produces: `latest.js` `initLatest(root)`: fetches the API; if the id differs from the built one, updates title, date (format `13 Nov 2026`, `en-GB`), thumbnail, play button; uses `findByYoutubeId` for streaming links and removes Spotify/Apple buttons when absent. Network failure leaves the built block untouched.

- [ ] **Step 1: Write failing e2e tests:** one `h1`; carousel has 5 slides; with `/api/kingsley/latest` mocked to `{ ok:true, youtubeId:'ZZZZZZZZZZZ', title:'New Song', published:'2026-12-01T08:00:00Z', source:'feed' }` the latest block shows "New Song", "1 Dec 2026", a YouTube link to that id, and no Spotify or Apple link; mocked to abort, it shows "Deeper Worship 6.0"; the video row has 6 cards; Spotify iframe is absent until the button is clicked; no horizontal scroll at 375×812; axe finds no serious or critical violations.
- [ ] **Step 2: Run** `npx playwright test tests/e2e/kingsley-home.spec.js --project=chromium` — expect FAIL.
- [ ] **Step 3: Implement**, remove Task 5's temporary buttons, `npm run build:kingsley`.
- [ ] **Step 4: Run** the spec — expect PASS. Also re-run `kingsley-player.spec.js` (update its selectors to the real home page play buttons).
- [ ] **Step 5: Commit** `feat(kingsley): home page with live latest release`.

### Task 8: Music page and release pages

**Files:**
- Create: `scripts/kingsley/pages/music.mjs`
- Modify: `site.css`
- Test: `tests/e2e/kingsley-music.spec.js`

**Interfaces:**
- Consumes: catalogue, `GROUPS`, `layout`, `[data-play]` with `data-queue`.
- Produces: `/preview/kingsley/music/` — `<h1>Music</h1>`, groups in order Deeper Worship (numbered cards, newest first), Singles and live videos, Medleys, THE UNVEILED. Each card: thumbnail `https://i.ytimg.com/vi/<id>/hqdefault.jpg` (`loading="lazy"`, alt = title), title, year, play button (`data-queue` = group), link to its release page.
- Produces: `/preview/kingsley/music/<slug>/` per entry — `<h1>` title, type and year, featuring, credits if present, a click-to-load YouTube embed (poster + play button; click replaces with the nocookie iframe), Spotify embed (`https://open.spotify.com/embed/...` derived from `spotifyUrl`) behind its own load button only when `spotifyUrl` exists, and streaming buttons only for links that exist.

- [ ] **Step 1: Write failing e2e tests:** the Music page has one card per catalogue entry (read the JSON in the test); group headings in order; a release page with no `spotifyUrl` has no Spotify button; `/music/deeper-worship-6-0/` has no `iframe` until its play button is clicked, then one `iframe[src^="https://www.youtube-nocookie.com/embed/LqwYHMrrYK0"]`; every release page returns 200.
- [ ] **Step 2: Run** the spec — expect FAIL.
- [ ] **Step 3: Implement** and rebuild.
- [ ] **Step 4: Run** — expect PASS.
- [ ] **Step 5: Commit** `feat(kingsley): music archive and a page per release`.

### Task 9: The Refined and Events pages

**Files:**
- Create: `scripts/kingsley/pages/the-refined.mjs`, `scripts/kingsley/pages/events.mjs`
- Create: `public/assets/preview/kingsley/js/tabs.js`
- Modify: `site.css`
- Test: `tests/e2e/kingsley-pages.spec.js`

**Interfaces:**
- Produces: `/preview/kingsley/the-refined/` in spec order: intro ("Revived to revive", Malachi 3:1–3), story with portrait `grey7822`, three pillars verbatim, worship philosophy quote "a natural response to the greatness of God", band and choir (Apostle Kubi — producer and piano; Theophil Jed Jnr — music director; Joojo Forson — drums; Stephen Amanor Sackey — mixing and mastering), gallery (6 stage photos, `.ka-wedge`), "Nominated, Praise Achievement Awards". Rose-sand/cream light sections alternate with dark.
- Produces: `/preview/kingsley/events/` with an accessible tab list (`role="tablist"`, Upcoming / Past, arrow-key switching via `tabs.js`): Upcoming holds one card "The Refined Experience 2027 · Coming soon · Accra" (no date, no RSVP); Past holds "The Refined Experience" with the REFINED NEW gallery and an earlier gathering gallery from REFIENED EX OLD, no dates. Intro names New Wineskin as a flagship gathering.

- [ ] **Step 1: Write failing e2e tests:** both pages one `h1` and 200; the four collaborator names present; events tabs switch with click and ArrowRight, `aria-selected` follows; Upcoming contains "Coming soon" and no `<form>`; no text matching `/\b20\d\d-\d\d-\d\d\b/` or a weekday name on Events; axe clean.
- [ ] **Step 2: Run** — expect FAIL.
- [ ] **Step 3: Implement** and rebuild.
- [ ] **Step 4: Run** — expect PASS.
- [ ] **Step 5: Commit** `feat(kingsley): The Refined and Events pages`.

### Task 10: Book and Contact forms

**Files:**
- Create: `scripts/kingsley/pages/book.mjs`, `scripts/kingsley/pages/contact.mjs`
- Create: `public/assets/preview/kingsley/js/forms.js`
- Test: `tests/unit/kingsley-forms.test.js`, `tests/e2e/kingsley-forms.spec.js`

**Interfaces:**
- Consumes: `POST /api/lead`, `validateLead` and `KINDS` (Task 3), `fallbackHref(address, subject, data)` from `public/assets/js/form-model.js`.
- Produces: `forms.js` exports `bookingPayload(fields) -> object` and `contactPayload(fields) -> object` (pure), plus `initForms(root)`. `bookingPayload` returns `{ kind:'booking', design_slug:'kingsley', org_type, org_name, name, email, phone, message, website_hp }` where `org_type` maps the organiser select: Church → `church`, Campus or school → `school`, Ministry or nonprofit → `nonprofit`, Corporate → `business`, Other → `other`; and `message` is labelled lines in this order: `Event name`, `Event date`, `Start time`, `Length of ministration`, `Host pastor or minister`, `Other ministers`, `Venue and city`, `Country`, `Notes` (blank fields omitted). `contactPayload` returns `{ kind:'contact', design_slug:'kingsley', org_type:'other', name, email, message, website_hp }`.
- Book fields (all labelled, required marked): organiser type*, organisation name*, contact name*, phone* (`type="tel"`, placeholder `+233`), email*, host pastor or minister, event name*, date* (`type="date"`), start time (`type="time"`), length of ministration (select: 15 min, 30 min, 45 min, 1 hour, More than 1 hour), other ministers, venue and city*, country* (default Ghana), notes; hidden honeypot `website_hp`.
- Behaviour: client validation shows inline messages and focuses the first invalid field; submit button shows "Sending…"; success replaces the form with "Thank you. Kingsley's team will be in touch." (book) / "Thank you. Your message is on its way." (contact); any non-OK response shows "Couldn't send right now. Email us instead:" with a `mailto:amanorsac@gmail.com` link from `fallbackHref`, keeping all typed values.

- [ ] **Step 1: Write failing unit tests:** `bookingPayload` maps "Campus or school" → `school`; message lines appear in the listed order and omit blanks; `validateLead(bookingPayload(sample)).ok === true`; `validateLead(contactPayload(sample)).ok === true`.
- [ ] **Step 2: Write failing e2e tests:** submitting the empty Book form shows errors and focuses organiser type; with `/api/lead` mocked 200, success text appears and the request body has `kind: "booking"` and `design_slug: "kingsley"`; mocked 500 shows the mailto link and the name field still holds what was typed; Contact form success with mocked 200.
- [ ] **Step 3: Run** both — expect FAIL.
- [ ] **Step 4: Implement** and rebuild.
- [ ] **Step 5: Run** — expect PASS.
- [ ] **Step 6: Commit** `feat(kingsley): booking and contact forms`.

### Task 11: Whole-site checks, cleanup and preview deploy

**Files:**
- Delete: `scripts/kingsley/pages/_motion-test.mjs` and `public/preview/kingsley/_motion-test/` (update `kingsley-motion.spec.js` to run against the home page)
- Create: `tests/e2e/kingsley-site.spec.js`

- [ ] **Step 1: Write the site spec:** for every built page (walk `public/preview/kingsley/**/index.html`): status 200, one `h1`, robots meta, header `x-robots-tag: noindex, nofollow`, concept bar text, no console errors, no horizontal scroll at 375 px, axe no serious/critical; `/sitemap.xml` and the CTSD home contain no `/preview/kingsley`; colour contrast of cream on stage black and stage black on ember checked by axe.
- [ ] **Step 2: Run** `npm test` and `npx playwright test --grep kingsley` (chromium and webkit) — fix anything failing at its source.
- [ ] **Step 3: Commit** `test(kingsley): whole-site checks`.
- [ ] **Step 4: Ask the owner before pushing.** On yes: `git push -u origin build/kingsley`; share `https://build-kingsley-custom-technology-software-development.amanorsac.workers.dev/preview/kingsley/` after confirming it returns 200 and the latest release loads.
