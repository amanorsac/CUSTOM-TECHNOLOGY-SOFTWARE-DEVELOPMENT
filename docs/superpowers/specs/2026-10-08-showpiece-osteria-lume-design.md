# Showpiece 1: Osteria Lume

**Status:** approved in chat on 2026-10-08 ("GO START WITH OSTERIA LUME"). This is the first of four industry showpieces: Osteria Lume → Juniper & Vale → Basecamp → Lanternway. Each gets a fully different identity, and each must be heavy on animation.

## Goal

A live demo site for the fictional candlelit restaurant from the CTSD restaurant concept. It should look like a real client site, and its motion should match the current state of the art: depth-map relighting, scroll-driven 3D, a liquid cursor trail and choreographed reveals.

## Identity (shared with no other CTSD page)

- **Colors:** near-black `#0E0A08`, candle amber `#E8A54B`, ember `#C2410C`, cream `#F3E9D8`, smoke `#8A7F72`.
- **Type:** Cormorant Garamond (italic for display) and Jost (UI and body), both self-hosted.
- **Feel:** slow, warm and intimate. Fades and light, no snappy motion.

## Where it lives

- **Page:** `/showcase/osteria-lume`. The page is `public/showcase/osteria-lume.html`, and its own assets live under `public/assets/showcase/osteria-lume/`.
- **Separate from the CTSD site:** no CTSD header or footer. A small floating "Concept by CTSD" badge links to `/designs/restaurant`.
- **Link in:** the restaurant design page gets an "Open live showpiece" button.

## The ten moments

1. **Preloader:** a match strikes against a striker strip (sparks), a WebGL flame catches, and its light expands to open the page. It's skipped on repeat visits in the same session.
2. **Hero relighting:** the hero photo is lit by a shader using a depth map. The cursor is a warm light source, the two candles flicker, and steam rises from the bowl. Without a depth map it falls back to flat radial lighting.
3. **Logo:** "Osteria Lume" draws itself in italic script (SVG stroke, then fill).
4. **Headline:** the headline's letters rise through a mask, one after another.
5. **"Read by candlelight":** an intro paragraph whose words brighten as you scroll past them.
6. **The kitchen** (pinned, about 300vh of scroll): a Three.js scene. Procedural tomatoes, basil leaves, pasta ribbons and flour dust float in and settle around the dish while the camera pushes in. Four captions: flour & eggs, San Marzano tomatoes, garden basil, the wood-fired oven, where the scene warms to fire light.
7. **Menu:** tabs for Antipasti, Pasta, Dal Forno and Dolci. Hovering a dish shows its photo following the cursor with a liquid-distortion trail and velocity skew. On phones, thumbnails show inline.
8. **Wine:** a pinned horizontal scroll of code-drawn bottles with depth parallax and a tilt driven by scroll speed.
9. **Reservations:** a floor-plan SVG with selectable tables (a candle lights on the chosen table), date chips, time slots and party size. Confirming stamps a wax seal. It's labelled as a demo, and no booking is made.
10. **Footer:** rising embers (2D canvas), hours and address.

Throughout: Lenis smooth scroll, GSAP (ScrollTrigger and SplitText) for choreography, a glowing cursor orb, magnetic buttons, and an optional procedural ambience toggle (fire crackle and a warm pad through WebAudio; it's off by default).

## Assets

- **Placeholders:** crops from the restaurant concept images. They're replaced by photos the owner generates from `docs/showcase/osteria-lume-prompts.md`.
- **Depth maps:** made on the dev machine with Depth Anything (via transformers.js) by `scripts/depth-map.mjs`.
- **Optional video:** once Higgsfield credits are available, Kling clips can replace the shader steam in the hero.

## Rules

- **Reduced motion:** no preloader, no pinning, static images; all content and links stay.
- **No WebGL:** static images, and the 2D parts still work.
- **Phones:** lighter scenes, no cursor effects, touch-friendly reservation controls, and no horizontal page scroll.
- **Accessibility:** one `h1`. All copy is real text. The reservation controls are buttons with `aria-pressed` and keyboard support.
- **Performance:** animation pauses while hidden, DPR is capped (1.5 on phones, 2 on desktop), and scenes only render while their section is on screen.

## Tests

Playwright checks:
- The page returns 200 with one `h1` and no console errors.
- The preloader ends and the page becomes interactive.
- The menu tabs switch.
- The reservation flow: pick a table, date, time and party size, then confirm, and the seal appears.
- The reduced-motion and no-WebGL versions.
- No horizontal scroll at 375px.
- The badge links back.
