# Showpiece 3: Basecamp Students

**Status:** approved in chat on 2026-10-08 ("PROCEE", after Juniper & Vale). This is the third of four industry showpieces: Osteria Lume → Juniper & Vale → Basecamp → Lanternway.

## Goal

A live demo site for the fictional youth ministry from the CTSD youth-ministry concept. Osteria is slow and cinematic and J&V is precise and architectural, so Basecamp is **physical and loud**: things bounce, stick, flip and get thrown. Most of the motion responds to the visitor rather than playing by itself.

## Identity (shared with no other CTSD page)

- **Colors:** ink `#111111`, off-white `#F5F5F0`, electric lime `#C6F432`, tangerine `#FF6B2C` (tags and stickers, with ink text for contrast), concrete `#D9D9D4`.
- **Type:** Anton (uppercase condensed display) and Inter, both self-hosted.
- **Feel:** a streetwear poster: 10px corners, chunky "pressed" buttons with a hard shadow, stickers, tape.

## Where it lives

- **Page:** `/showcase/basecamp`, from `public/showcase/basecamp.html`, with assets under `public/assets/showcase/basecamp/`.
- **Separate from the CTSD site:** a "Concept by CTSD" badge links to `/designs/youth-ministry`.
- **Link in:** the youth-ministry design page shows "Open live showpiece".

## Sections and motion

1. **Preloader:** BASECAMP slams in letter by letter on lime, a counter runs, and the panel lifts. Shown once per session.
2. **Hero:** "Find your people." Every letter sits on a spring; the cursor or a finger shoves them and they wobble home. On load they drop in from above. The campfire photo is WebGL: heat haze above the flames, flicker and forty embers that drift with the cursor like wind.
3. **Tapes:** two crossing marquee tapes whose speed and direction follow the scroll velocity.
4. **This week:** pinned; five day cards slide sideways, lean with scroll speed and settle upright, and stickers pop on as each card arrives.
5. **Fall Retreat:** the title slams up letter by letter, the panorama zooms out, and a slot-flip countdown runs to Nov 7. A 60-dot grid shows the 18 open spots. Registration needs a name, a grade and three ticks (animated checks); submitting fires confetti, flips the card to "You're in", and one open dot turns orange (18 → 17). Nothing is sent.
6. **Group finder:** two taps (grade level and interest) shuffle the deck and flip the matching group card (8 groups).
7. **Check-in pass:** a phone that tilts in 3D with a holographic sheen. "Check In" runs a scan line and slams a "Checked in" stamp; tap again to reset.
8. **Photo wall:** Matter.js physics. Polaroids and stickers tumble in and can be grabbed and thrown.
9. **Parents:** the weekly update (Read Update expands), three cards whose icons draw themselves, and the leaders.
10. **Footer:** "See you Wednesday." on the same springs as the hero.

## Fallbacks

- **Reduced motion or `?still=1`:** no preloader, springs, physics or WebGL. The wall becomes a pinned-up collage, and the week wraps into a grid. Every control still works.
- **No WebGL:** only the campfire stays a photo; everything else animates.
- **Phones:** one column, touch pushes the letters, and the wall scrolls the page except when grabbing a photo.

## Tests

`tests/e2e/showcase.spec.js` covers: a clean live load, the registration rules and confirmation, the group matching, check-in and the parents toggle, reduced motion with axe, no WebGL, 375px overflow and the design-page link.
