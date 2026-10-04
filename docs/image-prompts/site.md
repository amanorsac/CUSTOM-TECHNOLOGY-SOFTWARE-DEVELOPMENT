# CTSD site art — image prompts

These images belong to the CTSD site itself, not to a design concept. They all live in one world: CTSD's brown-wood studio. Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world: the CTSD studio

Every prompt below repeats this block, so the site art reads as one place.

- **Brand:** CTSD (Custom Technology & Software Development). The product is the hero: devices showing real-looking systems, never stock people, handshakes, headsets or server rooms.
- **Environment:** an office wall of vertical deep-walnut wood slats, green potted plants (a monstera and a small olive tree), a warm brown wooden desk, brass accents, warm golden light from the left, soft shadows.
- **Screens on the devices:** calm off-white and cream interfaces with deep-brown sidebars, warm-tan cards and small gold highlights. Uncluttered, large type, realistic data.
- **Typography on screens:** headings in Montserrat semibold, labels in Poppins, body in Inter.
- **Never:** blue anywhere (no blue UI, no blue light, no blue sky through windows), people, hands, logos on devices.

| Color | Hex | Use |
|---|---|---|
| Deep brown | `#3E2723` | slats in shadow, sidebars, dark UI |
| Wood brown | `#6B4F32` | slats and desk |
| Warm tan | `#C89B6B` | light on wood, UI cards |
| Gold | `#D4AF37` | highlights, one accent per screen |
| Cream | `#F7EFE4` | screen backgrounds, light |
| Sage | `#556B2F` | plants, "success" labels |
| Off-white | `#FBF9F6` | screen backgrounds |

**Where these files go:** save the PNG under `public/images/site/` with the file name shown (for example `hero.png`), then run `node scripts/make-thumbs.mjs`. The script writes the `.webp` the page loads.

## Images

### 1. Homepage hero — `images/site/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 5:4 · 4K (the script center-crops it to 6:5) |
| Final file | 1440 × 1200 WebP, plus a 600 × 500 `-sm` thumbnail · save the source as `public/images/site/hero.png` |
| Framing | Composed device scene. The homepage shows it in a rounded panel beside the headline (the `index.html` hero). |
| Used by | `index.html` hero (`<img class="hero__img">`). Until the file exists, the CSS device mock shows instead. |

**On-screen copy:** "Plan a visit" · "Pipeline" · "Lead 12" · "Proposal 5" · "Won 3" · "Events" · "Sunday Service" · "Join live"

```text
A photorealistic interior product photograph, 5:4, of a complete set of devices on a warm brown wooden desk: a large desktop monitor at the back left showing a CRM dashboard, a slim laptop at the front center showing an organization's website, a tablet leaning on a small stand at the right showing an admin panel, and a smartphone standing upright at the front right showing a mobile app. Clear space between devices, all screens facing the viewer, lit and sharp.

Setting, the CTSD studio: behind the desk a wall of vertical deep-walnut wood slats (Deep brown #3E2723 in the shadows, Wood brown #6B4F32, Warm tan #C89B6B where the light hits), a green monstera in a matte ceramic pot at the left edge and a small olive tree at the right, a brass desk lamp, warm golden light from the left, soft shadows, gentle depth of field on the wall only.

Screens: calm off-white #FBF9F6 and cream #F7EFE4 interfaces with deep-brown #3E2723 sidebars, warm-tan cards and small gold #D4AF37 highlights, headings in Montserrat. The laptop shows a church website hero with a warm sanctuary photo and two buttons. The monitor shows a CRM with three pipeline columns. The tablet shows an admin events list with green "Published" labels. The phone shows a "Sunday Service" card with a gold button.

Readable screen text (large words only): laptop "Plan a visit"; monitor "Pipeline", "Lead 12", "Proposal 5", "Won 3"; tablet "Events"; phone "Sunday Service", "Join live". Smaller interface details are clean shapes and neat short lines, not invented words.

Composition: the devices fill about 75% of the width, centered, with calm wall above. The image is cropped slightly at the left and right edges, so keep the monstera and olive tree inside the frame but nothing important in the outer 3% on either side.

No people, no hands, no faces, no logos on devices, no blue anywhere, no clutter. Premium technology studio, the product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words. No lorem ipsum, no gibberish, no watermark, no real-company logos.
```

