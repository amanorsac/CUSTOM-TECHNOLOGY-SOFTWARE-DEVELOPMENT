# Consulting Firm — image prompts

Design `consulting-firm` · Business · **Concept** (a fictional organization, never presented as a client).
Tagline: A clear public face and a private portal where your clients see progress.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Halvorsen Reed Advisory, an operations and strategy consulting firm
- **Domain, if a URL ever shows:** `halvorsenreed.example`
- **Typography:** headings in a refined editorial serif like Newsreader; body in Inter
- **Mood:** quiet authority, precise and premium
- **UI style:** restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large
- **Imagery:** architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Places and objects only, never people
- **Device scenes (cover and hero):** a white marble desk against a navy wall, a navy leather notebook and a fountain pen, cool morning light

| Color | Hex | Use |
|---|---|---|
| Navy | `#14233C` | primary, dark sections, sidebar |
| Porcelain | `#F4F2EE` | page background |
| Champagne | `#C9B48A` | accent, buttons and rules |
| Slate | `#5F6B7A` | secondary text |
| Ink | `#0B111C` | body text |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/consulting-firm/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Clear decisions. Measurable results." · "62%"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a white marble desk against a navy wall, a navy leather notebook and a fountain pen, cool morning light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screens: the laptop shows the Halvorsen Reed homepage with the architectural photo and serif headline on navy; the phone shows the client app with a navy progress card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Clear decisions. Measurable results.", "62%". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed Advisory concept on a laptop and a phone: the homepage and the client app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/consulting-firm/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Clear decisions. Measurable results." · "Operations Review" · "Workshop · Oct 24"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a white marble desk against a navy wall, a navy leather notebook and a fountain pen, cool morning light. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screens: the laptop shows the Halvorsen Reed homepage; the phone shows the client app project overview; the tablet shows the client portal timeline. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Clear decisions. Measurable results.", "Operations Review", "Workshop · Oct 24". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed Advisory concept: website on a laptop, client app on a phone and the client portal on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Homepage hero — `images/designs/consulting-firm/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Halvorsen Reed" · "Services" · "Case Studies" · "Insights" · "About" · "Client Login" · "Clear decisions. Measurable results." · "Operations and strategy advisory for growing firms." · "Book a Consultation" · "View Case Studies"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: Right-third caption, left-two-thirds image: a tall architectural photo of a modern building facade at dawn fills the left; on the right, on navy, a serif headline, one line and two buttons. Slim porcelain nav bar on top.

On-screen text, in reading order: "Halvorsen Reed", "Services", "Case Studies", "Insights", "About", "Client Login", "Clear decisions. Measurable results.", "Operations and strategy advisory for growing firms.", "Book a Consultation", "View Case Studies".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Porcelain #F4F2EE. Photography in the layout: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed Advisory homepage with an architectural photo and the headline "Clear decisions. Measurable results."

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Case studies — `images/designs/consulting-firm/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Case studies" · "Regional logistics firm" · "31%" · "fewer late orders" · "Healthcare group" · "6 → 1" · "intake systems unified" · "Manufacturer" · "18%" · "less overtime" · "Read case study →"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: Porcelain page. Serif title. Three case study cards in a row, each with an architectural photo crop, the client type, one large result number in navy serif, a one-line result and a "Read case study" link with arrow.

On-screen text, in reading order: "Case studies", "Regional logistics firm", "31%", "fewer late orders", "Healthcare group", "6 → 1", "intake systems unified", "Manufacturer", "18%", "less overtime", "Read case study →".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Porcelain #F4F2EE. Photography in the layout: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed case studies with results for a logistics firm, a healthcare group and a manufacturer

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Book a consultation — `images/designs/consulting-firm/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Book a consultation" · "A 30-minute video call with a partner." · "Topic" · "Operations review" · "October 2026" · "9:00 AM" · "10:00 AM" · "2:30 PM" · "Wed, Oct 22 · 10:00 AM" · "Confirm Booking"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: Booking page. Left: serif headline, short copy and a topic dropdown. Right: a calendar with one date selected in navy and a list of time slots, one selected. Champagne confirm button, small note under it.

On-screen text, in reading order: "Book a consultation", "A 30-minute video call with a partner.", "Topic", "Operations review", "October 2026", "9:00 AM", "10:00 AM", "2:30 PM", "Wed, Oct 22 · 10:00 AM", "Confirm Booking".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Porcelain #F4F2EE. Photography in the layout: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed consultation booking page with a topic, a calendar date and a time selected

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Client project overview — `images/designs/consulting-firm/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Client Portal" · "Operations Review" · "Phase 2" · "62%" · "complete" · "Next milestone" · "Workshop · Oct 24" · "Overview" · "Documents" · "Messages" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Porcelain #F4F2EE with nothing in it. A bottom tab bar in Porcelain #F4F2EE with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: Client app. Project name in serif. A navy card with a large progress percentage and a thin champagne progress bar. A next-milestone row. Porcelain bottom tab bar, Overview active in navy.

