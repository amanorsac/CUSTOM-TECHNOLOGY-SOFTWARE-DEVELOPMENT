# Music School — image prompts

Design `music-school` · Education · **Concept** (a fictional organization, never presented as a client).
Tagline: Lessons, teachers and recitals, scheduled and paid for in one place.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Fermata Music School, a music school offering piano, strings, voice and guitar lessons
- **Domain, if a URL ever shows:** `fermata.example`
- **Typography:** headings in a high-contrast serif like Playfair Display; body in Inter
- **Mood:** warm, artistic and refined, lamplight
- **UI style:** elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif
- **Imagery:** a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Places and objects only, never people
- **Device scenes (cover and hero):** a cream lacquered desk against a deep teal wall, a brass metronome and a few loose sheets of music, warm lamplight

| Color | Hex | Use |
|---|---|---|
| Midnight teal | `#0F3B3E` | primary, dark sections, sidebar |
| Cream | `#FFF8EC` | page background |
| Brass | `#D9A441` | accent, primary buttons |
| Coral | `#E86F51` | second accent, small highlights only |
| Charcoal | `#1B1F20` | body text |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/music-school/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Lessons that make music last." · "Next lesson"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a cream lacquered desk against a deep teal wall, a brass metronome and a few loose sheets of music, warm lamplight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screens: the laptop shows the Fermata homepage with the grand piano photo and serif headline; the phone shows the student app home with a teal next-lesson card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Lessons that make music last.", "Next lesson". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata Music School concept on a laptop and a phone: the homepage and the student app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/music-school/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Lessons that make music last." · "18:42" · "Week of Oct 13"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a cream lacquered desk against a deep teal wall, a brass metronome and a few loose sheets of music, warm lamplight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screens: the laptop shows the Fermata homepage; the phone shows the practice timer; the tablet shows the teacher schedule admin. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Lessons that make music last.", "18:42", "Week of Oct 13". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata Music School concept: website on a laptop, practice timer on a phone and the teacher schedule on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/music-school/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Fermata" · "Lessons" · "Teachers" · "Recitals" · "Student Login" · "Lessons that make music last." · "Piano · Strings · Voice · Guitar — ages 5 to adult" · "Book a Trial Lesson"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Bottom-left text over a full-bleed, low-key photo of a grand piano with sheet music under warm light, with a midnight-teal fade at left. Large serif headline, one line, one brass button. Slim nav on the photo.

On-screen text, in reading order: "Fermata", "Lessons", "Teachers", "Recitals", "Student Login", "Lessons that make music last.", "Piano · Strings · Voice · Guitar — ages 5 to adult", "Book a Trial Lesson".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream #FFF8EC. Photography in the layout: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata Music School homepage: a grand piano photo behind the headline "Lessons that make music last." and a Book a Trial Lesson button

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Meet our teachers — `images/designs/music-school/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Meet our teachers" · "CW" · "Clara Weiss" · "Piano" · "MB" · "Marcus Bell" · "Guitar" · "IM" · "Ines Moreau" · "Violin" · "DO" · "David Oyelaran" · "Voice" · "View Schedules"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Cream page. Serif title. Four teacher cards in a row; each has a round monogram in teal with brass initials (no faces), an instrument line icon, the name and instrument. One brass button under the grid.

On-screen text, in reading order: "Meet our teachers", "CW", "Clara Weiss", "Piano", "MB", "Marcus Bell", "Guitar", "IM", "Ines Moreau", "Violin", "DO", "David Oyelaran", "Voice", "View Schedules".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream #FFF8EC. Photography in the layout: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata teachers page with profile cards for piano, guitar, violin and voice teachers

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Lesson booking — `images/designs/music-school/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Book a lesson" · "Instrument" · "Teacher" · "Time" · "Piano" · "Clara Weiss" · "Mon" · "Tue" · "Wed" · "Thu" · "Fri" · "3:30 PM" · "4:30 PM" · "5:30 PM" · "Tue 4:30 PM · 30 min · weekly" · "Reserve Weekly Slot"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Booking page. A three-step indicator at top. Left column: instrument and teacher selections. Right: a weekly grid Monday to Friday with time slots as soft cream chips, one selected in brass. A summary line and brass button at bottom right.