**Alt text:** A laptop, a phone and an admin dashboard showing a custom-built system, set in a wood-panelled office (already set in `index.html`; keep it if the image matches)

**Regenerate if:** any readable screen word is garbled; a device is warped, doubled or missing (four are required: monitor, laptop, tablet, phone); any person, hand or finger appears; anything is blue; the slats are horizontal or look like cheap laminate; the screens are dark or glare hides them; logos appear on devices.

### 2. "Built for your team" admin hero — `images/site/admin-hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10 from the top) |
| Final file | 1600 × 1000 WebP, plus a 600 × 375 `-sm` thumbnail · save the source as `public/images/site/admin-hero.png` |
| Framing | Flat, full-bleed screen with NO device or browser frame. The homepage draws the browser frame around it. |
| Used by | `index.html` "Built for your team to manage" section (`<img class="manage__img">`, shown top-left anchored). |

**On-screen copy:** "Admin" · "Dashboard" · "Events" · "People" · "Messages" · "Pages" · "Good morning, Dana" · "Registrations" · "128" · "+18%" · "Bookings" · "36" · "+6%" · "Messages" · "12" · "4 new" · "Sign-ups, last 30 days" · "Family Night" · "Published" · "Volunteer Day" · "Draft" · "Fall Open House" · "Published"

```text
A flat, straight-on UI screenshot of one desktop admin dashboard, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective.

Design world, CTSD admin style: off-white #FBF9F6 canvas, a Deep brown #3E2723 left sidebar with cream #F7EFE4 text, warm-tan #C89B6B soft cards, one Gold #D4AF37 accent, Sage #556B2F for "Published" labels, charcoal #1A1A1A text. Headings in Montserrat semibold, labels in Poppins, body in Inter. Rounded 14px cards, subtle shadows, minimal borders, generous spacing. No blue anywhere.

Screen: the sidebar has the word "Admin" at top and five links (Dashboard active, highlighted with a gold bar). The main area has a greeting headline at top-left, a row of three KPI cards (each with a label, a large number and a small change note), a wide area chart of sign-ups over 30 days in warm tan with a gold line, and to the right a short events list with three rows and status labels (sage "Published", tan "Draft"). Calm, easy to use, nothing extra.

On-screen text, in reading order: "Admin", "Dashboard", "Events", "People", "Messages", "Pages", "Good morning, Dana", "Registrations", "128", "+18%", "Bookings", "36", "+6%", "Messages", "12", "4 new", "Sign-ups, last 30 days", "Family Night", "Published", "Volunteer Day", "Draft", "Fall Open House", "Published".

Keep the top-left area clear and readable (the page anchors the image there) and keep the bottom 6% as quiet background, because it is trimmed.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). No lorem ipsum, no gibberish, no watermark, no logos.
```

**Alt text:** An admin dashboard with registrations, bookings and messages totals, a sign-ups chart and an events list with published and draft events (the page currently marks this image decorative with `alt=""` because the same content is in the text beside it; keep that)

**Regenerate if:** any word is garbled; a browser bar, device or drop shadow appears (frame inside a frame); anything is blue; the dashboard is crowded or has extra widgets; status labels are unreadable.

### 3. Industry hero: business — `images/site/industry-business.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail · save the source as `public/images/site/industry-business.png` |
| Framing | Composed device scene |
| Used by | Not wired yet. `industries/business.html` does not load an image today; see the README. |

**On-screen copy:** "Pipeline" · "Client Portal" · "Book a call"

