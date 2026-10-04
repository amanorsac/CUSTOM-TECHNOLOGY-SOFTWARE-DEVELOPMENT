# Private School — image prompts

Design `private-school` · Education · **Concept** (a fictional organization, never presented as a client).
Tagline: Admissions, parents, and staff on one calm, organized platform.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Whitmore Academy, an independent Pre-K to Grade 12 school
- **Domain, if a URL ever shows:** `whitmore.example`
- **Typography:** headings in a classic book serif like Libre Caslon; body in a clean sans like Inter
- **Mood:** established, calm, organized and collegiate
- **UI style:** structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text
- **Imagery:** a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Places and objects only, never people
- **Device scenes (cover and hero):** a pale stone desk against an ivory wall, a short stack of burgundy cloth-bound books, a brass desk lamp, soft autumn light

| Color | Hex | Use |
|---|---|---|
| Burgundy | `#6E1E2E` | primary, sidebar, headings accents |
| Ivory | `#FBF7EE` | page background |
| Stone | `#E7E1D6` | cards and surfaces |
| Antique gold | `#B8913A` | accent, thin rules and highlights |
| Ink | `#1E1A1A` | body text |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/private-school/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Curious minds, kind hearts." · "Early dismissal at 1:30 PM"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a pale stone desk against an ivory wall, a short stack of burgundy cloth-bound books, a brass desk lamp, soft autumn light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screens: the laptop shows the Whitmore homepage with the brick campus photo and centered serif headline; the phone shows the parent app home with a burgundy notice card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Curious minds, kind hearts.", "Early dismissal at 1:30 PM". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore Academy concept on a laptop and a phone: the homepage and the parent app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/private-school/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Curious minds, kind hearts." · "Pay tuition" · "Admissions funnel"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a pale stone desk against an ivory wall, a short stack of burgundy cloth-bound books, a brass desk lamp, soft autumn light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screens: the laptop shows the Whitmore homepage; the phone shows the tuition payment screen; the tablet shows the admissions admin dashboard with a funnel chart. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Curious minds, kind hearts.", "Pay tuition", "Admissions funnel". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore Academy concept: website on a laptop, parent app on a phone and the admissions admin on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/private-school/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Whitmore Academy" · "About" · "Admissions" · "Academics" · "Student Life" · "Parents" · "Curious minds, kind hearts." · "Pre-K through Grade 12 · Founded 1962" · "Book a Tour" · "Apply for 2027"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Centred low composition: full-bleed photo of the brick building with autumn trees, a soft ivory-to-transparent fade at the bottom where a centered serif headline, one line and two buttons sit. Navigation across the top with the wordmark centered.

On-screen text, in reading order: "Whitmore Academy", "About", "Admissions", "Academics", "Student Life", "Parents", "Curious minds, kind hearts.", "Pre-K through Grade 12 · Founded 1962", "Book a Tour", "Apply for 2027".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Ivory #FBF7EE. Photography in the layout: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore Academy homepage: the brick campus in autumn behind the headline "Curious minds, kind hearts." with Book a Tour and Apply buttons

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Admissions — `images/designs/private-school/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Admissions" · "1" · "Inquire" · "2" · "Visit" · "3" · "Apply" · "4" · "Decision" · "Key dates" · "Open House" · "Nov 8" · "Application deadline" · "Jan 15" · "Decisions released" · "Mar 10" · "Start Application"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Ivory page. Serif title with a thin gold rule. A horizontal four-step process with large numerals in burgundy. Below, a key-dates card on stone with three rows, and a library photo at right. One burgundy button.

On-screen text, in reading order: "Admissions", "1", "Inquire", "2", "Visit", "3", "Apply", "4", "Decision", "Key dates", "Open House", "Nov 8", "Application deadline", "Jan 15", "Decisions released", "Mar 10", "Start Application".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Ivory #FBF7EE. Photography in the layout: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore admissions page with a four-step process, key dates and a Start Application button

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Book a tour — `images/designs/private-school/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Book a campus tour" · "November 2026" · "9:00 AM" · "10:30 AM" · "1:00 PM" · "Parent name" · "Student grade" · "Grade 4" · "Confirm Tour" · "Tours last about 60 minutes."

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Two-column booking page. Left: a November month calendar with available days softly marked and one day selected in burgundy, plus three time-slot buttons. Right: a short form with two fields and a burgundy confirm button. Calm and orderly.

