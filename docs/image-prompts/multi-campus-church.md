# Multi-Campus Church — image prompts

Design `multi-campus-church` · Church · **Concept** (a fictional organization, never presented as a client).
Tagline: One church family across every campus, with one place to lead them all.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Harborline Church, one church meeting at three campuses: Downtown, Northgate and Lakeside
- **Domain, if a URL ever shows:** `harborline.example`
- **Typography:** headings in a confident geometric sans like Sora, semibold; body in Inter
- **Mood:** contemporary, connected and confident, warm dusk light
- **UI style:** large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly
- **Imagery:** three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Places and objects only, never people
- **Device scenes (cover and hero):** a pale lilac-gray wall and a smooth plum-lacquered shelf, a small brass lamp glowing, dusk light through a window

| Color | Hex | Use |
|---|---|---|
| Plum | `#3B1F3F` | primary, dark sections, sidebar |
| Warm white | `#FCF9F7` | page background |
| Lilac mist | `#ECE3EE` | cards and soft surfaces |
| Peach | `#F2A07B` | accent, primary buttons only |
| Graphite | `#26222A` | body text |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/multi-campus-church/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "One church. Three homes." · "Sunday at Northgate"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a pale lilac-gray wall and a smooth plum-lacquered shelf, a small brass lamp glowing, dusk light through a window. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screens: the laptop shows the Harborline homepage with the bold headline and three campus photo cards; the phone shows the app home with a plum service card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "One church. Three homes.", "Sunday at Northgate". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline Church concept on a laptop and a phone: the campus homepage and the app home screen

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/multi-campus-church/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "One church. Three homes." · "Sunday at Northgate" · "Attendance by campus"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a pale lilac-gray wall and a smooth plum-lacquered shelf, a small brass lamp glowing, dusk light through a window. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screens: the laptop shows the Harborline homepage with three campus cards; the phone shows the app home; the tablet shows the multi-campus admin dashboard with a bar chart. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "One church. Three homes.", "Sunday at Northgate", "Attendance by campus". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline Church concept: website on a laptop, app on a phone and the multi-campus admin on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage with campus picker — `images/designs/multi-campus-church/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Harborline Church" · "Campuses" · "Watch" · "Next Steps" · "Give" · "Find a Campus" · "One church. Three homes." · "Downtown · Northgate · Lakeside" · "Downtown" · "Sundays 9:30 & 11:15" · "Northgate" · "Sundays 10:00" · "Lakeside" · "Sundays 9:00 & 10:45"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Top-left lead: big two-line headline and one line listing the campuses, on warm white. Below, three equal campus cards in a row, each with a dusk photo of its building, campus name and service times, and a small arrow link. Slim navigation at top with a peach button.

On-screen text, in reading order: "Harborline Church", "Campuses", "Watch", "Next Steps", "Give", "Find a Campus", "One church. Three homes.", "Downtown · Northgate · Lakeside", "Downtown", "Sundays 9:30 & 11:15", "Northgate", "Sundays 10:00", "Lakeside", "Sundays 9:00 & 10:45".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FCF9F7. Photography in the layout: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline Church homepage with the headline "One church. Three homes." and cards for the Downtown, Northgate and Lakeside campuses

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Campus page: Lakeside — `images/designs/multi-campus-church/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Harborline Lakeside" · "Sundays 9:00 & 10:45" · "2200 Shoreline Drive" · "Campus Pastor" · "Ruth Okafor" · "RO" · "Upcoming at Lakeside" · "Kids Night" · "Fri, Oct 17" · "Baptism Sunday" · "Sun, Oct 26" · "Get Directions"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Wide hero photo of the timber lakeside building at dusk with the campus name over a plum fade at bottom-left. Below, two columns: left has service times, address and the campus pastor with a round initials avatar (no photo); right has an "Upcoming at Lakeside" list with two events and a simple map card.

On-screen text, in reading order: "Harborline Lakeside", "Sundays 9:00 & 10:45", "2200 Shoreline Drive", "Campus Pastor", "Ruth Okafor", "RO", "Upcoming at Lakeside", "Kids Night", "Fri, Oct 17", "Baptism Sunday", "Sun, Oct 26", "Get Directions".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FCF9F7. Photography in the layout: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline Lakeside campus page with service times, the campus pastor, upcoming events and directions

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Serve at your campus — `images/designs/multi-campus-church/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Serve at your campus" · "Campus: Northgate" · "Welcome Team" · "Greet people at the doors" · "Kids Ministry" · "Lead a Sunday class" · "Production" · "Run sound and lights" · "Parking" · "Help guests find a spot" · "Sign Up" · "October 2026"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Volunteer sign-up page. Headline and a campus dropdown set to Northgate. A clean grid of four role cards (two by two), each with a simple line icon, role name, one short line, and a peach Sign Up button. A small October month calendar on the right with three dates marked in peach.

On-screen text, in reading order: "Serve at your campus", "Campus: Northgate", "Welcome Team", "Greet people at the doors", "Kids Ministry", "Lead a Sunday class", "Production", "Run sound and lights", "Parking", "Help guests find a spot", "Sign Up", "October 2026".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FCF9F7. Photography in the layout: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline volunteer page with role cards for Welcome Team, Kids Ministry, Production and Parking and an October calendar

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Home with campus switcher — `images/designs/multi-campus-church/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Northgate" · "Sunday at Northgate" · "10:00 AM" · "Last week" · "Built Together, Part 3" · "Give" · "Serve" · "Groups" · "Care" · "Home" · "Watch" · "More"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Warm white #FCF9F7 with nothing in it. A bottom tab bar in Plum #3B1F3F sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: A campus switcher pill at top-left. A large plum card with this Sunday's service at the selected campus. A media card with a dusk auditorium photo and last week's message. A row of four shortcuts. Plum bottom tab bar, Home active in peach.