```text
A photorealistic interior product photograph, 3:2 landscape, of a slim laptop and a large desktop monitor side by side on a warm brown wooden desk, with a smartphone lying flat on a leather desk pad in front, screen up and facing the viewer.

Setting, the CTSD studio: a wall of vertical deep-walnut wood slats (Deep brown #3E2723, Wood brown #6B4F32, Warm tan #C89B6B highlights), a tall monstera at the right, a brass lamp, warm golden light from the left, soft shadows.

Screens, CTSD style (off-white #FBF9F6 and cream #F7EFE4 backgrounds, Deep brown sidebars, warm-tan cards, one Gold #D4AF37 accent, Montserrat headings): the monitor shows a business CRM with a four-column pipeline; the laptop shows a client portal with a project progress bar and documents; the phone shows a booking screen with time slots and a gold button.

Readable screen text (large words only): monitor "Pipeline"; laptop "Client Portal"; phone "Book a call". Smaller details are clean shapes and neat lines, not invented words.

Composition: devices fill about 70% of the width, slightly right of center, calm slat wall at the left for breathing room.

No people, no hands, no faces, no logos, no blue anywhere. The product is the hero.

Render every listed word exactly as written, crisp and correctly spelled, and add no other words. No gibberish, no watermark.
```

**Alt text:** A CRM pipeline, a client portal and a booking screen for a business, on devices in a wood-panelled office

**Regenerate if:** screen words are garbled; devices are warped or doubled; any person or hand appears; anything is blue; the phone screen faces away or is unreadable.

### 4. Industry hero: church — `images/site/industry-church.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail · save the source as `public/images/site/industry-church.png` |
| Framing | Composed device scene |
| Used by | Not wired yet (`industries/church.html`). |

**On-screen copy:** "Plan a visit" · "Give" · "Sunday Service"

```text
A photorealistic interior product photograph, 3:2 landscape, of a slim laptop at the center, a tablet on a small stand at the left and a smartphone standing upright at the right, on a warm brown wooden desk.

Setting, the CTSD studio: a wall of vertical deep-walnut wood slats (Deep brown #3E2723, Wood brown #6B4F32, Warm tan #C89B6B highlights), a small olive tree in a ceramic pot, a lit candle in a glass, warm golden light from the left, soft shadows.

Screens, CTSD style (cream #F7EFE4 and off-white #FBF9F6 backgrounds, Deep brown details, one Gold #D4AF37 accent, Montserrat headings): the laptop shows a church website hero with a warm photo of an empty sunlit sanctuary and a gold button; the tablet shows an online giving form with amount buttons; the phone shows a church app card for this Sunday with a "Join live" button.

Readable screen text (large words only): laptop "Plan a visit"; tablet "Give"; phone "Sunday Service". Smaller details are clean shapes and neat lines, not invented words.

Composition: balanced and centered, devices about 70% of the width, calm wall above.

No people, no hands, no faces, no logos, no blue anywhere. The product is the hero.

Render every listed word exactly as written, crisp and correctly spelled, and add no other words. No gibberish, no watermark.
```

**Alt text:** A church website, an online giving form and a church app on devices in a wood-panelled office

**Regenerate if:** screen words are garbled; any person, hand or face appears (including in the sanctuary photo on screen); anything is blue; devices are warped.

### 5. Industry hero: education — `images/site/industry-education.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail · save the source as `public/images/site/industry-education.png` |
| Framing | Composed device scene |
| Used by | Not wired yet (`industries/education.html`). |

**On-screen copy:** "Apply for Fall" · "Parent Portal" · "Today"

