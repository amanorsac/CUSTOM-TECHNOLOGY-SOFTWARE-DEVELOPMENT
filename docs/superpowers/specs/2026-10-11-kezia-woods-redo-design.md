# Kezia Woods: draft site, redone ("The Founder")

Date: 2026-10-11. Status: approved in conversation, awaiting written-spec review. This replaces the "cover story" draft (`2026-10-10-kezia-woods-draft-design.md`) at the same address.

## Why a redo

The owner rejected the first draft as a whole:
- the magazine concept
- the bare, photo-less pages
- the newsprint colours and fonts
- the amount of motion

**The new brief:** build Kezia the site you would build if Oprah or Michelle Obama hired you. That means:
- a public figure's own site: warm, confident and personal
- large photography, generous space and elegant type
- presence, not a résumé

**What the owner decided:**
- **Direction:** "The Founder".
- **Photos:** generated scenes now, replaced by her own photos as they arrive.
- **No Ghana theme.** No flag colours, and no "two continents" framing.

**Her goals are unchanged:**
1. Book her to speak.
2. Partner or invest with her.
3. Follow her story.

**Success** means Kezia sees it and wants it: it reads as a person with presence, it is credible, and it is calm.

## Facts (unchanged; the only ones the page may state)

- **Security.** She is CISM-certified (Certified Information Security Manager), per her LinkedIn profile URL. No employers, titles or dates.
- **Hospitality.** She owns Bonchon Korean Fried Chicken on West Main Street, Charlottesville.
  - It opened on Aug 26, 2026, as the chain's 500th location worldwide (29 News, Aug 26, 2026).
  - The idea began as a pregnancy craving (Daily Progress, Jul 22, 2026; 29 News).
- **Education.** She is a Director of Kester International School, per kester.edu.gh/teachers. It appears as one venture among three, stated plainly, without a Ghana theme.
- **Quote.** Her one published line, attributed to 29 News: "I'm beyond blessed to have this opportunity."

## Ground rules (unchanged)

- **Unlisted draft.** It is served at `/preview/kezia-woods`, with the robots meta `noindex, nofollow`. The worker's `X-Robots-Tag`, the robots.txt `Disallow: /preview/` rule, and the sitemap exclusion already cover it. A thin top bar reads "Draft for Kezia Woods · prepared by CTSD · not yet published".
- **No third-party media.** No press photos, and no Bonchon logo or brand art. Bonchon is named in text only.
- **Stand-in images.** Every generated image shows no people, no faces, and no logos or readable signage. Each one carries a small "Stand-in image" tag and `data-standin`, so a test can list them.
- **Portrait.** The portrait frame reads "Portrait coming from Kezia".
- **Forms send nothing.** "Book Kezia", "Partner with Kezia" and "Follow her story" each show a confirmation: "Thank you. This draft isn't connected yet, so nothing was sent." No network request is made.
- **External links.** The two articles, kester.edu.gh and bonchon.com. They open in a new tab with `rel="noopener"`.

## Identity

| Role | Value | Use |
|---|---|---|
| Warm white | `#FBF9F6` | Page |
| Stone | `#EFEAE4` | Alternate sections |
| Blush | `#F4E7E2` | Hero and quote backgrounds |
| Ink | `#1A1614` | Text, 17.6:1 on warm white |
| Muted | `#625A55` | Secondary text, 6.6:1 on warm white, 5.8:1 on stone |
| Aubergine | `#4B1E3F` | Buttons, links, highlights. White on it is 13.5:1, and it is 12.6:1 on warm white. |
| Line | `rgba(26,22,20,.12)` | Rules |

**Type.** Self-hosted:
- **Bodoni Moda** (500, plus 500 italic) for her name and headlines: high-contrast and elegant.
- **DM Sans** (400, 500) for body text, labels and buttons.

Labels are small uppercase DM Sans with letter-spacing. Headlines use generous sizes with tight leading.

