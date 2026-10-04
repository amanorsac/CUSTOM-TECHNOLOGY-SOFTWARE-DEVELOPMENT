# Booking System — image prompts

Design `booking-system` · Software · **Concept** (a fictional organization, never presented as a client).
Tagline: Appointments and sign-ups for clinics, studios and volunteer teams.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Wellspring Physio & Pilates, a physiotherapy clinic and Pilates studio taking online bookings
- **Domain, if a URL ever shows:** `wellspring.example`
- **Typography:** headings in a rounded geometric sans like Outfit; body in Inter
- **Mood:** bright, restorative and organized
- **UI style:** airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered
- **Imagery:** Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Places and objects only, never people
- **Device scenes (cover and hero):** a cream desk against a warm white wall, a rolled blush-pink exercise mat and a glass of water, bright soft daylight

| Color | Hex | Use |
|---|---|---|
| Cream white | `#FFFDF8` | page background |
| Ink | `#1E1A22` | text and dark UI |
| Magenta | `#C2366F` | primary and accent, buttons, selected slots |
| Blush | `#F9E1EA` | tint for highlights |
| Warm gray | `#E9E4DF` | cards, borders and surfaces |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/booking-system/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Book a session" · "Upcoming"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a cream desk against a warm white wall, a rolled blush-pink exercise mat and a glass of water, bright soft daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screens: the laptop shows the Wellspring booking page with a week of time chips, one selected in magenta; the phone shows the app upcoming-class card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Book a session", "Upcoming". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring booking system concept on a laptop and a phone: the booking page and the client app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/booking-system/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Class schedule" · "You're booked!" · "Bookings today"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a cream desk against a warm white wall, a rolled blush-pink exercise mat and a glass of water, bright soft daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screens: the laptop shows the class schedule; the phone shows the "You're booked!" confirmation; the tablet shows the staff and room scheduler. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Class schedule", "You're booked!", "Bookings today". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring booking system concept: class schedule on a laptop, confirmation on a phone and the scheduler on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Book a session — `images/designs/booking-system/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Wellspring" · "Book a session" · "Physiotherapy" · "Reformer Pilates" · "Massage" · "Initial Assessment" · "60 min" · "Follow-up Visit" · "30 min" · "Any therapist" · "Mon 13" · "Tue 14" · "Wed 15" · "Thu 16" · "Fri 17" · "8:00" · "9:30" · "11:00" · "2:30" · "Continue"

```text
A flat, straight-on UI screenshot of one desktop booking page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Booking page. Service category tabs at top. Left: a service list with durations, one selected in blush. Right: a week view with live availability as time chips, one selected in magenta, and a staff dropdown. Summary bar with a magenta Continue button at the bottom right.

On-screen text, in reading order: "Wellspring", "Book a session", "Physiotherapy", "Reformer Pilates", "Massage", "Initial Assessment", "60 min", "Follow-up Visit", "30 min", "Any therapist", "Mon 13", "Tue 14", "Wed 15", "Thu 16", "Fri 17", "8:00", "9:30", "11:00", "2:30", "Continue".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream white #FFFDF8. Photography in the layout: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring booking page with physiotherapy services and a week of live availability

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Class schedule — `images/designs/booking-system/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Class schedule" · "Week of Oct 13" · "Mon" · "Tue" · "Wed" · "Thu" · "Fri" · "Reformer Foundations" · "7:00 AM" · "3 spots left" · "Mat Flow" · "12:15 PM" · "Full" · "Join Waitlist" · "Reformer Strength" · "6:00 PM" · "5 spots left"

```text
A flat, straight-on UI screenshot of one desktop booking page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Weekly class schedule grid with days across the top. Class blocks show name, time and spots left; one full class shows a Join Waitlist outline button. A sunlit reformer studio photo banner at top.

On-screen text, in reading order: "Class schedule", "Week of Oct 13", "Mon", "Tue", "Wed", "Thu", "Fri", "Reformer Foundations", "7:00 AM", "3 spots left", "Mat Flow", "12:15 PM", "Full", "Join Waitlist", "Reformer Strength", "6:00 PM", "5 spots left".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream white #FFFDF8. Photography in the layout: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring weekly class schedule with spots left and a waitlist option

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Confirm and pay deposit — `images/designs/booking-system/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Confirm booking" · "Initial Physio Assessment" · "60 min" · "Thu, Oct 16 · 9:30 AM" · "Sam Rivera" · "SR" · "Deposit due today" · "$30" · "Card number" · "Pay Deposit & Book" · "Add to calendar"

```text
A flat, straight-on UI screenshot of one desktop booking page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Checkout page. Left: booking summary card with service, date, time and therapist with initials avatar. Right: deposit card with card fields and a magenta button, and an Add to calendar link.