```text
A photorealistic interior product photograph, 3:2 landscape, of a slim laptop at the left, a tablet propped at the center-right and a smartphone lying flat in front, screen up and facing the viewer, on a warm brown wooden desk next to a short stack of cloth-bound books.

Setting, the CTSD studio: a wall of vertical deep-walnut wood slats (Deep brown #3E2723, Wood brown #6B4F32, Warm tan #C89B6B highlights), a green monstera, a brass lamp, warm golden light from the left, soft shadows.

Screens, CTSD style (cream #F7EFE4 and off-white #FBF9F6 backgrounds, Deep brown details, one Gold #D4AF37 accent, Montserrat headings): the laptop shows a school admissions page with a photo of a brick school building in autumn and a gold button; the tablet shows a parent portal with two student cards and announcements; the phone shows a school calendar for today.

Readable screen text (large words only): laptop "Apply for Fall"; tablet "Parent Portal"; phone "Today". Smaller details are clean shapes and neat lines, not invented words.

Composition: devices about 70% of the width, a little left of center, calm wall at the right.

No people, no hands, no faces, no logos, no blue anywhere. The product is the hero.

Render every listed word exactly as written, crisp and correctly spelled, and add no other words. No gibberish, no watermark.
```

**Alt text:** A school admissions page, a parent portal and a school calendar app on devices in a wood-panelled office

**Regenerate if:** screen words are garbled; any person or hand appears; anything is blue (watch the sky in the school photo); devices are warped.

### 6. Industry hero: nonprofit — `images/site/industry-nonprofit.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail · save the source as `public/images/site/industry-nonprofit.png` |
| Framing | Composed device scene |
| Used by | Not wired yet (`industries/nonprofit.html`). |

**On-screen copy:** "Give monthly" · "Donors" · "Volunteer shifts"

```text
A photorealistic interior product photograph, 3:2 landscape, of a slim laptop at the center, a tablet on a small stand at the right and a smartphone standing upright at the left, on a warm brown wooden desk.

Setting, the CTSD studio: a wall of vertical deep-walnut wood slats (Deep brown #3E2723, Wood brown #6B4F32, Warm tan #C89B6B highlights), a small olive tree, a ceramic mug, warm golden light from the left, soft shadows.

Screens, CTSD style (cream #F7EFE4 and off-white #FBF9F6 backgrounds, Deep brown details, one Gold #D4AF37 accent, Sage #556B2F for progress, Montserrat headings): the laptop shows a donation page with a monthly giving toggle and amount buttons; the tablet shows a donor dashboard with a sage progress bar toward a goal and a short donor list; the phone shows a volunteer sign-up list with three shifts.

Readable screen text (large words only): laptop "Give monthly"; tablet "Donors"; phone "Volunteer shifts". Smaller details are clean shapes and neat lines, not invented words.

Composition: balanced, devices about 70% of the width, calm wall above.

No people, no hands, no faces, no logos, no blue anywhere. The product is the hero.

Render every listed word exactly as written, crisp and correctly spelled, and add no other words. No gibberish, no watermark.
```

**Alt text:** A donation page, a donor dashboard and a volunteer sign-up app on devices in a wood-panelled office

**Regenerate if:** screen words are garbled; any person or hand appears; anything is blue; devices are warped or doubled.

### 7. Wood texture: slats — `images/site/texture-wood-slats.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 1:1 · 4K |
| Final file | 1600 × 1600 WebP, plus a 600 × 600 `-sm` thumbnail · save the source as `public/images/site/texture-wood-slats.png` |
| Framing | Flat texture, straight-on, no objects |
| Used by | Not wired yet. Available as a section background (the site currently draws slats with CSS gradients). |

**On-screen copy:** none

```text
A flat, straight-on photograph of a wall of vertical wooden slats, filling the entire square canvas edge to edge. Evenly spaced slats about 4 cm wide with narrow dark gaps between them, in deep walnut tones: Deep brown #3E2723 in the gaps and shadows, Wood brown #6B4F32 across the slat faces, subtle Warm tan #C89B6B where soft light grazes the edges. Fine natural grain, matte oiled finish.

Even, soft, warm lighting across the whole frame with no hotspot and no vignette, so it can sit behind text. No perspective, no tilt, no objects, no plants, no people, no text, no logos, no blue or gray cast. Slats run perfectly vertical from the top edge to the bottom edge.
```

