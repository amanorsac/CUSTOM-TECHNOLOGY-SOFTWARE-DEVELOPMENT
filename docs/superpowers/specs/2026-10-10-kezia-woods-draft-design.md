# Kezia Woods: draft personal-brand site ("The cover story")

**Status:** design approved in chat on 2026-10-10. CTSD's first real client. This is a **draft to pitch to her**; she has not seen it or supplied material yet.

## Who and why

Kezia Woods is a Ghana-born entrepreneur in Charlottesville. Public facts (the only ones the draft may state):

- **Security:** CISM-certified (Certified Information Security Manager), per her LinkedIn profile URL. No employers, titles or dates; those come from her.
- **Hospitality:** owner of Bonchon Korean Fried Chicken, West Main Street, Charlottesville. It opened Aug 26, 2026 as the chain's 500th location worldwide (29 News, Aug 26, 2026). The idea began as a pregnancy craving (Daily Progress, Jul 22, 2026; 29 News).
- **Education:** a Director of Kester International School, Tuba, Ga South, Ghana (preschool to junior high), per kester.edu.gh/teachers.

**Goal:** a professional site that makes people (1) follow her story, (2) book her to speak, (3) partner or invest with her. Security is credibility, not the pitch.

**Success:** she sees it and wants it. It reads as hers, it's credible, and the motion is noticeably crafted but never gimmicky.

## Guardrails

- **Draft, unlisted:** it is served at `/preview/kezia-woods`. The page carries `<meta name="robots" content="noindex, nofollow">`, the worker sends `X-Robots-Tag: noindex, nofollow` for every `/preview/` path, `robots.txt` disallows `/preview/`, and the page is not in the sitemap or linked from the CTSD site. A thin top bar reads "Draft for Kezia Woods · prepared by CTSD · not yet published".
- **No third-party media:** no press photos (they belong to the papers and photographers) and no Bonchon logo or brand art (Bonchon's trademark). Bonchon is named in text only. The portrait and photos are designed placeholders until she supplies her own.
- **Facts only:** no invented employers, numbers, testimonials or quotes. The one direct quote is her published 29 News line, attributed and short: "I'm beyond blessed to have this opportunity."
- **Forms send nothing:** "Book Kezia" and "Partner with Kezia" show a confirmation and the note "Draft: this form isn't connected yet." No network request is made.
- **External links:** the two articles, kester.edu.gh, and bonchon.com. They open in a new tab with `rel="noopener"`.

## Identity

- **Colors:** newsprint ivory `#F6F1E7`, ink `#16130F`, muted ink `#5A5248`, rule `#D9CFBF`. Accents taken from the Ghana flag and used sparingly: gold `#C8941E` (calls to action, highlights), deep green `#1E4D3A` (secondary), red `#B23A2A` (thin rules and dateline marks only).
- **Type (self-hosted):** DM Serif Display for the nameplate and headlines, Newsreader for body text and pull quotes, IBM Plex Mono for datelines, captions and labels.
- **Feel:** a premium magazine feature about her. Generous margins, column rules, a drop cap. Motion is print-like (pressing ink, setting type, turning pages), never bouncy.

## Page (single page, top to bottom)

1. **Draft bar** (see Guardrails).
2. **Cover:**
   - The nameplate "KEZIA WOODS" spans the width and presses in letter by letter (scale 1.06→1, blur→0, ink spread).
   - Issue line: "Issue No. 500 · Charlottesville & Accra · Autumn 2026".
   - Three cover lines type themselves in sequence: "From a pregnancy craving to the 500th Bonchon in the world", "Inside the school she helps lead in Ghana", "Why a security leader opened a restaurant".
   - The portrait placeholder sits in a duotone frame with a caption slot.
   - Scrolling past the cover turns it away (3D rotateY around the left edge, pinned for one screen) to reveal the feature.
3. **The feature (`#story`):**
   - A standfirst, then five chapters: "Roots in Ghana", "The security career", "Kester International School", "The craving", "The 500th".
   - A drop cap opens the first chapter.
   - Two pull quotes set themselves word by word as they enter, then a rule draws under them.
   - A sticky margin timeline (wide screens) shows the chapter list with the current chapter marked; it becomes a top progress strip on phones.
4. **By the numbers (`#numbers`):** a spread of four split-flap figures that roll to their values on entry: "500th" (Bonchon location worldwide), "2" (continents), "3" (ventures: security, hospitality, education), "Aug 26, 2026" (opening day on West Main).
5. **In the press (`#press`):** two clippings (headline, outlet, date, link). They rest tilted (−2° and 1.5°), straighten and lift on hover or focus, and slide in on entry.
6. **Speaking (`#speaking`):**
   - Styled as a *Contents* page: four numbered talks, each a disclosure button revealing a two-sentence description. The talks are "From craving to franchise", "Security thinking for small businesses", "Building across two continents" and "Leading in three industries".
   - Then the "Book Kezia" form: name, email, organization, event date, message. Required fields: name, email and message.
7. **Ventures (`#ventures`):** three "departments", each with a short write-up and an outbound link.
   - Security (CISM): no link, or LinkedIn if she agrees.
   - Hospitality: Bonchon Charlottesville → bonchon.com.
   - Education: Kester International School → kester.edu.gh.
   - Then the "Partner with Kezia" form: name, email, company, interest (select: Partnership, Investment, Franchising, Other), message.
8. **Back cover:** the nameplate again, small; a contact line (placeholder until she gives an address); "Follow her story" links to the two articles; "© 2026 Kezia Woods · Draft prepared by CTSD".

## Behaviour

- **Modes:** `kw-live` (motion) or `kw-still` (reduced motion or `?still=1`), set before first paint. Still mode shows everything in its final state: no pin, no typing, figures at their values.
- **Libraries:** GSAP with ScrollTrigger and SplitText, plus Lenis, all from `/assets/vendor`. No WebGL; the effects are type and layout.
- **Phones (375 px):** one column, no cover pin (the cover fades rather than turning), the timeline becomes a progress strip, and there is no horizontal scroll.
- **Accessibility:** one h1 (the nameplate, with an aria-label of "Kezia Woods"); split text is `aria-hidden`, with an intact copy for screen readers. Disclosures use `aria-expanded`, and forms have labels, required markers and a live status message. axe must report no serious violations.

## Files

- `public/preview/kezia-woods.html`
- `public/assets/preview/kezia-woods/{kw.css, main.js, fonts/}`
- `scripts/client-assets.mjs` (copies the fonts)
- `src/routes/sitemap.js` (robots.txt adds `Disallow: /preview/`)
- `src/worker.js` (`X-Robots-Tag` on `/preview/`)
- `tests/e2e/kezia.spec.js`, and the robots and header unit tests in the existing vitest worker tests

## Tests

- **e2e:**
  - loads live: one h1, no errors, the draft bar visible
  - `noindex` meta present, and the `X-Robots-Tag` header on the response
  - robots.txt disallows `/preview/`
  - the page is not in the sitemap
  - a speaking disclosure toggles `aria-expanded`
  - "Book Kezia" validates required fields, then confirms without any network request
  - "Partner" likewise
  - the numbers show their final values in still mode
  - press links have `target="_blank"` and `rel` containing `noopener`
  - reduced motion with axe
  - no horizontal scroll at 375 px
- **vitest:** robots.txt contains `Disallow: /preview/`; a `/preview/` HTML response carries `X-Robots-Tag`.
