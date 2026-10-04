# Image prompts: how to make every site image

Every image on the site is generated in **Higgsfield** with Google's **Nano Banana** model, from the prompts in this folder. The site already knows each file's path. When a file appears in the right folder, the page shows it on the next refresh, with no code change. Until then, the site hides the missing image or shows a placeholder.

| Sheet | What it covers |
|---|---|
| [site.md](site.md) | CTSD's own art in the brown-wood studio world: homepage hero, admin hero, 4 industry heroes, 2 wood textures, the social share image |
| `<slug>.md` (12 sheets) | One per design concept: cover, hero, 3 website screens, 3 app screens, 1 portal screen and 1 admin screen (10 images each, 120 in all) |

Design sheets: [modern-church](modern-church.md) · [multi-campus-church](multi-campus-church.md) · [youth-ministry](youth-ministry.md) · [private-school](private-school.md) · [music-school](music-school.md) · [online-academy](online-academy.md) · [consulting-firm](consulting-firm.md) · [real-estate](real-estate.md) · [restaurant](restaurant.md) · [custom-crm](custom-crm.md) · [client-portal](client-portal.md) · [booking-system](booking-system.md)

## The workflow

1. **Open Higgsfield → Image**, and pick **Nano Banana Pro**. It renders text far better than plain Nano Banana; use plain Nano Banana or Nano Banana 2 only for the wood textures if you want to save credits.
2. **Set the aspect ratio and resolution** from the sheet's *Generate* row (for example `3:2 · 4K`). Nano Banana has no 16:10 or 9:19.5 option, so the sheets ask for the nearest ratio and the script trims or extends it (see the table below).
3. **Paste the whole prompt** from the gray `text` box. Each prompt is self-contained: it repeats that design's organization, palette, fonts and mood, so you can paste any one on its own.
4. **Generate 2 to 4 variations**, then check the best one against the sheet's **Regenerate if** line and the rules below. Zoom in on the text before you accept anything.
5. **Download it as PNG** (or JPG), and **rename it to the exact file name** from the sheet, keeping your extension. Example: the sheet says `images/designs/restaurant/web-2.webp`, so save `web-2.png`.
6. **Drop it into the matching folder** under `public/`. Example: `public/images/designs/restaurant/web-2.png`. Create the design folder the first time.
7. **Run the converter** from the project folder:

   ```
   node scripts/make-thumbs.mjs
   ```

   It writes `web-2.webp` (2400 × 1500) and `web-2-sm.webp` (600 × 375) next to your PNG.
8. **Refresh the page** (`npm run dev`, then open `/designs/restaurant`). The image appears. Commit the `.webp` files; the PNG sources are ignored by git and never deployed.

**Consistency tip:** for each design, make Website 1 and App 1 first. When they look right, attach them in Higgsfield as reference images for that design's other screens, and start the prompt with "Match the style of the attached reference images." This keeps the fonts, radius and colors identical across all 10 images.

## Sizes, ratios and file names

The sizes come from spec §6.3 (WebP; 2400 px wide for desktop screens and heroes, 1200 px for phones and cards; a 600 px thumbnail for each) and from how the CSS displays each image.

| Image | File name (in `public/`) | Shown on the site at | Generate at | Final file | Thumbnail | Script fit |
|---|---|---|---|---|---|---|
| Design cover | `images/designs/<slug>/cover.webp` | shop card, 3:2 | 3:2 · 2K | 1200 × 800 | 600 × 400 | center crop |
| Design hero | `images/designs/<slug>/hero.webp` | design page, 3:2 | 3:2 · 4K | 2400 × 1600 | 600 × 400 | center crop |
| Website screens | `images/designs/<slug>/web-1.webp` … `web-3.webp` | browser frame, 16:10 | 3:2 · 4K | 2400 × 1500 | 600 × 375 | trims the bottom |
| Portal screen | `images/designs/<slug>/portal-1.webp` | browser frame, 16:10 | 3:2 · 4K | 2400 × 1500 | 600 × 375 | trims the bottom |
| Admin screen | `images/designs/<slug>/admin-1.webp` | browser frame, 16:10 | 3:2 · 4K | 2400 × 1500 | 600 × 375 | trims the bottom |
| App screens | `images/designs/<slug>/app-1.webp` … `app-3.webp` | phone frame, 9:19.5 | 9:16 · 4K | 1200 × 2600 | 600 × 1300 | extends top and bottom |
| Homepage hero | `images/site/hero.webp` | homepage stage, 6:5 | 5:4 · 4K | 1440 × 1200 | 600 × 500 | center crop |
| Admin hero | `images/site/admin-hero.webp` | browser frame, 16:10 | 3:2 · 4K | 1600 × 1000 | 600 × 375 | trims the bottom |
| Industry heroes | `images/site/industry-<name>.webp` | not wired yet | 3:2 · 4K | 2400 × 1600 | 600 × 400 | center crop |
| Wood textures | `images/site/texture-<name>.webp` | not wired yet | 1:1 · 4K | 1600 × 1600 | 600 × 600 | center crop |
| Social share | source `images/site/og-source.png` → `assets/brand/og-photo.jpg` | not wired yet | 16:9 · 2K | 1200 × 630 JPG | none | center crop |

