# Youth Ministry — image prompts

Design `youth-ministry` · Church · **Concept** (a fictional organization, never presented as a client).
Tagline: A home for students and parents: events, check-in and weekly updates.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Basecamp Students, a church youth ministry for grades 6 to 12 and their parents
- **Domain, if a URL ever shows:** `basecamp.example`
- **Typography:** headlines in a bold condensed sans like Anton, uppercase; body in Inter
- **Mood:** energetic streetwear-poster look, bold but tidy
- **UI style:** big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast
- **Imagery:** a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Places and objects only, never people
- **Device scenes (cover and hero):** a raw concrete desk and wall, warm string lights blurred in the background, a lime-green sticky note

| Color | Hex | Use |
|---|---|---|
| Ink black | `#111111` | primary, dark sections, tab bar |
| Off-white | `#F5F5F0` | page background |
| Electric lime | `#C6F432` | accent, primary buttons |
| Tangerine | `#FF6B2C` | second accent, tags only |
| Concrete | `#D9D9D4` | cards and surfaces |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/youth-ministry/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "FIND YOUR PEOPLE." · "TONIGHT 6:30 PM"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a raw concrete desk and wall, warm string lights blurred in the background, a lime-green sticky note. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screens: the laptop shows the Basecamp homepage with the giant condensed headline and a campfire photo; the phone shows the app home with a black Game Night card and a lime button. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "FIND YOUR PEOPLE.", "TONIGHT 6:30 PM". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp Students concept on a laptop and a phone: the homepage and the app home screen

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/youth-ministry/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "FIND YOUR PEOPLE." · "CHECK-IN" · "Torres family"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a raw concrete desk and wall, warm string lights blurred in the background, a lime-green sticky note. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screens: the laptop shows the Basecamp homepage headline and campfire photo; the phone shows the black check-in pass with a QR code; the tablet shows the parent portal dashboard. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "FIND YOUR PEOPLE.", "CHECK-IN", "Torres family". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp Students concept: website on a laptop, check-in pass on a phone and the parent portal on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/youth-ministry/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "BASECAMP" · "Events" · "Groups" · "Parents" · "Photos" · "FIND YOUR PEOPLE." · "Wednesdays 6:30 PM · Grades 6–12" · "I'm New" · "Parents"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Off-grid poster layout: a giant two-line condensed headline across the left, a tall campfire photo cropped into a rounded rectangle on the right that the headline slightly overlaps. One line of details and two buttons (lime filled, black outline). Minimal nav at top.

On-screen text, in reading order: "BASECAMP", "Events", "Groups", "Parents", "Photos", "FIND YOUR PEOPLE.", "Wednesdays 6:30 PM · Grades 6–12", "I'm New", "Parents".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Off-white #F5F5F0. Photography in the layout: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp Students homepage with the headline "Find your people." beside a campfire photo and buttons for new students and parents

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Event page: Fall Retreat — `images/designs/youth-ministry/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "FALL RETREAT" · "Nov 7–9 · Camp Cedar Ridge" · "Grades 6–12" · "Cabins by grade" · "18 spots left" · "Register Now" · "Permission form" · "Medical info" · "Payment"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Black section. Huge condensed event title, dates and place under it, a wide photo of tents at dusk. Three info tiles in a row in concrete gray, a lime Register Now button, and a three-item checklist with lime ticks.

On-screen text, in reading order: "FALL RETREAT", "Nov 7–9 · Camp Cedar Ridge", "Grades 6–12", "Cabins by grade", "18 spots left", "Register Now", "Permission form", "Medical info", "Payment".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Off-white #F5F5F0. Photography in the layout: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp Fall Retreat event page with dates, spots left, a Register Now button and a registration checklist

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: For parents — `images/designs/youth-ministry/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "FOR PARENTS" · "This week's update" · "Oct 15" · "Retreat forms are due Friday. Game night moves to the gym." · "Read Update" · "Permission forms" · "Check-in & safety" · "Contact a leader"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Off-white page. Condensed headline at top-left. A wide card previewing this week's parent update. Below, a row of three cards with line icons: permission forms, check-in and safety, contact a leader. Calm and trustworthy, fewer accents.