On-screen text, in reading order: "Northgate", "Sunday at Northgate", "10:00 AM", "Last week", "Built Together, Part 3", "Give", "Serve", "Groups", "Care", "Home", "Watch", "More".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline app home with a Northgate campus switcher, this Sunday's service and last week's message

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: My serving schedule — `images/designs/multi-campus-church/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "My Schedule" · "Next up" · "Welcome Team" · "Sun, Oct 19 · Arrive 9:15" · "Northgate" · "Accept" · "Decline" · "Oct 26 · Parking" · "Nov 2 · Welcome Team" · "Home" · "Watch" · "Serve" · "Give" · "More"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Warm white #FCF9F7 with nothing in it. A bottom tab bar in Plum #3B1F3F sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Title at top. A highlighted card for the next serving shift with two buttons (peach Accept, outline Decline). Below, a short list of two later shifts. Plum bottom tab bar, Serve active.

On-screen text, in reading order: "My Schedule", "Next up", "Welcome Team", "Sun, Oct 19 · Arrive 9:15", "Northgate", "Accept", "Decline", "Oct 26 · Parking", "Nov 2 · Welcome Team", "Home", "Watch", "Serve", "Give", "More".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline app serving schedule with an upcoming Welcome Team shift to accept or decline

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Give by campus — `images/designs/multi-campus-church/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Give" · "$75" · "Campus" · "Lakeside" · "Fund" · "Missions" · "Make it monthly" · "Give $75" · "Home" · "Watch" · "Serve" · "More"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Warm white #FCF9F7 with nothing in it. A bottom tab bar in Plum #3B1F3F sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Large amount in the center, a campus picker, a fund picker and a monthly toggle, then a full-width peach button near the bottom. Plenty of space. Plum bottom tab bar, Give active.

On-screen text, in reading order: "Give", "$75", "Campus", "Lakeside", "Fund", "Missions", "Make it monthly", "Give $75", "Home", "Watch", "Serve", "More".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline app giving screen with a $75 gift to the Lakeside campus missions fund

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Member portal — `images/designs/multi-campus-church/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Harborline" · "Home" · "Serving" · "Giving" · "Groups" · "Profile" · "Hi, Sam" · "My campus: Northgate" · "Serving this month" · "3 shifts" · "Care request" · "Received" · "A pastor will reach out this week." · "Giving statement" · "Download" · "Oct 19 · Welcome Team" · "Oct 26 · Parking" · "Nov 2 · Welcome Team"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Plum left sidebar with the wordmark and five links. Main area: greeting and "My campus" chip, then three white cards in a row (serving this month, care request status with a soft green "Received" label, giving statement), and below a list of the member's next three serving shifts.

On-screen text, in reading order: "Harborline", "Home", "Serving", "Giving", "Groups", "Profile", "Hi, Sam", "My campus: Northgate", "Serving this month", "3 shifts", "Care request", "Received", "A pastor will reach out this week.", "Giving statement", "Download", "Oct 19 · Welcome Team", "Oct 26 · Parking", "Nov 2 · Welcome Team".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FCF9F7. Photography in the layout: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline member portal showing the member's campus, serving shifts, a care request status and a giving statement

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Multi-campus admin — `images/designs/multi-campus-church/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Dashboard" · "All campuses" · "Downtown" · "Northgate" · "Lakeside" · "Attendance" · "3,940" · "Volunteers scheduled" · "286" · "Giving" · "$131,500" · "Care requests" · "18" · "Attendance by campus" · "Open volunteer slots" · "Lakeside · Kids Ministry · 4 open" · "Downtown · Parking · 2 open" · "Northgate · Production · 1 open"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Harborline Church (harborline.example), one church meeting at three campuses: Downtown, Northgate and Lakeside. It is a fictional organization. Palette, used strictly: Plum #3B1F3F (primary, dark sections, sidebar), Warm white #FCF9F7 (page background), Lilac mist #ECE3EE (cards and soft surfaces), Peach #F2A07B (accent, primary buttons only), Graphite #26222A (body text). Typography: headings in a confident geometric sans like Sora, semibold; body in Inter. Mood: contemporary, connected and confident, warm dusk light. UI style: large type, 16px rounded cards, soft shadows, peach pill buttons with graphite text, campus color dots used sparingly.

Screen: Admin dashboard with a row of campus tabs at top (All campuses active). Four KPI tiles, then a grouped bar chart of attendance by campus over six weeks (plum, peach and lilac bars) next to a short table of open volunteer slots.

On-screen text, in reading order: "Dashboard", "All campuses", "Downtown", "Northgate", "Lakeside", "Attendance", "3,940", "Volunteers scheduled", "286", "Giving", "$131,500", "Care requests", "18", "Attendance by campus", "Open volunteer slots", "Lakeside · Kids Ministry · 4 open", "Downtown · Parking · 2 open", "Northgate · Production · 1 open".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FCF9F7. Photography in the layout: three church buildings at dusk (a modern brick building downtown, a glass-fronted building at Northgate, a timber building by a lake), an empty auditorium with soft stage lights. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Harborline admin dashboard with campus tabs, attendance, volunteer and giving totals, attendance by campus and open volunteer slots

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
