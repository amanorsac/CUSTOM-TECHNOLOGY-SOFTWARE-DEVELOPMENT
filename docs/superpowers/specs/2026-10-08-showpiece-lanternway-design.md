# Showpiece 4: Lanternway Church

**Status:** approved in chat on 2026-10-08 ("proceed", after Basecamp). This is the last of four industry showpieces: Osteria Lume → Juniper & Vale → Basecamp → Lanternway.

## Goal

A live demo site for the fictional neighborhood church from the CTSD modern-church concept. The other three are cinematic (Osteria), architectural (J&V) and physical (Basecamp). Lanternway is **calm, and the motion is light**: it pours through windows, walks a path, reads along with a sermon and rises as lanterns. Every animation is slow and soft, with no bouncing.

## Identity (shared with no other CTSD page)

- **Colors:** evergreen `#1F3A33`, linen `#FAF7F0`, mist `#E3EAE4`, marigold `#E3A72F` (buttons, and accents on dark grounds; a deeper amber `#9A6A0C` on linen for contrast), ink `#14201C`.
- **Type:** Fraunces (with italic accents) and Inter, both self-hosted.
- **Feel:** editorial and generous, with 14px cards, hairlines, pill buttons and a soft warm light that follows the mouse.

## Where it lives

- **Page:** `/showcase/lanternway`, from `public/showcase/lanternway.html`, with assets under `public/assets/showcase/lanternway/`.
- **Separate from the CTSD site:** a "Concept by CTSD" badge links to `/designs/modern-church`.
- **Link in:** the modern-church design page shows "Open live showpiece".

## Sections and motion

1. **Preloader:** a lantern outline draws itself, its flame catches, flickers and swells to fill the screen, and the page fades up. Shown once per session.
2. **Hero (pinned):** WebGL light scattering. Bright window pixels stream into beams that lean with the mouse; dust drifts only inside the light; the depth map gives the room parallax. Scrolling dollies down the aisle, the headline blurs away and "Come as you are." resolves in its place.
3. **Your first Sunday (pinned):** a marigold path draws across the page while a glowing lantern walks it, and five stops (8:45 park to 10:10 coffee) appear as it passes. On narrow screens the stops become a simple grid.
4. **This Sunday:**
   - The candle photo is revealed by a clip.
   - The sermon player draws a live waveform. Play runs a simulated playback that lights the transcript word by word, and clicking the waveform seeks.
5. **Sermon library:** series chips and search filter 8 sermons with GSAP Flip (cards glide to their new places, and the rest fade).
6. **Events:** hovering a row floats its photo beside the cursor, leaning with the mouse speed. Register toggles to "Registered ✓".
7. **Give:**
   - One time or monthly, $25/$50/$100/Other and a fund.
   - The yearly total and a three-part donut (families 50%, missions 30%, city 20%) animate with every change.
   - Give Now shows a thank-you. No payment fields; nothing is charged.
8. **Prayer:** an evening sky of drifting paper lanterns. Sending a request lifts the note off the card, folds it into a lantern and floats it into the sky, where it joins the others. A "Keep this private" switch is included. Nothing is sent.
9. **Footer:** the church at dusk starts dim, then its windows light up one by one: "The light's on. Come on in."

## Fallbacks

- **Reduced motion or `?still=1`:** no preloader, pinning, WebGL, Flip, lantern sky or float. The hero is a still photo, the path becomes a grid of stops, and every control still works.
- **No WebGL:** the hero is the photo without pinning; everything else animates.
- **Phones:** one column, the stops grid, no cursor effects, and the lantern sky still drifts.

## Tests

`tests/e2e/showcase.spec.js` covers: a clean live load, the player (play, transcript, seek), library filtering and search, the giving math and thank-you, prayer and event registration, reduced motion with axe, no WebGL, 375px overflow and the design-page link.
