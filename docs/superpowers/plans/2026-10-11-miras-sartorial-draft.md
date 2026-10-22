# Mira's Sartorial Draft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An unlisted, noindexed draft store at `/preview/miras-sartorial` that turns every path into a WhatsApp custom-order message.

**Architecture:** One static page, `public/preview/miras-sartorial.html`, styled by `ms.css` and driven by `main.js` under `public/assets/preview/miras-sartorial/`. The existing worker serves it, and the existing `/preview/` rules make it noindexed. Images, fonts and the QR code SVG come from `scripts/client-assets.mjs miras-sartorial`.

**Tech Stack:**
- static HTML, CSS and vanilla JS
- sharp for images, qrcode for the QR SVG, and @fontsource for fonts
- Playwright for tests

**Spec:** `docs/superpowers/specs/2026-10-11-miras-sartorial-draft-design.md`. The owner update at its top wins over the rest.

## Global Constraints

- **Name.** Text says "Mira's Sartorial". The seller is Obaa Yaa Botchway.
- **WhatsApp.** The number is `233557018888`. The message starts with "Hello Mira's Sartorial, I'd like to request a custom piece."
- **Prices.** Every piece reads "Price on request".
- **Placeholders.** Only the three reels are placeholders.
- **Nothing is sent.** The page posts and fetches nothing, and loads no third-party script or font.
- **Reference only.** Nothing names or imitates Louis Vuitton.
- **WCAG AA.** Sun `#F2A20C` is used only behind ink text.

## Review Focus

1. **Deep link on load.** Loading `#piece-<slug>` with an unknown slug must not throw, and must leave the page usable.
2. **Measurements.** Choosing "My own measurements" and then switching back to a size must drop the measurements line from the message.
3. **Dialog close.** Back, Escape and the close button must all leave the hash cleared and focus on the card.
4. **Phone layout.** At 375 px the dialog fits the screen, and the form is reachable by scrolling.
5. **Reduced motion.** The hero must not drift, and no content may start hidden.

---

### Task 1: Assets

**Files:**
- Modify: `scripts/client-assets.mjs`, which gains a `miras-sartorial` entry.
- Inputs: the sources in `assets-src/miras-sartorial/` (git-ignored).

**Produces** files in `public/assets/preview/miras-sartorial/`:

| Kind | Files |
|---|---|
| Fonts | `fonts/cormorant-500.woff2`, `cormorant-500-italic.woff2`, `cormorant-600.woff2`, `jost-400.woff2`, `jost-500.woff2` |
| Hero | `img/hero-wide.webp` (1800 wide), `img/hero-tall.webp` (1000 wide) |
| Prints | `img/<print>-flat.webp` and `img/<print>-model.webp` for each print |
| Red Floral gallery | `img/red-floral-{side,back,waist,fabric}.webp` |
| Seller | `img/atelier.webp` |
| Brand | `img/logo.png`, `img/wordmark.png` |
| QR code | `img/whatsapp-qr.svg` |

Crops are as in the scratch preview: the catalogue sheet panels and the quarter panels of the tall models photo.

- [ ] Run `node scripts/client-assets.mjs miras-sartorial`. Expected: it lists every file above.
- [ ] Commit the script, `package.json`, the lock file and the outputs.

### Task 2: Tests (RED)

**Files:** Create `tests/e2e/miras.spec.js`, covering each test in the spec's Testing section, adjusted for the owner update:

- **Page and indexing**
  - one h1, no errors
  - noindex meta, X-Robots-Tag, absent from the sitemap
  - no horizontal scroll and no serious axe violations at 375 and 1280 px
  - every image src is under `/assets/preview/miras-sartorial/`
- **The edit and the dialog**
  - five cards, each with "Price on request"
  - the dialog opens on click and on `#piece-pink-swirl`
  - Escape closes it, clears the hash and returns focus to the card
  - arrow keys change the image
  - an unknown slug opens nothing
- **WhatsApp**
  - required fields show errors
  - "My own measurements" requires measurements
  - the message text is exact
  - the WhatsApp link is `https://wa.me/233557018888?text=` plus the encoded message
  - switching back from own measurements drops that line
  - the service buttons fill the order form with a "Service:" line
- **Content and fallbacks**
  - the only placeholders are three `[data-placeholder="reel"]`
  - the name "Obaa Yaa Botchway" appears
  - the QR image is present
  - the Instagram and TikTok links point to her profiles, with `target="_blank"` and `rel="noopener"`
  - under reduced motion, the hero animation is `none`
  - without JavaScript, the five piece names and the order section are visible

- [ ] Run `npx playwright test tests/e2e/miras.spec.js --project=chromium`. Expected: FAIL, with a 404 on the page.

### Task 3: The page (GREEN)

**Files:**
- Create `public/preview/miras-sartorial.html`.
- Create `public/assets/preview/miras-sartorial/ms.css`.
- Create `public/assets/preview/miras-sartorial/main.js`.

The page follows the spec's sections. The piece cards are in the HTML, so they read without JavaScript. Each piece's details are written in the HTML as well, inside `<template>` elements per piece, and the dialog is filled from them.

- [ ] Run the Task 2 tests in Chromium, then in WebKit with `--workers=1`. Expected: all pass.
- [ ] Commit.

### Task 4: Verify and ship

- [ ] Run `npx vitest run` and the full Chromium suite. Expected: green.
- [ ] Take screenshots at 375 and 1440 px, then push the branch and open a PR against main.
