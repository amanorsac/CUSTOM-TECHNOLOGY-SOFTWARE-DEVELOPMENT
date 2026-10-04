# Online Academy — image prompts

Design `online-academy` · Education · **Concept** (a fictional organization, never presented as a client).
Tagline: Courses, learners and certificates, built to grow with your audience.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Fieldnote Academy, an online school of short, practical courses for small-business owners
- **Domain, if a URL ever shows:** `fieldnote.example`
- **Typography:** headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono
- **Mood:** modern editorial, clear and focused
- **UI style:** strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations
- **Imagery:** a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Places and objects only, never people
- **Device scenes (cover and hero):** a chalk-white desk, a butter-yellow notebook and a black pen, soft daylight

| Color | Hex | Use |
|---|---|---|
| Chalk | `#F7F5F0` | page background |
| Ink | `#1D1D1F` | primary, text, dark sections |
| Tomato | `#E5483B` | accent, primary buttons, progress |
| Butter | `#F6D776` | second accent, highlights |
| Warm gray | `#DAD5CC` | cards, borders and surfaces |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/online-academy/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Learn a skill this month." · "Continue"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a chalk-white desk, a butter-yellow notebook and a black pen, soft daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screens: the laptop shows the Fieldnote homepage with the big centered headline and three course tiles; the phone shows the app home with a tomato progress bar. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Learn a skill this month.", "Continue". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote Academy concept on a laptop and a phone: the homepage and the learning app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/online-academy/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Product Photography" · "Certificate of Completion" · "My courses"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a chalk-white desk, a butter-yellow notebook and a black pen, soft daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screens: the laptop shows the lesson player with a video and lesson list; the phone shows the certificate screen; the tablet shows the student dashboard with progress rings. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Product Photography", "Certificate of Completion", "My courses". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote Academy concept: lesson player on a laptop, certificate on a phone and the student dashboard on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/online-academy/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Fieldnote" · "Courses" · "How It Works" · "Cohorts" · "Sign In" · "SHORT COURSES · REAL PROJECTS" · "Learn a skill this month." · "Practical courses with a project and a certificate." · "Browse Courses" · "See How It Works" · "Bookkeeping Basics" · "Writing for the Web" · "Product Photography" · "6 LESSONS" · "8 LESSONS" · "5 LESSONS"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Stacked center layout on chalk: a short mono label, a big two-line headline, one line of copy and two buttons centered. Below, three course tiles in a row with flat-lay photos, titles and mono lesson counts.

On-screen text, in reading order: "Fieldnote", "Courses", "How It Works", "Cohorts", "Sign In", "SHORT COURSES · REAL PROJECTS", "Learn a skill this month.", "Practical courses with a project and a certificate.", "Browse Courses", "See How It Works", "Bookkeeping Basics", "Writing for the Web", "Product Photography", "6 LESSONS", "8 LESSONS", "5 LESSONS".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Chalk #F7F5F0. Photography in the layout: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote Academy homepage with the headline "Learn a skill this month." and three course tiles

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Course catalog — `images/designs/online-academy/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Courses" · "Topic" · "Business" · "Writing" · "Photography" · "Length" · "Bookkeeping Basics" · "6 LESSONS · 2H 40M" · "Writing for the Web" · "8 LESSONS · 3H 10M" · "Product Photography" · "5 LESSONS · 2H 05M" · "Email That Gets Read" · "4 LESSONS · 1H 30M" · "Beginner"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Catalog with a slim filter column at left (topic checkboxes, length) and a two-by-two grid of course cards at right, each with a photo, title, mono lesson count and duration, and a small butter "Beginner" tag.

On-screen text, in reading order: "Courses", "Topic", "Business", "Writing", "Photography", "Length", "Bookkeeping Basics", "6 LESSONS · 2H 40M", "Writing for the Web", "8 LESSONS · 3H 10M", "Product Photography", "5 LESSONS · 2H 05M", "Email That Gets Read", "4 LESSONS · 1H 30M", "Beginner".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Chalk #F7F5F0. Photography in the layout: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote course catalog with topic filters and four course cards

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Lesson player — `images/designs/online-academy/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Product Photography" · "40% complete" · "1" · "Light you already have" · "2" · "Backdrops on a budget" · "3" · "Shooting on your phone" · "4" · "Editing in ten minutes" · "5" · "Your final project" · "Mark Complete"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Course page. A large 16:9 video player on the left showing a still of a small product photo set with a play button. A lesson list on the right with ticks on finished lessons and the current one highlighted in tomato. A thin progress bar with percentage above the list.