On-screen text, in reading order: "Client Portal", "Operations Review", "Phase 2", "62%", "complete", "Next milestone", "Workshop · Oct 24", "Overview", "Documents", "Messages", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed client app showing the Operations Review project 62% complete and the next workshop

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Documents — `images/designs/consulting-firm/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Documents" · "Upload" · "Discovery Report.pdf" · "Oct 3" · "Process Map v2.pdf" · "Oct 10" · "Phase 3 Proposal.pdf" · "Awaiting signature" · "Overview" · "Documents" · "Messages" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Porcelain #F4F2EE with nothing in it. A bottom tab bar in Porcelain #F4F2EE with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: List of three documents with file icons, names and dates; the third has a champagne "Awaiting signature" tag. An Upload button at top right. Porcelain bottom tab bar, Documents active.

On-screen text, in reading order: "Documents", "Upload", "Discovery Report.pdf", "Oct 3", "Process Map v2.pdf", "Oct 10", "Phase 3 Proposal.pdf", "Awaiting signature", "Overview", "Documents", "Messages", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed client app documents list with a proposal awaiting signature

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Messages — `images/designs/consulting-firm/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Elena Halvorsen" · "EH" · "The draft process map is ready for your review." · "Thanks. We will review it by Thursday." · "Write a message" · "Overview" · "Documents" · "Messages" · "Profile"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Porcelain #F4F2EE with nothing in it. A bottom tab bar in Porcelain #F4F2EE with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: A message thread with the consultant: name and initials avatar at top, one incoming navy bubble and one outgoing champagne bubble, and a composer at the bottom above the tab bar. Porcelain bottom tab bar, Messages active.

On-screen text, in reading order: "Elena Halvorsen", "EH", "The draft process map is ready for your review.", "Thanks. We will review it by Thursday.", "Write a message", "Overview", "Documents", "Messages", "Profile".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. Any photos: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed client app message thread about the draft process map

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Client portal — `images/designs/consulting-firm/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Halvorsen Reed" · "Overview" · "Timeline" · "Documents" · "Invoices" · "Messages" · "Operations Review" · "Discovery" · "Analysis" · "Workshop · Oct 24" · "Recommendations · Nov 7" · "Recent documents" · "Process Map v2.pdf" · "Discovery Report.pdf" · "Invoices" · "INV-1042" · "Paid"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: Navy sidebar. A project timeline across the top with four milestones (two done with ticks, one current, one upcoming). Below, two columns: recent documents and invoices with a "Paid" label.

On-screen text, in reading order: "Halvorsen Reed", "Overview", "Timeline", "Documents", "Invoices", "Messages", "Operations Review", "Discovery", "Analysis", "Workshop · Oct 24", "Recommendations · Nov 7", "Recent documents", "Process Map v2.pdf", "Discovery Report.pdf", "Invoices", "INV-1042", "Paid".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Porcelain #F4F2EE. Photography in the layout: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed client portal with a project timeline, recent documents and invoices

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Lead tracking — `images/designs/consulting-firm/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Pipeline" · "New leads" · "24" · "Proposals out" · "7" · "Win rate" · "38%" · "Active projects" · "11" · "New" · "Qualified" · "Proposal" · "Won" · "Brookfield Foods" · "$42,000" · "Carver Health" · "$65,000" · "Linden Freight" · "$38,500" · "Ostrander Labs" · "$54,000"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Halvorsen Reed Advisory (halvorsenreed.example), an operations and strategy consulting firm. It is a fictional organization. Palette, used strictly: Navy #14233C (primary, dark sections, sidebar), Porcelain #F4F2EE (page background), Champagne #C9B48A (accent, buttons and rules), Slate #5F6B7A (secondary text), Ink #0B111C (body text). Typography: headings in a refined editorial serif like Newsreader; body in Inter. Mood: quiet authority, precise and premium. UI style: restrained, lots of white space, 8px corners, hairline rules, champagne buttons with navy text, numbers set large.

Screen: Admin with navy sidebar. Four KPI tiles. A four-column pipeline board; each column holds one clean card with a company and value, in the order listed.

On-screen text, in reading order: "Pipeline", "New leads", "24", "Proposals out", "7", "Win rate", "38%", "Active projects", "11", "New", "Qualified", "Proposal", "Won", "Brookfield Foods", "$42,000", "Carver Health", "$65,000", "Linden Freight", "$38,500", "Ostrander Labs", "$54,000".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Porcelain #F4F2EE. Photography in the layout: architectural details of a modern office building, an empty boardroom table in morning light, a city skyline at dawn. Any photos inside the layout show places and objects only: no people, no faces, no hands.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Halvorsen Reed lead tracking with pipeline totals and a four-stage board of opportunities

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