On-screen text, in reading order: "Book a lesson", "Instrument", "Teacher", "Time", "Piano", "Clara Weiss", "Mon", "Tue", "Wed", "Thu", "Fri", "3:30 PM", "4:30 PM", "5:30 PM", "Tue 4:30 PM · 30 min · weekly", "Reserve Weekly Slot".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream #FFF8EC. Photography in the layout: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata lesson booking page with piano and teacher chosen and a weekly time slot selected

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Student home — `images/designs/music-school/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Hi, Noah" · "Next lesson" · "Piano with Clara" · "Tue 4:30 PM" · "Practice streak" · "5 days" · "This week" · "Minuet in G" · "Home" · "Schedule" · "Practice" · "Pay" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Cream #FFF8EC with nothing in it. A bottom tab bar in Midnight teal #0F3B3E sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Serif greeting. A midnight-teal card for the next lesson with a brass detail. A practice-streak card with a row of five small filled coral dots. A "This week" piece card. Teal bottom tab bar, Home active in brass.

On-screen text, in reading order: "Hi, Noah", "Next lesson", "Piano with Clara", "Tue 4:30 PM", "Practice streak", "5 days", "This week", "Minuet in G", "Home", "Schedule", "Practice", "Pay", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata student app home with the next piano lesson, a five-day practice streak and this week's piece

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Practice timer — `images/designs/music-school/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Practice" · "18:42" · "Minuet in G" · "J.S. Bach" · "Finish Session" · "This week" · "Home" · "Schedule" · "Practice" · "Pay" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Cream #FFF8EC with nothing in it. A bottom tab bar in Midnight teal #0F3B3E sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Calm, centered. A large timer in serif numerals inside a thin brass ring. The piece name and composer below. A brass Finish Session button. A tiny bar chart of this week's practice at the bottom. Teal bottom tab bar, Practice active.

On-screen text, in reading order: "Practice", "18:42", "Minuet in G", "J.S. Bach", "Finish Session", "This week", "Home", "Schedule", "Practice", "Pay", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata app practice timer at 18:42 for Minuet in G with a Finish Session button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Recital sign-up — `images/designs/music-school/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Winter Recital" · "Sat, Dec 13 · 2:00 PM" · "Fermata Hall" · "Your piece" · "Minuet in G" · "Sign Up" · "Home" · "Schedule" · "Practice" · "Pay" · "Me"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Cream #FFF8EC with nothing in it. A bottom tab bar in Midnight teal #0F3B3E sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: A wide photo of an empty recital hall stage with a piano at top in a rounded frame. Event title, date, time and place. A piece field and a brass Sign Up button. Teal bottom tab bar, Schedule active.

On-screen text, in reading order: "Winter Recital", "Sat, Dec 13 · 2:00 PM", "Fermata Hall", "Your piece", "Minuet in G", "Sign Up", "Home", "Schedule", "Practice", "Pay", "Me".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata app recital sign-up for the Winter Recital with a piece field and a Sign Up button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Student portal — `images/designs/music-school/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Fermata" · "Home" · "Lessons" · "Practice" · "Payments" · "Resources" · "Welcome, Noah" · "Upcoming lessons" · "Tue, Oct 14 · 4:30 PM" · "Tue, Oct 21 · 4:30 PM" · "Assignments" · "G major scale, hands together" · "Minuet in G, bars 1–16" · "Payments" · "October" · "Paid" · "Resources" · "Theory worksheet 4 (PDF)" · "Recital checklist (PDF)"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Teal left sidebar. Main area on cream: greeting, then a row of three cards (upcoming lessons list, this week's assignments with checkboxes, payments with a "Paid" label), and a resources list with two downloadable PDFs.

On-screen text, in reading order: "Fermata", "Home", "Lessons", "Practice", "Payments", "Resources", "Welcome, Noah", "Upcoming lessons", "Tue, Oct 14 · 4:30 PM", "Tue, Oct 21 · 4:30 PM", "Assignments", "G major scale, hands together", "Minuet in G, bars 1–16", "Payments", "October", "Paid", "Resources", "Theory worksheet 4 (PDF)", "Recital checklist (PDF)".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream #FFF8EC. Photography in the layout: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata student portal with upcoming lessons, practice assignments, payment status and resources

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Teacher schedule admin — `images/designs/music-school/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Schedule" · "Active students" · "186" · "Lessons this week" · "312" · "Recital sign-ups" · "41" · "Open slots" · "27" · "Week of Oct 13" · "Clara Weiss" · "Marcus Bell" · "Ines Moreau" · "David Oyelaran" · "Mon" · "Tue" · "Wed" · "Thu" · "Fri"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Fermata Music School (fermata.example), a music school offering piano, strings, voice and guitar lessons. It is a fictional organization. Palette, used strictly: Midnight teal #0F3B3E (primary, dark sections, sidebar), Cream #FFF8EC (page background), Brass #D9A441 (accent, primary buttons), Coral #E86F51 (second accent, small highlights only), Charcoal #1B1F20 (body text). Typography: headings in a high-contrast serif like Playfair Display; body in Inter. Mood: warm, artistic and refined, lamplight. UI style: elegant serif headlines, 14px corners, brass buttons with charcoal text, thin music-staff lines as a subtle divider motif.

Screen: Admin with teal sidebar. Four KPI tiles. A week calendar with teacher rows and lesson blocks color-coded in teal, brass and coral tints, clean and readable, not crowded.

On-screen text, in reading order: "Schedule", "Active students", "186", "Lessons this week", "312", "Recital sign-ups", "41", "Open slots", "27", "Week of Oct 13", "Clara Weiss", "Marcus Bell", "Ines Moreau", "David Oyelaran", "Mon", "Tue", "Wed", "Thu", "Fri".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream #FFF8EC. Photography in the layout: a grand piano close-up with sheet music, a violin resting on a velvet chair, a practice room with a warm lamp, a brass metronome. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Fermata admin with student, lesson, recital and open slot totals and a weekly teacher schedule

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