**Alt text:** none needed (decorative background; use `alt=""` or CSS `background-image`)

**Regenerate if:** the slats lean or show perspective; the light is uneven or has a bright hotspot; the wood turns orange, red or gray; knots or cracks are distracting; any object or text appears.

### 8. Wood texture: grain — `images/site/texture-wood-grain.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 1:1 · 4K |
| Final file | 1600 × 1600 WebP, plus a 600 × 600 `-sm` thumbnail · save the source as `public/images/site/texture-wood-grain.png` |
| Framing | Flat texture, straight-on, no objects |
| Used by | Not wired yet. Available for cards, footers or dark sections. |

**On-screen copy:** none

```text
A flat, straight-on macro photograph of a single smooth plank of dark walnut wood, filling the entire square canvas edge to edge. Long, calm, straight grain running top to bottom, in Deep brown #3E2723 and Wood brown #6B4F32 with soft Warm tan #C89B6B streaks. Matte oiled finish, very fine texture.

Even, soft, warm lighting with no hotspot, no glare and no vignette, so it can sit behind cream text. No perspective, no joints, no knots, no objects, no people, no text, no logos, no blue or gray cast.
```

**Alt text:** none needed (decorative background)

**Regenerate if:** strong knots, cracks or joints appear; the grain swirls instead of running straight; the color drifts orange, red or gray; the light is uneven; anything other than wood appears.

### 9. Social share (OG) image — `assets/brand/og-photo.jpg`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 16:9 · 2K (the script center-crops it to 1200 × 630) |
| Final file | 1200 × 630 JPG, no thumbnail · save the source as `public/images/site/og-source.png`; the script writes `public/assets/brand/og-photo.jpg` |
| Framing | Composed scene with the headline set on the wall |
| Used by | Not wired yet. Pages use `assets/brand/og-default.jpg` (made by `scripts/make-og.mjs`). To switch, change the `og:image` and `twitter:image` tags to `/assets/brand/og-photo.jpg`. |

**On-screen copy:** "CTSD" · "Technology built around your organization."

```text
A photorealistic interior product photograph, 16:9 landscape. On the right half, a slim laptop showing a calm cream dashboard and a smartphone standing upright beside it, on a warm brown wooden desk. On the left half, the wall of vertical deep-walnut wood slats is calm and slightly darker, holding text.

Setting, the CTSD studio: vertical wood slats in Deep brown #3E2723 and Wood brown #6B4F32 with Warm tan #C89B6B highlights, a small olive tree at the far right, warm golden light from the right, soft shadows.

Text on the left half, set cleanly like a printed sign, left-aligned and vertically centered: a small label "CTSD" in Gold #D4AF37, Montserrat semibold with wide letter spacing, and under it the headline "Technology built around your organization." in Cream #F7EFE4, Montserrat semibold, on two lines.

Screens, CTSD style (cream #F7EFE4 and off-white #FBF9F6, Deep brown sidebar, one Gold accent): the laptop shows an admin dashboard with three cards and a chart; the phone shows an app home card. Small interface details are clean shapes, not invented words.

Composition: keep all text and devices inside the middle 86% of the height, because the top and bottom are trimmed for social cards.

No people, no hands, no faces, no logos on devices, no blue anywhere.

Render "CTSD" and "Technology built around your organization." exactly as written, crisp and correctly spelled, and add no other words. No gibberish, no watermark.
```

**Alt text:** CTSD: Technology built around your organization. A laptop and a phone on a desk in a wood-panelled office.

**Regenerate if:** either text line is misspelled or broken across more than two lines; the text sits outside the left half or near the top or bottom edge; anything is blue; any person or hand appears; the CTSD label is drawn as a made-up logo symbol instead of plain letters.
