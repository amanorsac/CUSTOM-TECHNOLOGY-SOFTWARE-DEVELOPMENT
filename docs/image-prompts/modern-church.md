# Modern Church Platform — image prompts

Design `modern-church` · Church · **Concept** (a fictional organization, never presented as a client).
Tagline: Website, app, giving and member portal in one connected system.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Lanternway Church, a modern, welcoming neighborhood church
- **Domain, if a URL ever shows:** `lanternway.example`
- **Typography:** headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter
- **Mood:** warm, calm and welcoming, editorial, morning light
- **UI style:** generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons
- **Imagery:** an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Places and objects only, never people
- **Device scenes (cover and hero):** a light oak table against a linen-colored plaster wall, a small olive branch in a matte evergreen ceramic vase, soft morning window light

| Color | Hex | Use |
|---|---|---|
| Evergreen | `#1F3A33` | primary, dark sections, sidebar |
| Linen | `#FAF7F0` | page background |
| Mist | `#E3EAE4` | cards and soft surfaces |
| Marigold | `#E3A72F` | accent, primary buttons only |
| Ink | `#14201C` | body text |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/modern-church/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "A place to belong." · "This Sunday"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a light oak table against a linen-colored plaster wall, a small olive branch in a matte evergreen ceramic vase, soft morning window light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screens: the laptop shows the Lanternway homepage: a sunlit sanctuary photo with the large serif headline; the phone shows the app home with a "This Sunday" card and a marigold button. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "A place to belong.", "This Sunday". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway Church concept on a laptop and a phone: the website homepage and the app home screen

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/modern-church/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "A place to belong." · "This Sunday" · "Welcome back, Jordan"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a light oak table against a linen-colored plaster wall, a small olive branch in a matte evergreen ceramic vase, soft morning window light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screens: the laptop shows the Lanternway homepage with the sunlit sanctuary photo and serif headline; the phone shows the app home with a "This Sunday" card; the tablet shows the member portal dashboard with cards and a small bar chart. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "A place to belong.", "This Sunday", "Welcome back, Jordan". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway Church concept: website on a laptop, app on a phone and the member portal on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/modern-church/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Lanternway Church" · "Visit" · "Watch" · "Events" · "Give" · "Plan Your Visit" · "A place to belong." · "Sundays at 9:00 and 11:00 · 412 Alder Street" · "Watch Live"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Full-bleed photo of the empty, sunlit sanctuary with a soft evergreen gradient rising from the bottom-left. Slim top navigation on the photo: wordmark at left, links in the middle, one marigold button at right. Large serif headline bottom-left, one line of service details under it, then two buttons (marigold filled, cream outline). Lots of calm space.

On-screen text, in reading order: "Lanternway Church", "Visit", "Watch", "Events", "Give", "Plan Your Visit", "A place to belong.", "Sundays at 9:00 and 11:00 · 412 Alder Street", "Watch Live".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Linen #FAF7F0. Photography in the layout: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway Church homepage: a sunlit sanctuary photo behind the headline "A place to belong." with Plan Your Visit and Watch Live buttons

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Sermon library — `images/designs/modern-church/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Sermons" · "Search sermons" · "All series" · "Romans" · "Psalms of Ascent" · "Advent" · "Romans · Week 6" · "Grace That Holds" · "Pastor Dana Ellis · 38 min" · "Watch Sermon" · "Rooted" · "Songs for the Road" · "Waiting Well"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Linen page. Page title top-left with a search field at right. A row of filter chips. One wide featured sermon card (photo of candles at left, details at right with a marigold button), and below it a row of three smaller sermon cards with photo thumbnails of the sanctuary, a stone ledge and the dusk exterior.

On-screen text, in reading order: "Sermons", "Search sermons", "All series", "Romans", "Psalms of Ascent", "Advent", "Romans · Week 6", "Grace That Holds", "Pastor Dana Ellis · 38 min", "Watch Sermon", "Rooted", "Songs for the Road", "Waiting Well".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Linen #FAF7F0. Photography in the layout: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway sermon library with series filters, a featured sermon "Grace That Holds" and three more sermon cards

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Online giving — `images/designs/modern-church/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Give with joy." · "Your generosity supports families, missions and our city." · "One time" · "Monthly" · "$25" · "$50" · "$100" · "Other" · "General Fund" · "Give Now" · "Secure payment"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Split layout, inverted: an evergreen panel on the right two-thirds holds a white giving card; the left third has the serif headline and one short line of copy on linen. The giving card has a One time / Monthly toggle, four amount buttons in a row (the second selected in marigold), a fund dropdown and a full-width marigold button, with a small lock icon line under it.

