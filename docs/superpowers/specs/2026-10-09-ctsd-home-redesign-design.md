# CTSD home redesign (Phase 1): the workshop wall

**Status:** approved in chat on 2026-10-09: direction "Evolve the brand", hero "Workshop wall", and the section design ("yes"). Phase 2 (the inner pages) gets its own spec later.

## Goal

The CTSD home page should feel as crafted as the four showpieces. Within one second a prospect should see that CTSD builds sites like these, and the page should lead them to the showpieces, the Lab and "Start a project". It stays recognizably CTSD: the brown-wood brand, all four verticals given equal weight, and concepts labeled "Concept".

## Constraints (unchanged from the site spec of 2026-10-03)

- **Palette:** Deep Brown `#3E2723`, Wood Brown `#6B4F32`, Warm Tan `#C89B6B`, Gold `#D4AF37`, Cream `#F7EFE4`, Charcoal `#1A1A1A`, Sage `#556B2F`, Off White `#FBF9F6`.
- **Type:** Montserrat, Poppins and Inter (the existing tokens in `public/assets/css/tokens.css`).
- **Stack:** static `public/` served by the Cloudflare Worker, with the shared shell from `shell.js`. Vendored libraries only: three.js, GSAP with ScrollTrigger/SplitText/Flip, and Lenis.
- **Copy:** the h1 "Technology built around your organization." and its two buttons stay. There is no dollar sign anywhere on the page. The four verticals get equal weight.
- **Content kept:** the 7 services, the 8-step journey, the 6-step process, the live-demo link, integrations as text wordmarks (no logo images), and the final call to action. The redesign changes their form, not their content.

## Page structure

1. **Hero: the workshop wall (`data-section="hero"`)**
   - **Scene:** a three.js scene of vertical walnut slats under low warm light. Four framed screens hang on the wall, each playing a muted 6–8 s loop cut from the showpiece walkthroughs (Osteria, J&V, Basecamp, Lanternway). Each loop is about 640 px wide, H.264 MP4 with a WebP poster.
   - **Work lamp:** the cursor moves a warm spotlight across the slats. Screens near the light brighten, and on touch the lamp drifts slowly by itself.
   - **Copy:** the h1, lead text and both buttons are normal DOM on the left, with the existing kicker and vertical line under them.
   - **Scroll:** the hero is pinned for about 1.6 screens. The camera dollies into the first screen until it fills the viewport, then hands over to the reel.
   - **Loading:** the LCP image is a pre-rendered still of the wall (`hero__img`, high priority). The WebGL canvas fades in over it once the videos can play.
2. **Showpiece reel (`data-section="featured"`):**
   - Pinned. The four showpieces appear one per screen, and the page background and text colors morph into each one's palette.
   - Each shows the "Concept" badge, its name, industry, three motion highlights, "Open live showpiece" (`/showcase/<slug>`) and "See the design" (`/designs/<slug>`).
   - A looping video of the showpiece plays in a tilted frame.
3. **What we build (`data-section="services"`):**
   - The 7 services as nodes of one connected-system diagram (SVG), with the integrations as text wordmarks along its edge.
   - Hovering or focusing a service lights its connections, and dots travel along the lines. The services stay a real list (`ul`, 7 `li`) for screen readers and tests.
4. **The journey (`data-section="journey"`):** the 8 steps as a horizontal track that scrolls sideways while pinned. The current step is highlighted, and it falls back to a static ordered list.
5. **Built for your team (`data-section="manage"`):** the live demo dashboard in a laptop frame that tilts with the mouse, plus the "Open the live demo" link.
6. **Industries (`data-section="industries"`):** four equal cards. Hovering one plays its showpiece loop (business: Osteria, church: Lanternway, education: Basecamp, nonprofit: a still), and each links to its industry page.
7. **Lab teaser:** a strip with the Lab's particle preview video and a link to `/lab/`.
8. **Process (`data-section="process"`):** the 6 steps along a line that draws as you scroll, each step lighting up as it is reached.
9. **Integrations (`data-section="integrations"`):** the wordmarks drift as a slow two-row marquee (the same wordmarks also appear in section 3).
10. **Final call to action (`data-section="cta"`):** "Tell us what your organization needs" on wood slats, with the warm lamp following the cursor and a magnetic "Start Your Project" button.

**Section order:** hero, featured, services, journey, manage, industries, lab, process, integrations, cta. The reel moves up to second place, so it is the first thing after the hero. The order test in `home.spec.js` is updated to match; it is the only existing expectation that changes.

## Shared header and footer (all pages, via `shell.js` and `site.css`)

- **Header:** hides on scroll down and returns on scroll up. It turns solid after the hero, and "Start a Project" becomes magnetic.
- **Footer:** big Montserrat "Let's build yours.", the warm lamp hover and the existing links.
- **Not changed in Phase 1:** inner-page layouts.

## Fallbacks and performance

- **Reduced motion or `?still=1`:** no pinning, WebGL or marquees. The hero shows the still wall image, the reel becomes four stacked cards with posters, and the journey and process are static lists.
- **No WebGL:** the still wall plus the four loops as `<video>` elements positioned over the screens.
- **Budget:** the first load stays under 1.2 MB before scroll. Videos use `preload="none"` and load when near the viewport. Loops pause off-screen.
- **Phones:** a shorter pin, a single autoplaying loop in the hero, and the reel as swipeable cards.

## Assets

- **Hero still:** made by rendering the WebGL wall once with a Playwright script (`scripts/home-assets.mjs`).
- **Loops:** cut from `.superpowers/showcase/*-walkthrough.mp4` with ffmpeg-static into `public/assets/home/loops/`.
- **Wood:** the slat texture is procedural (shader noise), so no photo is needed.

## Tests

- **Updated:** `home.spec.js` (section order, featured: four reel items with both links each).
- **New:**
  - the hero still is LCP and high priority, and every other image and video is lazy
  - the WebGL canvas appears in live mode and is absent in still mode
  - the reel links resolve
  - axe has no serious violations in still mode
  - no horizontal scroll at 375 px
  - loops are paused off-screen (the `paused` property)
- **Must stay green:** all existing suites, including the shell, SEO and link crawler.