On-screen text, in reading order: "Product Photography", "40% complete", "1", "Light you already have", "2", "Backdrops on a budget", "3", "Shooting on your phone", "4", "Editing in ten minutes", "5", "Your final project", "Mark Complete".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Chalk #F7F5F0. Photography in the layout: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote lesson player with a video and the five-lesson list of the Product Photography course, 40% complete

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: My learning — `images/designs/online-academy/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Welcome back, Priya" · "Continue" · "Product Photography" · "Lesson 3 of 5" · "Resume" · "Live cohort session" · "Thu 7:00 PM" · "Learn" · "Browse" · "Cohort" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Chalk #F7F5F0 with nothing in it. A bottom tab bar in Chalk #F7F5F0 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Greeting. A "Continue" card with a photo, course name, lesson count and a tomato progress bar. A live cohort session card with a butter highlight. Chalk bottom tab bar with ink icons, Learn active in tomato.

On-screen text, in reading order: "Welcome back, Priya", "Continue", "Product Photography", "Lesson 3 of 5", "Resume", "Live cohort session", "Thu 7:00 PM", "Learn", "Browse", "Cohort", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote app home with a course to continue and the next live cohort session

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Quiz — `images/designs/online-academy/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "QUESTION 2 OF 5" · "What makes a photo look sharp?" · "A steady camera" · "More filters" · "A smaller file" · "Higher contrast" · "Check Answer"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Chalk #F7F5F0 with nothing in it. There is no tab bar; the bottom 5% of the canvas is plain Chalk #F7F5F0. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Quiz screen with a mono progress label, a short question in large type and four answer rows; the first is selected with a tomato border and dot. A full-width ink button at the bottom. No tab bar; the bottom 5% is plain chalk.

On-screen text, in reading order: "QUESTION 2 OF 5", "What makes a photo look sharp?", "A steady camera", "More filters", "A smaller file", "Higher contrast", "Check Answer".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote app quiz question "What makes a photo look sharp?" with four answers

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Certificate — `images/designs/online-academy/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "COURSE COMPLETE" · "Certificate of Completion" · "Priya Shah" · "Product Photography" · "October 2026" · "Share" · "Download PDF" · "Learn" · "Browse" · "Cohort" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Chalk #F7F5F0 with nothing in it. A bottom tab bar in Chalk #F7F5F0 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Celebration without confetti clutter: a mono label, a certificate card with thin ink border and a small butter seal, the learner name and course, then two buttons. Chalk bottom tab bar, Profile active.

On-screen text, in reading order: "COURSE COMPLETE", "Certificate of Completion", "Priya Shah", "Product Photography", "October 2026", "Share", "Download PDF", "Learn", "Browse", "Cohort", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote app certificate of completion for Priya Shah in Product Photography

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Student dashboard — `images/designs/online-academy/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Fieldnote" · "My courses" · "Product Photography" · "60%" · "Writing for the Web" · "25%" · "Bookkeeping Basics" · "100%" · "Your cohort" · "Fall Photography Cohort" · "Session 4 · Thu 7:00 PM" · "Certificates" · "2 earned" · "View All"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Signed-in dashboard. Ink top bar with the wordmark. Three course cards with tomato progress rings, a cohort card with the next session, and a certificates card.

On-screen text, in reading order: "Fieldnote", "My courses", "Product Photography", "60%", "Writing for the Web", "25%", "Bookkeeping Basics", "100%", "Your cohort", "Fall Photography Cohort", "Session 4 · Thu 7:00 PM", "Certificates", "2 earned", "View All".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Chalk #F7F5F0. Photography in the layout: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote student dashboard with course progress, the next cohort session and certificates

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Academy admin — `images/designs/online-academy/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Overview" · "Courses" · "Learners" · "Cohorts" · "Payments" · "Active learners" · "2,418" · "Completions" · "316" · "Revenue this month" · "$18,940" · "Avg. quiz score" · "87%" · "Enrollments" · "Top courses" · "Product Photography" · "74% complete" · "Bookkeeping Basics" · "68% complete" · "Writing for the Web" · "61% complete"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fieldnote Academy (fieldnote.example), an online school of short, practical courses for small-business owners. It is a fictional organization. Palette, used strictly: Chalk #F7F5F0 (page background), Ink #1D1D1F (primary, text, dark sections), Tomato #E5483B (accent, primary buttons, progress), Butter #F6D776 (second accent, highlights), Warm gray #DAD5CC (cards, borders and surfaces). Typography: headings in a tight Swiss grotesk like Inter Tight, bold; small labels in a mono like IBM Plex Mono. Mood: modern editorial, clear and focused. UI style: strict grid, hairline borders, 8px corners, tomato buttons with white text, mono labels for lesson counts and durations.

Screen: Admin with ink sidebar. Four KPI tiles. A tomato line chart of enrollments over six months and a table of top courses with completion rates.

On-screen text, in reading order: "Overview", "Courses", "Learners", "Cohorts", "Payments", "Active learners", "2,418", "Completions", "316", "Revenue this month", "$18,940", "Avg. quiz score", "87%", "Enrollments", "Top courses", "Product Photography", "74% complete", "Bookkeeping Basics", "68% complete", "Writing for the Web", "61% complete".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Chalk #F7F5F0. Photography in the layout: a flat-lay desk with a notebook, a camera and a coffee cup, a small product photography set with a backdrop and lamp, a laptop with a spreadsheet seen from above. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fieldnote admin with learner, completion, revenue and quiz totals, an enrollment chart and top courses

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
