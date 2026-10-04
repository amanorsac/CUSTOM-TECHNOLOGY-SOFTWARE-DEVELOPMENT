# Real Estate — image prompts

Design `real-estate` · Business · **Concept** (a fictional organization, never presented as a client).
Tagline: Listings, tours and leads for agents who want a site of their own.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Juniper & Vale Realty, an independent real estate team
- **Domain, if a URL ever shows:** `junipervale.example`
- **Typography:** headings in a modern display serif like DM Serif Display; body in Manrope
- **Mood:** airy, architectural and aspirational, golden hour
- **UI style:** large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters
- **Imagery:** modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Places and objects only, never people
- **Device scenes (cover and hero):** a pale limestone kitchen counter, a glass vase with an olive branch, golden-hour light from a large window

| Color | Hex | Use |
|---|---|---|
| Bone | `#FAF8F4` | page background |
| Charcoal | `#232321` | text and dark UI |
| Deep olive | `#4B5132` | primary, buttons and sidebar |
| Clay | `#B9836A` | accent, price pins and highlights |
| Stone | `#CFC6B8` | cards, borders and surfaces |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/real-estate/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Find the home that fits." · "$685,000"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a pale limestone kitchen counter, a glass vase with an olive branch, golden-hour light from a large window. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screens: the laptop shows the Juniper & Vale homepage with a golden-hour home photo and search bar; the phone shows the app explore screen with a listing card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Find the home that fits.", "$685,000". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale Realty concept on a laptop and a phone: the homepage and the home search app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/real-estate/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "42 homes" · "Schedule a tour" · "New leads"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a pale limestone kitchen counter, a glass vase with an olive branch, golden-hour light from a large window. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screens: the laptop shows the listings page with the map and price pins; the phone shows the tour scheduling screen; the tablet shows the agent CRM. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "42 homes", "Schedule a tour", "New leads". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale Realty concept: listing search on a laptop, tour booking on a phone and the agent CRM on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage with search — `images/designs/real-estate/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Juniper & Vale" · "Buy" · "Rent" · "Sell" · "Neighborhoods" · "Agents" · "Find the home that fits." · "City, neighborhood or ZIP" · "Search"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: Image-as-canvas: a full-bleed golden-hour photo of a modern home. Centred serif headline in bone, and below it a floating bone search bar with Buy / Rent tabs, a location field and an olive Search button.

On-screen text, in reading order: "Juniper & Vale", "Buy", "Rent", "Sell", "Neighborhoods", "Agents", "Find the home that fits.", "City, neighborhood or ZIP", "Search".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Bone #FAF8F4. Photography in the layout: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale homepage: a modern home at golden hour behind the headline "Find the home that fits." and a property search bar

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Listings with map — `images/designs/real-estate/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Price" · "Beds" · "Baths" · "Home type" · "42 homes" · "$685,000" · "3 bd · 2 ba · 1,840 sq ft" · "18 Linden Court" · "$542,500" · "2 bd · 2 ba · 1,210 sq ft" · "7 Harbor Row" · "$910,000" · "4 bd · 3 ba · 2,650 sq ft" · "302 Ridge Lane" · "$685K" · "$542K" · "$910K"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: Split results page: a row of filter dropdowns at top, three listing cards stacked on the left (photo left, details right), and a soft grayscale map on the right with clay price pins.

On-screen text, in reading order: "Price", "Beds", "Baths", "Home type", "42 homes", "$685,000", "3 bd · 2 ba · 1,840 sq ft", "18 Linden Court", "$542,500", "2 bd · 2 ba · 1,210 sq ft", "7 Harbor Row", "$910,000", "4 bd · 3 ba · 2,650 sq ft", "302 Ridge Lane", "$685K", "$542K", "$910K".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Bone #FAF8F4. Photography in the layout: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale listing search with filters, three homes for sale and a map with price pins

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Listing detail — `images/designs/real-estate/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "18 Linden Court" · "$685,000" · "3 beds" · "2 baths" · "1,840 sq ft" · "Built 2019" · "Avery Lin" · "AL" · "Listing agent" · "Schedule a Tour" · "Ask a Question"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: A gallery of one large living-room photo and two smaller kitchen and exterior photos. Below, the address and price in serif, a facts row, and a right-hand agent card with an initials avatar and an olive button.

On-screen text, in reading order: "18 Linden Court", "$685,000", "3 beds", "2 baths", "1,840 sq ft", "Built 2019", "Avery Lin", "AL", "Listing agent", "Schedule a Tour", "Ask a Question".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Bone #FAF8F4. Photography in the layout: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale listing page for 18 Linden Court with photos, home facts and an agent card

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Explore — `images/designs/real-estate/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Good evening, Taylor" · "New in Maple Heights: 4 homes" · "$685,000" · "3 bd · 2 ba · 18 Linden Court" · "Explore" · "Saved" · "Tours" · "Messages" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Bone #FAF8F4 with nothing in it. A bottom tab bar in Bone #FAF8F4 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: Greeting and a short line about new homes. A large listing card with a golden-hour photo, price, details and a heart icon. Bone bottom tab bar with olive active icon.

