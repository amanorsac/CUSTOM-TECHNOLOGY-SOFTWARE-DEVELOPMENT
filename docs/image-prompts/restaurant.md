# Restaurant — image prompts

Design `restaurant` · Business · **Concept** (a fictional organization, never presented as a client).
Tagline: Menus, reservations and online orders that feel as good as the food.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Osteria Lume, a candlelit Italian restaurant known for handmade pasta and a wood-fired oven
- **Domain, if a URL ever shows:** `osterialume.example`
- **Typography:** headings in an elegant italic serif like Cormorant Garamond; body in Inter
- **Mood:** warm, candlelit, intimate and appetizing
- **UI style:** dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography
- **Imagery:** plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Places and objects only, never people
- **Device scenes (cover and hero):** a dark slate table, a lit candle in a glass, a folded linen napkin and a small olive-oil bottle, warm low light

| Color | Hex | Use |
|---|---|---|
| Night | `#141210` | primary dark background |
| Parchment | `#F3EBDD` | light background and text on dark |
| Chili | `#C2412D` | accent, primary buttons |
| Olive gold | `#B9A04B` | second accent, thin rules |
| Smoke | `#3A3632` | dark cards and surfaces |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/restaurant/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Handmade pasta, wood-fired evenings." · "Tonight's special"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a dark slate table, a lit candle in a glass, a folded linen napkin and a small olive-oil bottle, warm low light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screens: the laptop shows the Osteria Lume homepage with the pasta photo and italic serif headline; the phone shows the dark app home with tonight's special. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Handmade pasta, wood-fired evenings.", "Tonight's special". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume concept on a laptop and a phone: the homepage and the ordering app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/restaurant/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Antipasti" · "Pickup order" · "Reserve a table"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a dark slate table, a lit candle in a glass, a folded linen napkin and a small olive-oil bottle, warm low light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screens: the laptop shows the parchment menu page; the phone shows the pickup order screen; the tablet shows the reservation page. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Antipasti", "Pickup order", "Reserve a table". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume concept: menu on a laptop, pickup ordering on a phone and reservations on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/restaurant/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Osteria Lume" · "Menu" · "Reserve" · "Order" · "Events" · "Gift Cards" · "Handmade pasta, wood-fired evenings." · "Tue–Sun · 5–10 PM" · "Reserve a Table" · "Order Pickup"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Full-bleed photo of handmade pasta in warm low light, darkened toward the bottom-left. Italic serif headline bottom-left, opening hours, two buttons (chili filled, parchment outline). Nav on top in parchment.

On-screen text, in reading order: "Osteria Lume", "Menu", "Reserve", "Order", "Events", "Gift Cards", "Handmade pasta, wood-fired evenings.", "Tue–Sun · 5–10 PM", "Reserve a Table", "Order Pickup".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Night #141210. Photography in the layout: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume homepage: handmade pasta photo behind the headline "Handmade pasta, wood-fired evenings." with Reserve and Order buttons

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Menu — `images/designs/restaurant/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Dinner" · "Drinks" · "Dessert" · "Antipasti" · "Burrata" · "roasted peaches, basil" · "16" · "Pasta" · "Cacio e pepe" · "pecorino, black pepper" · "21" · "Pappardelle" · "braised short rib" · "28" · "Dal Forno" · "Margherita" · "tomato, mozzarella, basil" · "18"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Parchment page styled like a printed menu. Tabs at top. Three columns with section titles in italic serif and thin olive-gold rules; dishes with a short description and price aligned right. One small pasta photo inset.

On-screen text, in reading order: "Dinner", "Drinks", "Dessert", "Antipasti", "Burrata", "roasted peaches, basil", "16", "Pasta", "Cacio e pepe", "pecorino, black pepper", "21", "Pappardelle", "braised short rib", "28", "Dal Forno", "Margherita", "tomato, mozzarella, basil", "18".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Parchment #F3EBDD. Photography in the layout: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume menu page with antipasti, pasta and wood-fired dishes

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Reserve a table — `images/designs/restaurant/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Reserve a table" · "Party size" · "2 guests" · "Date" · "Fri, Oct 17" · "6:00" · "6:30" · "7:15" · "8:00" · "Confirm Reservation"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Split: candlelit table photo on the left half; on the right on night background, a reservation card with party size, date, a row of time chips (one selected in chili) and a chili confirm button.

