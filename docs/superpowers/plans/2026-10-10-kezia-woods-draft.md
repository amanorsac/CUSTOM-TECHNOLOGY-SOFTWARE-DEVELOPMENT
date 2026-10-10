# Kezia Woods Draft Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the unlisted "cover story" draft site for Kezia Woods at `/preview/kezia-woods`.

**Architecture:** One static page plus its own CSS and JS module under `public/assets/preview/kezia-woods/`, using the vendored GSAP, ScrollTrigger, SplitText and Lenis. The worker adds `X-Robots-Tag` for `/preview/`, and robots.txt disallows it.

**Spec:** `docs/superpowers/specs/2026-10-10-kezia-woods-draft-design.md`

## Global Constraints
- Public facts only. The only quote is "I'm beyond blessed to have this opportunity." (29 News).
- No press photos, no Bonchon logo; forms make no network request.
- Palette `#F6F1E7 #16130F #5A5248 #D9CFBF`, accents `#C8941E #1E4D3A #B23A2A`. Fonts: DM Serif Display, Newsreader and IBM Plex Mono, self-hosted.
- Modes `kw-live` and `kw-still` (reduced motion or `?still=1`).

## Review Focus
1. **Forms:** submitting with empty required fields must not show a confirmation, and must focus the first invalid field.
2. **Keyboard:** the cover pin must not trap focus; tabbing from the draft bar reaches the story links.
3. **Phones:** the long nameplate must fit 375 px without horizontal scroll.
4. **Indexing:** every response under `/preview/` must carry `X-Robots-Tag`, including the HTML page.
5. **No JS:** all content must be visible and readable.

### Task 1: Keep `/preview/` out of search engines
- **Test:** `tests/` vitest. robots.txt contains `Disallow: /preview/`; an HTML response for `/preview/x` carries `x-robots-tag: noindex, nofollow`.
- **Implementation:** `src/routes/sitemap.js` (robots body) and `src/worker.js` (set the header on HTML responses whose path starts with `/preview/`).

### Task 2: The page (still mode first, then motion)
- **Files:** `public/preview/kezia-woods.html`, `public/assets/preview/kezia-woods/{kw.css,main.js,fonts/}`, `scripts/client-assets.mjs`.
- **Test:** `tests/e2e/kezia.spec.js`, covering every e2e item in the spec's Tests section plus Review Focus 1, 3 and 5.

### Task 3: Verify and ship
- Full suites, screenshots, a walkthrough (`scripts/showcase-preview.mjs` with a `kezia` script), then a PR against `main`.
