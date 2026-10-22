# Kezia Woods Redo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the "cover story" draft at `/preview/kezia-woods` with "The Founder", a calm public-figure site.

**Architecture:** One static page, `public/preview/kezia-woods.html`, plus `kw.css` and `main.js` under `public/assets/preview/kezia-woods/`, with no libraries. The fonts come from `scripts/client-assets.mjs kezia-woods`, which also converts any stand-in or real photos found in `assets-src/kezia-woods/`.

**Spec:** `docs/superpowers/specs/2026-10-11-kezia-woods-redo-design.md`

## Rulings

**The photos aren't generated yet.** On 2026-10-12, Higgsfield refused all seven stand-in images because the plan is out of credits. Each photo slot is therefore a designed frame: a soft gradient with grain and a caption naming the photo to come. Each frame carries `data-standin` and a visible "Photo to come" tag.

The prompts are saved in `docs/image-prompts/kezia-woods.md`. When files land in `assets-src/kezia-woods/<slot>.(jpg|png|webp)`, the script writes `img/<slot>.webp`, and the page swaps the frame for the photo. The swap is an `<img>` added inside the frame, with the tag text changed to "Stand-in image".

The cost if this is wrong is one HTML edit per slot.

## Tasks

1. **Fonts and dependencies.**
   - Add `@fontsource/bodoni-moda` and `@fontsource/dm-sans`. Remove the old Kezia-only font packages.
   - Update the `kezia-woods` entry in `client-assets.mjs`, and add the optional photo step.
   - Run the script. Expected: 4 fonts copied, and "no photos yet".
2. **Tests (RED).** Rewrite `tests/e2e/kezia.spec.js` to the spec's Testing section, using the "Photo to come" ruling. Run it in Chromium. Expected: failures on the old page.
3. **The page (GREEN).** Replace `kezia-woods.html`, `kw.css` and `main.js`, and delete the old fonts. Expected: all tests pass in Chromium.
4. **Verify and ship.**
   - Run vitest.
   - Take screenshots at 375 and 1440 px.
   - Push and open a PR. The Cloudflare branch preview link comes from the PR checks.