On-screen text, in reading order: "Give with joy.", "Your generosity supports families, missions and our city.", "One time", "Monthly", "$25", "$50", "$100", "Other", "General Fund", "Give Now", "Secure payment".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Linen #FAF7F0. Photography in the layout: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway giving page with a one-time or monthly toggle, amount buttons, a fund picker and a Give Now button

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Home — `images/designs/modern-church/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Good morning" · "This Sunday" · "Grace That Holds" · "9:00 & 11:00" · "Watch Live" · "Give" · "Events" · "Groups" · "Prayer" · "Home" · "Watch" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Linen #FAF7F0 with nothing in it. A bottom tab bar in Evergreen #1F3A33 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Greeting at top-left in serif. A large rounded card with a photo of the sunlit sanctuary, the sermon title and service times over a soft dark fade, and a marigold Watch Live button. Below, a row of four round shortcut buttons with simple line icons and labels. Evergreen bottom tab bar with five labelled icons, Home active in marigold.

On-screen text, in reading order: "Good morning", "This Sunday", "Grace That Holds", "9:00 & 11:00", "Watch Live", "Give", "Events", "Groups", "Prayer", "Home", "Watch", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway app home screen with a This Sunday card, a Watch Live button and shortcuts for giving, events, groups and prayer

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Events — `images/designs/modern-church/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Events" · "This week" · "This month" · "Family Picnic" · "Sat, Oct 18 · Alder Park" · "Register" · "Men's Breakfast" · "Sun, Oct 19 · Fellowship Hall" · "Serve Day" · "Sat, Oct 25 · Downtown" · "Home" · "Watch" · "Give" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Linen #FAF7F0 with nothing in it. A bottom tab bar in Evergreen #1F3A33 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Title at top, a two-option segmented control, then three event rows separated by hairlines; each row has a small square photo, the event name in bold, date and place on a second line. The first row has a small marigold Register button. Evergreen bottom tab bar, Events active.

On-screen text, in reading order: "Events", "This week", "This month", "Family Picnic", "Sat, Oct 18 · Alder Park", "Register", "Men's Breakfast", "Sun, Oct 19 · Fellowship Hall", "Serve Day", "Sat, Oct 25 · Downtown", "Home", "Watch", "Give", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway app events list showing Family Picnic, Men's Breakfast and Serve Day with a Register button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Prayer request — `images/designs/modern-church/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Share a prayer request" · "How can we pray for you?" · "Keep this private" · "Send Request" · "Our prayer team reads every request." · "Home" · "Watch" · "Events" · "Give" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Linen #FAF7F0 with nothing in it. A bottom tab bar in Evergreen #1F3A33 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Calm form screen on linen. Serif title, a tall rounded text area with placeholder text, a toggle row, and a full-width marigold button. One reassuring line of small text under the button. Evergreen bottom tab bar, Me active.

On-screen text, in reading order: "Share a prayer request", "How can we pray for you?", "Keep this private", "Send Request", "Our prayer team reads every request.", "Home", "Watch", "Events", "Give", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway app prayer request form with a private option and a Send Request button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Member portal — `images/designs/modern-church/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Lanternway" · "Overview" · "My Giving" · "My Groups" · "Events" · "Directory" · "Profile" · "Welcome back, Jordan" · "Giving this year" · "$1,840" · "My group" · "Tuesday Young Families" · "Next meets Oct 14" · "Family Picnic" · "Registered" · "2025 giving statement" · "Download PDF"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Signed-in member dashboard. Evergreen left sidebar with the wordmark and six text links. Main area on linen: greeting headline, then a tidy two-by-two grid of white cards: giving this year with a small marigold monthly bar chart, my small group with next meeting, an upcoming event marked Registered, and a statement download with an outline button.

On-screen text, in reading order: "Lanternway", "Overview", "My Giving", "My Groups", "Events", "Directory", "Profile", "Welcome back, Jordan", "Giving this year", "$1,840", "My group", "Tuesday Young Families", "Next meets Oct 14", "Family Picnic", "Registered", "2025 giving statement", "Download PDF".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Linen #FAF7F0. Photography in the layout: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway member portal dashboard with giving this year, the member's small group, an event registration and a giving statement download

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Admin dashboard — `images/designs/modern-church/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Dashboard" · "Pages" · "Sermons" · "Events" · "Giving" · "People" · "Messages" · "This month" · "Attendance" · "1,284" · "Giving" · "$48,210" · "New visitors" · "37" · "Prayer requests" · "22" · "Weekly attendance" · "Recent registrations" · "Morgan Lee" · "Family Picnic" · "Chris Patel" · "Serve Day" · "Ana Ruiz" · "Men's Breakfast"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Lanternway Church (lanternway.example), a modern, welcoming neighborhood church. It is a fictional organization. Palette, used strictly: Evergreen #1F3A33 (primary, dark sections, sidebar), Linen #FAF7F0 (page background), Mist #E3EAE4 (cards and soft surfaces), Marigold #E3A72F (accent, primary buttons only), Ink #14201C (body text). Typography: headings in a soft modern serif like Fraunces; body and UI labels in a clean grotesk like Inter. Mood: warm, calm and welcoming, editorial, morning light. UI style: generous whitespace, 14px rounded cards, thin hairline dividers, marigold pill buttons with ink text, simple line icons.

Screen: Church admin dashboard. Evergreen sidebar with seven links, Dashboard active. Header with page title and a This month dropdown. Four KPI tiles in a row, then a wide line chart of weekly attendance (marigold line on a light grid) beside a short table of recent event registrations with three rows.

On-screen text, in reading order: "Dashboard", "Pages", "Sermons", "Events", "Giving", "People", "Messages", "This month", "Attendance", "1,284", "Giving", "$48,210", "New visitors", "37", "Prayer requests", "22", "Weekly attendance", "Recent registrations", "Morgan Lee", "Family Picnic", "Chris Patel", "Serve Day", "Ana Ruiz", "Men's Breakfast".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Linen #FAF7F0. Photography in the layout: an empty sunlit sanctuary with light wooden pews and tall windows, candles on a stone ledge, an open Bible on a linen tablecloth, the church exterior at dusk with warm windows. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Lanternway admin dashboard with attendance, giving, new visitor and prayer request totals, a weekly attendance chart and recent registrations

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