The exact paths for each design are in `public/data/designs.json`, and each appears in exactly one sheet. A unit test (`tests/unit/prompts.test.js`) checks this.

### Why "trim" and "extend"

- **Desktop screens (16:10):** generated at 3:2, which is a little taller. The site shows screens anchored to the top, so the script keeps the top and trims about 6% from the bottom. Every desktop prompt keeps its bottom 6% empty for this reason.
- **Phone screens (9:19.5):** generated at 9:16, which is wider. Cropping the sides would cut into the UI, so the script scales the screen to 1200 px wide and then extends the top and bottom by repeating their edge pixels. That is why every phone prompt asks for a plain band at the top (no status bar, where the site's phone frame draws its own camera pill) and a tab bar or plain band that runs to the bottom edge. The result looks like a tall phone with roomy safe areas.
- **The site draws the frames.** Website, portal and admin images sit inside a browser frame, and app images inside a phone frame. So those prompts ask for a flat, full-bleed screen with no device. Only the cover, the hero and the site scenes are composed device photos.

## The converter: `scripts/make-thumbs.mjs`

```
node scripts/make-thumbs.mjs            # convert anything new under public/images
node scripts/make-thumbs.mjs --dry-run  # list what it would write, write nothing
node scripts/make-thumbs.mjs --force    # rebuild outputs that already exist
```

- It scans `public/images/**` for `.png`, `.jpg` and `.jpeg` files, and writes the WebP at the size in the table above, plus the `-sm` 600 px thumbnail next to it.
- **It is safe to run any time.** It never deletes, moves or edits a source file, never writes over its own source, and skips any output that already exists unless you pass `--force`. Use `--force` after you replace a PNG with a better version.
- If you export a WebP yourself at the final name (for example `web-1.webp`), the script leaves it alone and only makes its `-sm` thumbnail.
- It warns when a source is smaller than the final size (it will upscale). Use the 4K setting to avoid that.
- Files whose names are not in the table are scaled down to 2400 px wide, ratio kept, with a thumbnail.
- PNG and JPG sources under `public/images` are listed in `.gitignore` and `public/.assetsignore`, so they are neither committed nor deployed. Keep them as your originals.

**One-off alternative.** To make a single thumbnail without the script, `npx sharp-cli` works too (it downloads the tool the first time):

```
npx sharp-cli --input public/images/designs/restaurant/web-2.webp --output public/images/designs/restaurant/web-2-sm.webp resize 600
```

## Regeneration rules

Reject an image and generate again when any of these is true. Each prompt's **Regenerate if** line adds the failures specific to that image.

1. **Text must be legible and correct.** Zoom to 100%. Any misspelled, garbled, half-formed or invented word means regenerate. Never ship garbled text; it is the fastest way to make the shop look cheap.
2. **No frame inside a frame.** Website, portal, admin and app images must be flat screens. A browser bar, laptop edge, phone body, notch or status bar in them will show up inside the site's own frame.
3. **Palette.** Colors must match the sheet's palette. CTSD's brown wood belongs only to `site.md`; a design image that drifts into brown wood or wood slats is wrong. Site images must contain no blue at all.
4. **No people.** No faces, hands or fingers anywhere, including inside photos on a screen. If a hand sneaks in, regenerate rather than retouching.
5. **Devices must be real.** No melted keyboards, bent screens, doubled phones or missing devices.
6. **Uncluttered.** If a screen is crowded, has extra widgets, or the text is too small to read at the site's display size, regenerate.
7. **Important content clear of trimmed edges:** the bottom 6% of desktop screens, the top-left corner of covers (the Concept badge sits there), and the top and bottom of the social image.

If text still garbles after three tries, shorten the prompt's copy list by removing a minor line (and the matching words from the screen description), then generate again.

## Alt text

Each prompt lists alt text that describes the finished screen. Today the site builds alt text automatically from the design name and section (for example "Modern Church Platform concept — website screen (1 of 3)"). The alt text in the sheets is ready for when `designs.json` gains per-image alt fields. If an image you keep differs from its prompt, update its alt text in the sheet.

## Not wired yet

- **Industry heroes** (`images/site/industry-business|church|education|nonprofit.webp`): the industry pages do not load an image yet. Generating them now is fine; showing them needs a small page change.
- **Wood textures:** the site draws its slats with CSS today. The textures are ready if a section wants a photographic background.
- **Social image** (`assets/brand/og-photo.jpg`): pages still point to `og-default.jpg`. Switching means changing the `og:image` and `twitter:image` tags.