On-screen text, in reading order: "Good evening, Taylor", "New in Maple Heights: 4 homes", "$685,000", "3 bd · 2 ba · 18 Linden Court", "Explore", "Saved", "Tours", "Messages", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale app explore screen with a new listing in Maple Heights

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Schedule a tour — `images/designs/real-estate/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Schedule a tour" · "18 Linden Court" · "Thu 16" · "Fri 17" · "Sat 18" · "10:00 AM" · "11:30 AM" · "2:00 PM" · "In person" · "Video" · "Request Tour" · "Explore" · "Saved" · "Tours" · "Messages" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Bone #FAF8F4 with nothing in it. A bottom tab bar in Bone #FAF8F4 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: Address title. A horizontal date strip with one date selected in olive. A grid of three time chips. An In person / Video segmented control. Full-width olive button. Bone bottom tab bar, Tours active.

On-screen text, in reading order: "Schedule a tour", "18 Linden Court", "Thu 16", "Fri 17", "Sat 18", "10:00 AM", "11:30 AM", "2:00 PM", "In person", "Video", "Request Tour", "Explore", "Saved", "Tours", "Messages", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale app tour scheduling with dates, times and a Request Tour button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Neighborhood guide — `images/designs/real-estate/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Maple Heights" · "Walk score" · "82" · "Parks" · "6" · "Avg. commute" · "24 min" · "Schools" · "Coffee & dining" · "Explore" · "Saved" · "Tours" · "Messages" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Bone #FAF8F4 with nothing in it. A bottom tab bar in Bone #FAF8F4 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: A tree-lined street photo at top in a rounded frame. Neighbourhood name in serif. Three stat tiles. Two section rows with arrows. Bone bottom tab bar, Explore active.

On-screen text, in reading order: "Maple Heights", "Walk score", "82", "Parks", "6", "Avg. commute", "24 min", "Schools", "Coffee & dining", "Explore", "Saved", "Tours", "Messages", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale app neighborhood guide for Maple Heights with walk score, parks and commute time

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Buyer portal — `images/designs/real-estate/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Juniper & Vale" · "Home search" · "Saved homes" · "Tours" · "Documents" · "Messages" · "Taylor's home search" · "Saved homes" · "$685,000" · "$542,500" · "$910,000" · "Upcoming tours" · "Fri, Oct 17 · 11:30 AM" · "18 Linden Court" · "Documents" · "Pre-approval letter.pdf" · "From Avery" · "Two new homes match your search."

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: Olive sidebar. Greeting. A row of three saved-home cards with photos and prices. Below, upcoming tours and a documents card with a pre-approval letter, plus a short message from the agent.

On-screen text, in reading order: "Juniper & Vale", "Home search", "Saved homes", "Tours", "Documents", "Messages", "Taylor's home search", "Saved homes", "$685,000", "$542,500", "$910,000", "Upcoming tours", "Fri, Oct 17 · 11:30 AM", "18 Linden Court", "Documents", "Pre-approval letter.pdf", "From Avery", "Two new homes match your search.".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Bone #FAF8F4. Photography in the layout: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale buyer portal with saved homes, an upcoming tour, documents and a message from the agent

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Agent CRM — `images/designs/real-estate/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Leads" · "Listings" · "Tours" · "Reports" · "New leads" · "46" · "Tours this week" · "19" · "Active listings" · "23" · "Under contract" · "6" · "Lead" · "Source" · "Status" · "Taylor Brooks" · "Website" · "Touring" · "Sam Ortega" · "Open house" · "New" · "Priya Nair" · "Referral" · "Offer" · "This week"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Juniper & Vale Realty (junipervale.example), an independent real estate team. It is a fictional organization. Palette, used strictly: Bone #FAF8F4 (page background), Charcoal #232321 (text and dark UI), Deep olive #4B5132 (primary, buttons and sidebar), Clay #B9836A (accent, price pins and highlights), Stone #CFC6B8 (cards, borders and surfaces). Typography: headings in a modern display serif like DM Serif Display; body in Manrope. Mood: airy, architectural and aspirational, golden hour. UI style: large photography, 12px corners, olive buttons with bone text, clay price pins, calm filters.

Screen: Admin with olive sidebar. Four KPI tiles. A leads table with name, source, status tags and next step. A small tour calendar on the right.

On-screen text, in reading order: "Leads", "Listings", "Tours", "Reports", "New leads", "46", "Tours this week", "19", "Active listings", "23", "Under contract", "6", "Lead", "Source", "Status", "Taylor Brooks", "Website", "Touring", "Sam Ortega", "Open house", "New", "Priya Nair", "Referral", "Offer", "This week".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Bone #FAF8F4. Photography in the layout: modern homes at golden hour, a bright living room with large windows, a kitchen with pale stone counters, a tree-lined residential street. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Juniper & Vale agent CRM with lead, tour and listing totals, a leads table and a tour calendar

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