On-screen text, in reading order: "FOR PARENTS", "This week's update", "Oct 15", "Retreat forms are due Friday. Game night moves to the gym.", "Read Update", "Permission forms", "Check-in & safety", "Contact a leader".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Off-white #F5F5F0. Photography in the layout: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp parents page with this week's update and links to permission forms, check-in and safety, and leaders

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Home — `images/designs/youth-ministry/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "HEY, MAYA" · "TONIGHT 6:30 PM" · "Game Night" · "Check In" · "Announcements" · "Retreat forms due Fri" · "New" · "Small groups start Oct 22" · "Home" · "Events" · "Groups" · "Photos" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Off-white #F5F5F0 with nothing in it. A bottom tab bar in Ink black #111111 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Condensed greeting at top. A big black card for tonight with a lime Check In button. Below, an announcements list with two rows, one with a tangerine tag. Black bottom tab bar, Home active in lime.

On-screen text, in reading order: "HEY, MAYA", "TONIGHT 6:30 PM", "Game Night", "Check In", "Announcements", "Retreat forms due Fri", "New", "Small groups start Oct 22", "Home", "Events", "Groups", "Photos", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp app home with tonight's Game Night, a Check In button and announcements

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Check-in pass — `images/designs/youth-ministry/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "CHECK-IN" · "Show this at the door" · "Maya Torres" · "Grade 9" · "Checked in 6:24 PM" · "Home" · "Events" · "Groups" · "Photos" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Ink black #111111 with nothing in it. A bottom tab bar in Ink black #111111 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Black screen. A large off-white card in the center with a clean QR code, the student's name and grade. Under it, a lime status pill with a tick. Short helper text. Black bottom tab bar, Me active.

On-screen text, in reading order: "CHECK-IN", "Show this at the door", "Maya Torres", "Grade 9", "Checked in 6:24 PM", "Home", "Events", "Groups", "Photos", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp app check-in pass with a QR code for Maya Torres, Grade 9, marked checked in

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Photo album — `images/designs/youth-ministry/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "PHOTOS" · "Game Night" · "Oct 8 · 42 photos" · "Home" · "Events" · "Groups" · "Photos" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Off-white #F5F5F0 with nothing in it. A bottom tab bar in Ink black #111111 sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Condensed title and album name with date. A tidy three-column grid of square photos of objects and places only: pizza boxes, glow sticks on a table, confetti on a gym floor, sneakers on a court line, a campfire, string lights. Black bottom tab bar, Photos active.

On-screen text, in reading order: "PHOTOS", "Game Night", "Oct 8 · 42 photos", "Home", "Events", "Groups", "Photos", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp app photo album from Game Night in a three-column grid

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Parent portal — `images/designs/youth-ministry/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "BASECAMP" · "Overview" · "Forms" · "Check-ins" · "Messages" · "Torres family" · "Maya" · "Grade 9" · "Leo" · "Grade 7" · "Forms" · "Fall Retreat permission" · "Signed" · "Medical info" · "Needs update" · "Check-in history" · "Wed, Oct 8 · 6:24 PM" · "From Coach Ben" · "See you Wednesday!"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Off-white dashboard with a black left sidebar. Header with the family name. Two student cards side by side. A forms card listing two forms, one signed (lime tick) and one needing an update (tangerine tag). A check-in history card and a short message from a leader.

On-screen text, in reading order: "BASECAMP", "Overview", "Forms", "Check-ins", "Messages", "Torres family", "Maya", "Grade 9", "Leo", "Grade 7", "Forms", "Fall Retreat permission", "Signed", "Medical info", "Needs update", "Check-in history", "Wed, Oct 8 · 6:24 PM", "From Coach Ben", "See you Wednesday!".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Off-white #F5F5F0. Photography in the layout: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp parent portal for the Torres family with two students, form status, check-in history and a leader message

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Youth admin — `images/designs/youth-ministry/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Dashboard" · "Check-ins" · "Events" · "Forms" · "Groups" · "Messages" · "Students this week" · "142" · "First-time guests" · "9" · "Forms pending" · "23" · "Retreat spots left" · "18" · "Weekly check-ins" · "Small groups" · "9th Grade Girls" · "14" · "10th Grade Guys" · "12" · "Middle School Mixed" · "21" · "Seniors" · "9"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Basecamp Students (basecamp.example), a church youth ministry for grades 6 to 12 and their parents. It is a fictional organization. Palette, used strictly: Ink black #111111 (primary, dark sections, tab bar), Off-white #F5F5F0 (page background), Electric lime #C6F432 (accent, primary buttons), Tangerine #FF6B2C (second accent, tags only), Concrete #D9D9D4 (cards and surfaces). Typography: headlines in a bold condensed sans like Anton, uppercase; body in Inter. Mood: energetic streetwear-poster look, bold but tidy. UI style: big condensed headlines, square-ish 10px corners, thick lime buttons with black text, small tangerine tags, lots of contrast.

Screen: Admin dashboard, off-white with black sidebar. Four KPI tiles, then a lime bar chart of weekly check-ins and a small-group roster table with four rows and counts.

On-screen text, in reading order: "Dashboard", "Check-ins", "Events", "Forms", "Groups", "Messages", "Students this week", "142", "First-time guests", "9", "Forms pending", "23", "Retreat spots left", "18", "Weekly check-ins", "Small groups", "9th Grade Girls", "14", "10th Grade Guys", "12", "Middle School Mixed", "21", "Seniors", "9".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Off-white #F5F5F0. Photography in the layout: a campfire at dusk with tents, an empty gym with a basketball hoop, string lights over a youth room with couches, sneakers on a court line. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Basecamp admin dashboard with student, guest and form totals, weekly check-ins and small-group rosters

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
