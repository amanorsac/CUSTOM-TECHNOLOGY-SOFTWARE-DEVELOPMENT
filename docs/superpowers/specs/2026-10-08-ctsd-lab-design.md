# CTSD Lab: four "wow" experiments

**Status:** approved in chat on 2026-10-08 ("Everything looks right. Build and don't stop till you are done."). This is phase B of three: the Lab now, then industry showpieces (phase A) once the Lab is approved, then the main site redesign.

## Goal

Four live, CTSD-branded web experiments that show the level of motion and 3D work now possible. They give people something to share on social media and act as a portfolio piece. Each experiment shows off one signature technique.

## Where they live

Inside the CTSD site, in the same static HTML and Cloudflare Worker setup, with no build step:

| Path | Experiment |
|---|---|
| `/lab` | Index: four cards, each with a looping preview and a one-line description |
| `/lab/particles` | Particle morph |
| `/lab/workshop` | Scroll-flight 3D workshop |
| `/lab/gallery` | Liquid shader gallery |
| `/lab/playground` | Physics playground |

- Pages: `public/lab/**/index.html`.
- Scripts: `public/assets/lab/*.js`, as ES modules.
- Third-party libraries are copied into `public/assets/vendor/` by `scripts/vendor-lab.mjs`: Three.js, Lenis and Matter.js. Nothing loads from a CDN. (GSAP was planned but wasn't needed: each experiment drives its own timing from scroll and time.)
- "Lab" is added to the main navigation and the footer, and the five paths are added to the sitemap.

## The experiments

1. **Particle morph.** A gold particle cloud on deep brown forms the CTSD mark, sampled from `mark.svg`. Particles scatter from the cursor and spring back. Scrolling re-forms them, in order, into WEBSITES → APPS → PORTALS → CRMs → INTEGRATIONS (a sphere of connected points), then back to the logo with "Request your free mockup". About 60k particles on desktop and 12k on phones. The morphing runs on the GPU, in a vertex shader.
2. **Workshop.** A stylized 3D wooden workbench built from simple shapes: a monitor, a phone on a stand, a lamp and sticky notes. Scrolling drives the camera along a path: a wide shot → the monitor, where a website assembles panel by panel from the CTSD concept images → the phone, which lights up with an app screen → five sticky notes reading Discover / Design / Build / Launch / Care → a pull-back with the lamp glowing and the call to action.
3. **Liquid gallery.** A full-screen WebGL plane shows the 12 concept-design covers. Scrolling, dragging, swiping or the arrow keys move between them. A noise-displacement shader makes each image melt into the next, and the colors split in proportion to scroll speed. Each project name is set in giant type that animates in letter by letter. A magnetic cursor ring grows over the image and reads "View". Clicking opens `/designs/<slug>`.
4. **Physics playground.** The words "WE BUILD" fall in, then service pills (Websites, Apps, Portals, CRMs, Integrations, Booking), driven by Matter.js. The pills are real DOM links synced to physics bodies, so you can drag and throw them. On phones, tilting moves gravity, and a "Shake" button scatters everything. The call-to-action button drops in last.

## Rules for every experiment

- **Content:** CTSD brand only (colors, Montserrat and Inter, the logo). The copy comes from the existing site. Concept images are labeled "Concept design".
- **Reduced motion** (`prefers-reduced-motion: reduce`): a designed still version with the same content and links. No autoplaying motion.
- **No WebGL:** the same still version, so the page never shows a blank canvas.
- **Phones:** lighter settings (fewer particles, lower pixel ratio, simpler geometry). The page works with touch and never scrolls sideways.
- **Accessibility:** every page has one `h1`, real text for its message, keyboard-reachable links and a visible focus style. The canvas is `aria-hidden`.
- **Performance:** animation pauses when the tab is hidden. Device pixel ratio is capped at 2.
- **Navigation:** every page has the shared header and footer, plus a "Back to the Lab" link.

## Testing

- **Page checks (Playwright):** each Lab page returns 200, has one `h1`, logs no console errors and has a working call-to-action link.
- **Fallbacks:** the reduced-motion still version shows. The no-WebGL fallback shows when WebGL is blocked.
- **Gallery:** cards link to real design pages.
- **Playground:** the pills are links.
- **Existing tests:** updated where the navigation and sitemap now include the Lab.
- **Visual review:** screenshots at desktop and phone sizes.