**Motion.** Quiet throughout:
- Sections fade up 20 px as they enter (0.8 s).
- Images reveal with a slow clip-path wipe (1.1 s).
- The hero image has a gentle parallax, moving at most 40 px across the hero's height.
- Buttons and cards change only colour and slightly lift on hover.

There is no typing, page turning, pinning, split text or 3D. Under reduced motion everything is static. Without JavaScript all content is visible, because nothing starts hidden until the script sets it up.

**Libraries.** None, just IntersectionObserver and CSS. GSAP, Lenis and SplitText are removed from this page.

## The page, top to bottom

1. **Draft bar.**
2. **Header.** "Kezia Woods" in Bodoni on the left. The links Story, Work, Speaking, Press and Partner, plus a "Book Kezia" button, are on the right. On phones they collapse into a menu. The header is sticky and gains a hairline after scroll.
3. **Hero** (blush background, two columns on desktop, stacked on phones):
   - **Left:** the label "Founder · Security leader · Speaker", then the h1 "Kezia Woods". Below it the line "She built a career protecting organizations, opened the 500th Bonchon in the world, and helps lead a school. Now she shares what she's learned." Then two buttons: "Book Kezia" (aubergine, linking to `#speaking`) and "Partner with Kezia" (outline, linking to `#partner`).
   - **Right:** a tall portrait frame (4:5) holding the stand-in scene `hero-light`, a soft-focus warm window light on a quiet interior. It is captioned "Portrait coming from Kezia" with its "Stand-in image" tag.
4. **Her words.** A full-width quiet band: her quote in large Bodoni italic, credited to "Kezia Woods, to 29 News, August 2026".
5. **Her work** (`#work`). The heading is "Three ventures, one way of working". Three tall photo cards, in a 3-column grid that stacks on phones:
   - **Hospitality.** "Bonchon, West Main Street": "The 500th Bonchon in the world, opened in Charlottesville in August 2026." Links to bonchon.com. Image `restaurant`.
   - **Security.** "Certified Information Security Manager": "A CISM-certified security leader who helps organizations protect what matters." No link. Image `office`.
   - **Education.** "Kester International School": "A Director of Kester International School, from preschool through junior high." Links to kester.edu.gh. Image `classroom`.
6. **Her story** (`#story`). Three short parts, alternating image and text on desktop:
   1. **"A career built on trust."** Security leadership and the CISM. Image `office-detail`.
   2. **"A craving that became a franchise."** The pregnancy craving, and the 500th location opening on Aug 26, 2026. Image `restaurant-detail`.
   3. **"Building something that lasts."** Education, and why she now speaks about what she has learned. Image `classroom-detail`.

   The copy states only the facts above and speaks of her plainly. It invents no feelings, history or numbers.
7. **Speaking** (`#speaking`, stone background):
   - **Four talks** as elegant numbered rows. Each has a title and a one-sentence description, and all are visible, with no disclosure:
     - "From craving to franchise"
     - "Security thinking for growing businesses"
     - "Leading across three industries"
     - "Building something that lasts"
   - **The "Book Kezia" form:** name, email, organization, event date and message. Name, email and message are required.
8. **In the press** (`#press`). Two rows, each with the outlet (small caps), headline, date and a "Read the article" link: Daily Progress, Jul 22, 2026, and 29 News, Aug 26, 2026.
9. **Partner or invest** (`#partner`). The line "Opportunities in hospitality, security and education." Then the form: name, email, company, interest (Partnership, Investment, Franchising, Other) and message.
10. **Follow her story.** An email field and a "Follow" button, plus the two article links.
11. **Footer.** Her name, the section links, and "© 2026 Kezia Woods · Draft prepared by CTSD".

## Images (stand-ins)