On-screen text, in reading order: "Book a campus tour", "November 2026", "9:00 AM", "10:30 AM", "1:00 PM", "Parent name", "Student grade", "Grade 4", "Confirm Tour", "Tours last about 60 minutes.".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Ivory #FBF7EE. Photography in the layout: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore tour booking page with a November calendar, time slots and a short form

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Parent app home — `images/designs/private-school/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Good afternoon, Ms. Carter" · "Today" · "Early dismissal at 1:30 PM" · "Ella · Grade 4" · "Calendar" · "Pay" · "Lunch" · "Messages" · "Home" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Ivory #FBF7EE with nothing in it. A bottom tab bar in Ivory #FBF7EE with a thin stone top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Serif greeting. A burgundy notice card about early dismissal. A student card with a small initials monogram. A two-by-two grid of shortcut tiles with line icons. Ivory bottom tab bar with burgundy active icon.

On-screen text, in reading order: "Good afternoon, Ms. Carter", "Today", "Early dismissal at 1:30 PM", "Ella · Grade 4", "Calendar", "Pay", "Lunch", "Messages", "Home", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore parent app home with an early dismissal notice, a student card and shortcuts

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: School calendar — `images/designs/private-school/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "October" · "Oct 17" · "Picture Day" · "Oct 22" · "Parent Conferences" · "Oct 31" · "Harvest Festival" · "Home" · "Calendar" · "Messages" · "Pay" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Ivory #FBF7EE with nothing in it. A bottom tab bar in Ivory #FBF7EE with a thin stone top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Month title with arrows. A list of three dated events with burgundy date blocks on the left. Ivory bottom tab bar, Calendar active.

On-screen text, in reading order: "October", "Oct 17", "Picture Day", "Oct 22", "Parent Conferences", "Oct 31", "Harvest Festival", "Home", "Calendar", "Messages", "Pay", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore parent app calendar with Picture Day, Parent Conferences and the Harvest Festival

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Tuition payment — `images/designs/private-school/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Pay tuition" · "Next installment" · "$1,250" · "Due Nov 1" · "Bank account •••• 4821" · "Autopay" · "Pay Now" · "Home" · "Calendar" · "Messages" · "Pay" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Ivory #FBF7EE with nothing in it. A bottom tab bar in Ivory #FBF7EE with a thin stone top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Pay screen. A stone card with the next installment amount large in serif and the due date. Payment method row. An autopay toggle. Full-width burgundy Pay Now button. Ivory bottom tab bar, Pay active.

On-screen text, in reading order: "Pay tuition", "Next installment", "$1,250", "Due Nov 1", "Bank account •••• 4821", "Autopay", "Pay Now", "Home", "Calendar", "Messages", "Pay", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore parent app tuition screen with the next installment, payment method and a Pay Now button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Parent portal — `images/designs/private-school/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Whitmore" · "Overview" · "Students" · "Billing" · "Forms" · "Messages" · "Carter family" · "Ella · Grade 4" · "Teacher: Mr. Hughes" · "James · Grade 8" · "Advisor: Ms. Patel" · "Announcements" · "Picture Day is Oct 17" · "Balance due" · "$1,250" · "Pay Now" · "Field trip permission" · "Sign"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Burgundy left sidebar. Header with the family name. Two student cards with teacher names. An announcements list, a balance card with a burgundy button, and a forms card with one form to sign.

On-screen text, in reading order: "Whitmore", "Overview", "Students", "Billing", "Forms", "Messages", "Carter family", "Ella · Grade 4", "Teacher: Mr. Hughes", "James · Grade 8", "Advisor: Ms. Patel", "Announcements", "Picture Day is Oct 17", "Balance due", "$1,250", "Pay Now", "Field trip permission", "Sign".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Ivory #FBF7EE. Photography in the layout: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore parent portal with two students, announcements, the balance due and a form to sign

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Admissions admin — `images/designs/private-school/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Admissions" · "Inquiries" · "214" · "Tours booked" · "61" · "Applications" · "88" · "Enrolled" · "32" · "Admissions funnel" · "Upcoming tours" · "Nov 3 · 9:00 AM" · "Rivera family · Grade 6" · "Nov 3 · 10:30 AM" · "Chen family · Pre-K" · "Nov 4 · 1:00 PM" · "Okoro family · Grade 9"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Whitmore Academy (whitmore.example), an independent Pre-K to Grade 12 school. It is a fictional organization. Palette, used strictly: Burgundy #6E1E2E (primary, sidebar, headings accents), Ivory #FBF7EE (page background), Stone #E7E1D6 (cards and surfaces), Antique gold #B8913A (accent, thin rules and highlights), Ink #1E1A1A (body text). Typography: headings in a classic book serif like Libre Caslon; body in a clean sans like Inter. Mood: established, calm, organized and collegiate. UI style: structured grid, generous margins, 10px corners, thin antique-gold rules, burgundy buttons with ivory text.

Screen: Admin dashboard with burgundy sidebar. Four KPI tiles. A simple horizontal funnel chart from inquiries to enrolled in burgundy tones. A table of upcoming tours with three rows.

On-screen text, in reading order: "Admissions", "Inquiries", "214", "Tours booked", "61", "Applications", "88", "Enrolled", "32", "Admissions funnel", "Upcoming tours", "Nov 3 · 9:00 AM", "Rivera family · Grade 6", "Nov 3 · 10:30 AM", "Chen family · Pre-K", "Nov 4 · 1:00 PM", "Okoro family · Grade 9".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Ivory #FBF7EE. Photography in the layout: a red-brick school building with ivy and autumn trees, a library with tall shelves and reading lamps, a science lab with glassware, an empty sports field at morning. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Whitmore admissions admin with inquiry, tour, application and enrollment totals, a funnel chart and upcoming tours

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