On-screen text, in reading order: "Confirm booking", "Initial Physio Assessment", "60 min", "Thu, Oct 16 · 9:30 AM", "Sam Rivera", "SR", "Deposit due today", "$30", "Card number", "Pay Deposit & Book", "Add to calendar".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream white #FFFDF8. Photography in the layout: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring booking confirmation with the appointment summary and a $30 deposit

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Upcoming — `images/designs/booking-system/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Upcoming" · "Reformer Foundations" · "Tue 7:00 AM · Studio B" · "Add to Calendar" · "Cancel" · "Book again" · "Follow-up Visit" · "Mat Flow" · "Home" · "Book" · "Bookings" · "Account"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Cream white #FFFDF8 with nothing in it. A bottom tab bar in Cream white #FFFDF8 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Title. A large card for the next class with a sunlit studio photo, time and studio, and two buttons. A "Book again" list with two rows. Cream bottom tab bar with magenta active icon.

On-screen text, in reading order: "Upcoming", "Reformer Foundations", "Tue 7:00 AM · Studio B", "Add to Calendar", "Cancel", "Book again", "Follow-up Visit", "Mat Flow", "Home", "Book", "Bookings", "Account".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring app upcoming booking for Reformer Foundations with options to add to calendar or cancel

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Pick a time — `images/designs/booking-system/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Follow-up Visit" · "30 min · Sam Rivera" · "Wed 15" · "Thu 16" · "Fri 17" · "8:00" · "8:30" · "9:30" · "10:00" · "1:30" · "4:00" · "Book 9:30 AM" · "Home" · "Book" · "Bookings" · "Account"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Cream white #FFFDF8 with nothing in it. A bottom tab bar in Cream white #FFFDF8 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Service title. A date strip with one date selected in magenta. A grid of time chips, two grayed out, one selected. Full-width magenta button. Cream bottom tab bar, Book active.

On-screen text, in reading order: "Follow-up Visit", "30 min · Sam Rivera", "Wed 15", "Thu 16", "Fri 17", "8:00", "8:30", "9:30", "10:00", "1:30", "4:00", "Book 9:30 AM", "Home", "Book", "Bookings", "Account".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring app time picker with a 9:30 AM slot selected

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Booked — `images/designs/booking-system/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "You're booked!" · "Follow-up Visit" · "Thu, Oct 16 · 9:30 AM" · "We'll text you a reminder 24 hours before." · "View Booking" · "Home" · "Book" · "Bookings" · "Account"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Cream white #FFFDF8 with nothing in it. A bottom tab bar in Cream white #FFFDF8 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Confirmation screen: a large magenta circle with a white check, a short headline, the booking details and a reminder line, and an outline button. Cream bottom tab bar, Bookings active.

On-screen text, in reading order: "You're booked!", "Follow-up Visit", "Thu, Oct 16 · 9:30 AM", "We'll text you a reminder 24 hours before.", "View Booking", "Home", "Book", "Bookings", "Account".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring app booking confirmation with a text reminder note

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Client portal — `images/designs/booking-system/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Wellspring" · "My bookings" · "Packages" · "Invoices" · "Profile" · "My bookings" · "Thu, Oct 16 · 9:30 AM" · "Follow-up Visit" · "Tue, Oct 21 · 7:00 AM" · "Reformer Foundations" · "Reformer 10-pack" · "6 classes left" · "Invoices" · "Oct 2 · Paid" · "Sep 18 · Paid"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Client portal with an ink sidebar. Upcoming bookings list, a class pack card with a blush progress bar, and an invoices list.

On-screen text, in reading order: "Wellspring", "My bookings", "Packages", "Invoices", "Profile", "My bookings", "Thu, Oct 16 · 9:30 AM", "Follow-up Visit", "Tue, Oct 21 · 7:00 AM", "Reformer Foundations", "Reformer 10-pack", "6 classes left", "Invoices", "Oct 2 · Paid", "Sep 18 · Paid".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream white #FFFDF8. Photography in the layout: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring client portal with upcoming bookings, a class pack and paid invoices

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Staff and room scheduler — `images/designs/booking-system/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Schedule" · "Thu, Oct 16" · "Bookings today" · "48" · "Utilization" · "82%" · "No-shows" · "2" · "Waitlist" · "9" · "Sam Rivera" · "Jo Park" · "Studio A" · "Studio B" · "8 AM" · "9 AM" · "10 AM" · "11 AM" · "Initial Assessment" · "Reformer Foundations" · "Follow-up Visit"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Wellspring Physio & Pilates (wellspring.example), a physiotherapy clinic and Pilates studio taking online bookings. It is a fictional organization. Palette, used strictly: Cream white #FFFDF8 (page background), Ink #1E1A22 (text and dark UI), Magenta #C2366F (primary and accent, buttons, selected slots), Blush #F9E1EA (tint for highlights), Warm gray #E9E4DF (cards, borders and surfaces). Typography: headings in a rounded geometric sans like Outfit; body in Inter. Mood: bright, restorative and organized. UI style: airy layout, 14px rounded cards, magenta buttons with white text, blush selected states, clear availability, uncluttered.

Screen: Day-view scheduler: four resource columns (two therapists, two studios) with booking blocks in magenta and blush tints, a time column on the left, and four KPI tiles above.

On-screen text, in reading order: "Schedule", "Thu, Oct 16", "Bookings today", "48", "Utilization", "82%", "No-shows", "2", "Waitlist", "9", "Sam Rivera", "Jo Park", "Studio A", "Studio B", "8 AM", "9 AM", "10 AM", "11 AM", "Initial Assessment", "Reformer Foundations", "Follow-up Visit".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Cream white #FFFDF8. Photography in the layout: Pilates reformer machines in a sunlit studio, a calm treatment room with a padded table, rolled mats on a shelf. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Wellspring staff and room scheduler with booking totals and a day view across therapists and studios

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
