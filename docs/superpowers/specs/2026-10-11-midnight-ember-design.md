# CTSD site: Midnight and ember (re-brand) plus the audit fixes

**Status:** palette chosen in chat on 2026-10-11 ("Go with A, midnight and ember"). The scope is the colour change plus every audit fix CTSD can make without the owner's input. Testimonials, a founder photo, a phone number, a branded email, the legal entity, a postal address and pricing are skipped for now.

## Why

The brown wood palette reads as "craft workshop", not "technology partner". Colour research points to trust and competence (navy) with one warm, ownable accent (ember) for every call to action. The audit also found launch blockers and polish items.

## Palette (replaces the Brown Wood Theme everywhere on the CTSD site)

| Token | Hex | Use |
|---|---|---|
| `--navy-950` | `#0A1322` | darkest: footer, panel shadows (was `--deep-brown-900`) |
| `--navy` | `#0F1B2D` | dark sections, header (was `--deep-brown`) |
| `--navy-700` | `#1F3A5F` | raised dark surfaces, borders on dark (was `--wood-brown`) |
| `--slate` | `#4E5D73` | secondary text on light (was `--ink-muted`) |
| `--ivory` | `#F7F4EE` | light sections, text on dark (was `--cream`) |
| `--paper` | `#FBFAF7` | page background (was `--off-white`) |
| `--ink` | `#111826` | body text on light (was `--charcoal`) |
| `--ember` | `#F2A23A` | buttons and highlights only (was `--gold`) |
| `--ember-soft` | `#F5B860` | accent text on dark (was `--warm-tan`) |
| `--ember-ink` | `#9A5B0A` | accent text and links on light, AA 4.5:1 or better (was `--tan-ink`) |
| `--teal` | `#2F7D6B` | success and "live" states (was `--sage`) |
| `--ivory-muted` | `rgba(247,244,238,.76)` | secondary text on dark (was `--cream-muted`) |
| `--line-dark` / `--line-light` | navy and ivory hairlines | same roles |

**Primary button:** ember background with `--navy` text. **Ghost button:** an outline in the current text colour. The focus ring is ember on dark and `--ember-ink` on light, with 3:1 or better contrast against both (the existing test enforces this).

## Decisions

1. **Rename, don't alias.** The tokens and the section classes get semantic names: `.section--wood` becomes `.section--dark`, `.section--cream` becomes `.section--light`, and `.slats` becomes `.panels`. Every CSS, JS, HTML and test reference is updated in one mechanical pass, so no brown names survive. All 128 hard-coded brown RGB and hex values are mapped to the new tokens.
2. **The hero stays a wall, now a studio wall.** The wood slats become deep navy acoustic panels (same geometry, a fine fabric texture instead of wood grain), still lit by the ember work lamp, with the four showpiece screens. The rendered still is regenerated.
3. **Two fonts.** Montserrat for headings, Inter for everything else (labels become Inter 500). Poppins is removed, and an Inter 600 file is added for emphasis.
4. **Scope:** the CTSD site only (home, solutions, industries, designs and design pages, about, start, mockup, privacy, thanks, 404, demo and Lab chrome). The four showpieces and client previews keep their own palettes.

## Audit fixes (owner-independent)

1. **No-JS content:** the designs list, each design page's "What is inside" and integrations sections, and both forms are rendered into the HTML (server-side by the worker, or as static markup with JS enhancement), so search engines and link previews see real content.
2. **Reveal fallback:** scroll-reveal content is visible by default and only hidden once the script has started (the `reveal-on` class is set by JS, plus a 2.5 s failsafe that reveals everything).
3. **Lighter homepage:** fix the loop that downloads twice; halve the pinned distances (hero 160% → 80%, reel 100% → 50% per showpiece, journey trimmed); load three.js only on wide, capable screens.
4. **Hero crowding:** at 1280 px and below the screens move right and shrink so they never touch the headline.
5. **Tap targets:** footer links and small text links reach 44 px on touch screens.
6. **Alt text:** showpiece screenshots and posters get descriptive alt text where they carry content; purely decorative ones stay empty with `role="presentation"`.
7. **Navigation:** confirm that the Start and Lab pages show the site header (add it if missing).
8. **Showpieces:**
   - Lanternway's Register and Give buttons get real targets.
   - Every showpiece gets a visible "Fictional organization · Concept by CTSD" label near the top. The badge alone isn't enough.
9. **Mockup page:** state the turnaround: "We'll send your mockup within 3 business days." (Owner can change the number.)
10. **Share images:** a per-page share image, generated from the page title on the brand background (build script), instead of one default for every page.
11. **Canonical origin:** a `SITE_ORIGIN` setting in `wrangler.jsonc`. When set, canonical, og:url and sitemap URLs use it instead of the request origin, so the workers.dev address never leaks once the domain is live.

## Tests

- All existing suites stay green; tests that name the old classes or colours are updated.
- **New:**
  - no brown hex values remain in the site CSS (a source scan)
  - only two font families are loaded
  - the industry cards are visible with JS disabled
  - designs, "What is inside" and the forms have content with JS disabled
  - tap targets are 44 px or more at 375 px
  - the homepage loop requests aren't duplicated
  - `SITE_ORIGIN` overrides canonical and sitemap URLs
  - the showpiece "fictional" label is present
  - axe at 375 and 1280 px
