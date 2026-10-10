# Showpiece 2: Juniper & Vale

**Status:** approved in chat on 2026-10-08 ("push it and keep going with juniper & vale"). This is the second of four industry showpieces: Osteria Lume → Juniper & Vale → Basecamp → Lanternway.

## Goal

A live demo site for the fictional real-estate brokerage from the CTSD real-estate concept. It must look nothing like Osteria Lume: bright, airy and architectural instead of dark and candlelit. The motion should be "tool-like": you play with the home, not just watch it.

## Identity (shared with no other CTSD page)

- **Colors:** paper `#F4F1EC`, ink `#141414`, terracotta `#A9492A`, olive `#3F4A2F`.
- **Type:** Bodoni Moda (display, italic accents) and Manrope (UI and body), both self-hosted.
- **Feel:** precise and editorial, expo easing, crosshair cursor, hairline rules.

## Where it lives

- **Page:** `/showcase/juniper-vale`, from `public/showcase/juniper-vale.html`, with assets under `public/assets/showcase/juniper-vale/`.
- **Separate from the CTSD site:** a floating "Concept by CTSD" badge links to `/designs/real-estate`.
- **Link in:** the real-estate design page shows "Open live showpiece".

## Sections and motion

1. **Preloader:** a house sketch draws itself stroke by stroke, a counter runs to 100, then a clip wipe. Shown once per session.
2. **Hero:** the photo becomes 2.5D through a depth map (mouse, phone tilt or idle drift). A **time-of-day slider** re-grades it live from midday to golden hour to night: the sky cools, stars appear and the windows glow.
3. **Numbers:** count-up stats.
4. **Listings:** a draggable rail with inertia and in-frame photo parallax. A card expands into a full detail view (clip-path from the card's own rect, price counting up). Escape closes. Search filters the rail; Buy/Rent switches to monthly prices.
5. **Floor plan (pinned 3D):** scroll lays the floors, raises the walls, glazes the windows and sets the furniture while the camera turns from plan view to three-quarter, with room labels tracking in 3D.
6. **Before/after staging:** a wipe slider that sweeps once by itself on arrival.
7. **Neighborhoods (pinned 3D):** a procedural valley; the camera flies between three areas with a pin and an info card. Tabs jump to each area.
8. **Mortgage:** four sliders and an odometer payment.
9. **Agents** and a footer call to action.

## Fallbacks

- **Reduced motion or `?still=1`:** no preloader, no WebGL; a still hero photo, an SVG floor plan and a static map card. Everything stays usable.
- **No WebGL:** same as still for the 3D parts; the rest animates.
- **Phones:** lighter pixel ratio, no shadows, wrapped search and tabs, no horizontal scroll.

## Assets

Placeholders are cropped from the concept images by `scripts/showcase-assets.mjs juniper-vale`; the hero depth map comes from `scripts/depth-map.mjs`. Real photos follow `docs/showcase/juniper-vale-prompts.md`.

## Tests

`tests/e2e/showcase.spec.js` covers: a clean live load, the listing open and close, search and Buy/Rent, the before/after, mortgage and neighborhood controls, reduced motion with axe, no WebGL, 375px overflow and the design-page link.