They are generated with the Higgsfield image tool at 4:5 or 3:4. The sources go in `assets-src/kezia-woods/`, and `scripts/client-assets.mjs kezia-woods` turns them into WebP under `public/assets/preview/kezia-woods/img/`. The script keeps the fonts step.

| Name | Scene (no people, faces, logos or readable text) |
|---|---|
| `hero-light` | Soft morning light through a tall window onto a calm, elegant interior: linen, a chair, a plant. Warm and editorial. |
| `restaurant` | A warm, modern restaurant interior at golden hour, with wood, brass and soft pendant lights. Empty and inviting. |
| `restaurant-detail` | A close detail of a set table: ceramic plates, chopsticks and soft light. |
| `office` | A calm modern office at dusk, with a desk, a laptop with an unreadable screen, and city light. |
| `office-detail` | A close detail of a notebook, a pen and a key on a desk. Muted and precise. |
| `classroom` | A bright, tidy classroom with wooden desks, books and morning light. Empty. |
| `classroom-detail` | A close detail of stacked books and coloured pencils in sunlight. |

When her photos arrive, each replaces a stand-in at the same name, and its `data-standin` and tag are removed.

## Behaviour

- **Header menu.** On phones it opens a full-height panel. Escape and the close button close it, focus moves into it and returns to the button.
- **Forms.** Each has labels, required markers and inline errors. On a valid submit, a live status message shows the confirmation text and the form resets. `preventDefault` runs always, and no request is made.
- **Accessibility.**
  - There is one h1, and headings are in order.
  - Every image has alt text, and stand-ins describe the scene.
  - Keyboard focus is visible, and all targets are at least 44 px.
  - axe reports no serious or critical violations at 375 and 1280 px.

## Files

- **Replaced:**
  - `public/preview/kezia-woods.html`
  - `public/assets/preview/kezia-woods/kw.css`
  - `public/assets/preview/kezia-woods/main.js`
- **Fonts.** The old ones (DM Serif Display, Newsreader, IBM Plex Mono) are replaced by Bodoni Moda and DM Sans, so the script's `kezia-woods` font list changes. Add `@fontsource/bodoni-moda` and `@fontsource/dm-sans` as dev dependencies, and remove the old fontsource packages if nothing else uses them.
- **Updated:** `scripts/client-assets.mjs`, which gains images for `kezia-woods`.
- **Rewritten:** `tests/e2e/kezia.spec.js`.

## Testing (`tests/e2e/kezia.spec.js`, rewritten)

**Page and indexing**
- The page loads with one h1, "Kezia Woods", and no console errors. The draft bar is present.
- It is unlisted: robots meta, `X-Robots-Tag`, and absent from the sitemap.
- No request leaves the site, and every image is under `/assets/preview/kezia-woods/`.

**Content**
- The hero has both buttons, pointing to `#speaking` and `#partner`.
- The quote is present and credited to 29 News.
- There are three venture cards. Bonchon links to bonchon.com, Kester to kester.edu.gh, and Security has no link. External links have `target="_blank"` and `rel` containing `noopener`.
- The press list has two articles with the right outlets and dates, linking out.
- Every `[data-standin]` shows a visible "Stand-in image" tag. The count equals the number of stand-in images used, and no `<img>` without `data-standin` is a stand-in.
- Nothing on the page mentions Ghana's flag colours or the old magazine. The h1 is not split into letters, and the test asserts no `.kw-nameplate`, `.kw-cover` or `[data-split]`.

**Forms**
- Each form shows required-field errors when submitted empty.
- Each form shows the confirmation and makes no network request when valid.

**Layout and fallbacks**
- At 375 px the phone menu opens and closes with Escape, and focus returns to the button.
- Reduced motion leaves everything visible, with no `opacity: 0` elements.
- Without JavaScript, every section and form is visible.
- At 375 and 1280 px there is no horizontal scroll and no serious axe violations.

## Out of scope

- Her real photos, a contact address and connected forms, which come from her.
- A custom domain.
- Additional pages.