On-screen text, in reading order: "Reserve a table", "Party size", "2 guests", "Date", "Fri, Oct 17", "6:00", "6:30", "7:15", "8:00", "Confirm Reservation".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Night #141210. Photography in the layout: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume reservation page with party size, date and time choices beside a candlelit table photo

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Home — `images/designs/restaurant/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Osteria Lume" · "Tonight's special" · "Pumpkin ravioli" · "Order Pickup" · "Reserve" · "Lume Rewards" · "340 points" · "Home" · "Order" · "Rewards" · "Account"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Night #141210 with nothing in it. A bottom tab bar in Night #141210 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Dark screen. Wordmark in italic serif. A large rounded photo card of tonight's special. Two buttons side by side. A rewards strip with points. Night bottom tab bar with parchment icons, Home active in chili.

On-screen text, in reading order: "Osteria Lume", "Tonight's special", "Pumpkin ravioli", "Order Pickup", "Reserve", "Lume Rewards", "340 points", "Home", "Order", "Rewards", "Account".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume app home with tonight's special, pickup and reservation buttons and rewards points

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Pickup order — `images/designs/restaurant/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Pickup order" · "Cacio e pepe" · "21" · "Margherita" · "18" · "Tiramisu" · "10" · "View cart · 2 items · $39" · "Home" · "Order" · "Reserve" · "Rewards" · "Account"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Night #141210 with nothing in it. A bottom tab bar in Night #141210 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Dark screen. Title. Three menu rows with small round dish photos, names, prices and a plus button. A chili cart bar near the bottom above the tab bar. Night bottom tab bar, Order active.

On-screen text, in reading order: "Pickup order", "Cacio e pepe", "21", "Margherita", "18", "Tiramisu", "10", "View cart · 2 items · $39", "Home", "Order", "Reserve", "Rewards", "Account".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume app pickup ordering with dishes and a cart of two items

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Rewards — `images/designs/restaurant/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Lume Rewards" · "340" · "of 500 points" · "160 points to a free dessert" · "Send a Gift Card" · "Home" · "Order" · "Reserve" · "Rewards" · "Account"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Night #141210 with nothing in it. A bottom tab bar in Night #141210 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Dark screen. A large olive-gold progress ring with points in the middle. One line about the next reward. A parchment card to send a gift card with a chili button. Night bottom tab bar, Rewards active.

On-screen text, in reading order: "Lume Rewards", "340", "of 500 points", "160 points to a free dessert", "Send a Gift Card", "Home", "Order", "Reserve", "Rewards", "Account".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume app rewards screen showing 340 of 500 points and a gift card option

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Private events portal — `images/designs/restaurant/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Osteria Lume" · "My event" · "Menu" · "Payments" · "Messages" · "Rehearsal dinner" · "Sat, Nov 8 · 28 guests" · "Menu proposal ready" · "Set menu" · "Burrata" · "Pappardelle" · "Tiramisu" · "Approve Menu" · "Deposit" · "Paid"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Guest-facing portal on parchment with a night sidebar. An event summary card, a status tag "Menu proposal ready", a set-menu card with three courses, and a deposit card marked Paid.

On-screen text, in reading order: "Osteria Lume", "My event", "Menu", "Payments", "Messages", "Rehearsal dinner", "Sat, Nov 8 · 28 guests", "Menu proposal ready", "Set menu", "Burrata", "Pappardelle", "Tiramisu", "Approve Menu", "Deposit", "Paid".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Parchment #F3EBDD. Photography in the layout: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume private events portal with a rehearsal dinner, its proposed set menu and a paid deposit

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Restaurant admin — `images/designs/restaurant/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Tonight" · "Reservations" · "Orders" · "Menu" · "Events" · "Covers tonight" · "86" · "Online orders" · "41" · "Avg. ticket" · "$64" · "Event requests" · "5" · "Reservations" · "5 PM" · "6 PM" · "7 PM" · "8 PM" · "9 PM" · "Table 4" · "Table 7" · "Table 12" · "Order #2291 · Ready" · "Order #2292 · Cooking"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Osteria Lume (osterialume.example), a candlelit Italian restaurant known for handmade pasta and a wood-fired oven. It is a fictional organization. Palette, used strictly: Night #141210 (primary dark background), Parchment #F3EBDD (light background and text on dark), Chili #C2412D (accent, primary buttons), Olive gold #B9A04B (second accent, thin rules), Smoke #3A3632 (dark cards and surfaces). Typography: headings in an elegant italic serif like Cormorant Garamond; body in Inter. Mood: warm, candlelit, intimate and appetizing. UI style: dark and parchment sections, thin olive-gold rules, 6px corners, chili buttons with parchment text, menu-style typography.

Screen: Admin in dark mode with smoke cards. Four KPI tiles. A reservations timeline by table for the evening (horizontal bars in chili and olive-gold tints) and a short list of online orders.

On-screen text, in reading order: "Tonight", "Reservations", "Orders", "Menu", "Events", "Covers tonight", "86", "Online orders", "41", "Avg. ticket", "$64", "Event requests", "5", "Reservations", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "Table 4", "Table 7", "Table 12", "Order #2291 · Ready", "Order #2292 · Cooking".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Night #141210. Photography in the layout: plated handmade pasta in a ceramic bowl, the glowing mouth of a wood-fired oven, a candlelit table set for two, a tiramisu on a stone plate. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Osteria Lume admin with covers, orders and event totals, a reservations timeline and online orders

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
