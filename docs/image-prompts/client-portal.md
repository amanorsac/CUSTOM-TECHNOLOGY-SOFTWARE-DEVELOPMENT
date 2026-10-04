# Client Portal — image prompts

Design `client-portal` · Software · **Concept** (a fictional organization, never presented as a client).
Tagline: A private login where members, donors or clients find what is theirs.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Kestrel Bookkeeping, a bookkeeping firm with a private portal for its small-business clients
- **Domain, if a URL ever shows:** `kestrel.example`
- **Typography:** headings in Plus Jakarta Sans, semibold; body in Inter
- **Mood:** friendly, trustworthy and tidy
- **UI style:** charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered
- **Imagery:** no photographs; the product UI carries the images
- **Device scenes (cover and hero):** a pale ash desk against a warm white wall, a sunflower-yellow folder and a ceramic cup, soft daylight

| Color | Hex | Use |
|---|---|---|
| Warm white | `#FAFAF7` | page background |
| Charcoal ink | `#22262E` | text and sidebar |
| Sunflower | `#F4C430` | accent, primary buttons |
| Soft sunflower | `#FDF3CF` | tint for highlights and notices |
| Cool gray | `#E6E7EA` | cards, borders and surfaces |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/client-portal/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Good morning, Ruiz Family Bakery" · "2 items need you"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a pale ash desk against a warm white wall, a sunflower-yellow folder and a ceramic cup, soft daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screens: the laptop shows the Kestrel portal home with a charcoal sidebar and three cards; the phone shows the app home with a sunflower card. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Good morning, Ruiz Family Bakery", "2 items need you". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel client portal concept on a laptop and a phone: the portal home and the client app

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/client-portal/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Documents" · "Kim Alvarez" · "Pay $640"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a pale ash desk against a warm white wall, a sunflower-yellow folder and a ceramic cup, soft daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screens: the laptop shows the Kestrel documents page; the phone shows the message thread; the tablet shows the invoices and payment panel. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Documents", "Kim Alvarez", "Pay $640". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel client portal concept: documents on a laptop, messages on a phone and invoices on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Portal home — `images/designs/client-portal/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Kestrel" · "Home" · "Documents" · "Invoices" · "Requests" · "Messages" · "Good morning, Ruiz Family Bakery" · "Documents needed" · "2" · "Open invoice" · "$640" · "Due Oct 31" · "Pay Now" · "From Kim" · "Your September books are closed." · "Recent activity" · "Q3 bank statement uploaded" · "September report ready"

```text
A flat, straight-on UI screenshot of one desktop web app screen, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Charcoal sidebar with the firm name and five links (Home active). Greeting headline with the client business name. Three cards in a row: documents needed (count, soft sunflower tint), open invoice with a sunflower Pay Now button, latest message preview. Below, a short recent-activity list.

On-screen text, in reading order: "Kestrel", "Home", "Documents", "Invoices", "Requests", "Messages", "Good morning, Ruiz Family Bakery", "Documents needed", "2", "Open invoice", "$640", "Due Oct 31", "Pay Now", "From Kim", "Your September books are closed.", "Recent activity", "Q3 bank statement uploaded", "September report ready".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FAFAF7. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel client portal home for Ruiz Family Bakery with documents needed, an open invoice and the latest message

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Documents — `images/designs/client-portal/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Documents" · "2026 Taxes" · "Payroll" · "Bank statements" · "Name" · "Date" · "Status" · "Q3 Bank Statement.pdf" · "Oct 6" · "Received" · "W-9 Form.pdf" · "Oct 2" · "Needs signature" · "September Report.pdf" · "Oct 1" · "Ready" · "Drop files here to upload"

```text
A flat, straight-on UI screenshot of one desktop web app screen, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Documents page. A row of three folder tiles. A file table with name, date and status columns; one row has a sunflower "Needs signature" tag. A dashed drop zone at the bottom.

On-screen text, in reading order: "Documents", "2026 Taxes", "Payroll", "Bank statements", "Name", "Date", "Status", "Q3 Bank Statement.pdf", "Oct 6", "Received", "W-9 Form.pdf", "Oct 2", "Needs signature", "September Report.pdf", "Oct 1", "Ready", "Drop files here to upload".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FAFAF7. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel portal documents page with folders, a file list and an upload area

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Invoices and payment — `images/designs/client-portal/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Invoices" · "INV-3021" · "September bookkeeping" · "$640" · "Due" · "INV-2987" · "August bookkeeping" · "$640" · "Paid" · "Pay invoice" · "Card" · "Bank account" · "Pay $640"

```text
A flat, straight-on UI screenshot of one desktop web app screen, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Invoices table with two rows (one Due, one Paid) and, on the right, an open payment panel with card and bank tabs and a sunflower pay button. Calm and clear.

On-screen text, in reading order: "Invoices", "INV-3021", "September bookkeeping", "$640", "Due", "INV-2987", "August bookkeeping", "$640", "Paid", "Pay invoice", "Card", "Bank account", "Pay $640".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FAFAF7. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel portal invoices with one due and one paid, and a payment panel

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Home — `images/designs/client-portal/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Hi, Elena" · "2 items need you" · "Sign W-9 Form" · "Pay September invoice" · "Upload a Document" · "Home" · "Files" · "Invoices" · "Messages"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Warm white #FAFAF7 with nothing in it. A bottom tab bar in Warm white #FAFAF7 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Greeting. A soft sunflower card saying two items need attention with two rows. A full-width sunflower Upload button. Warm white bottom tab bar, Home active.

On-screen text, in reading order: "Hi, Elena", "2 items need you", "Sign W-9 Form", "Pay September invoice", "Upload a Document", "Home", "Files", "Invoices", "Messages".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. No photographs.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel client app home with two items that need attention and an upload button

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Requests — `images/designs/client-portal/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Requests" · "Payroll change" · "Oct 9" · "In progress" · "1099 question" · "Oct 3" · "Answered" · "New bank account" · "Sep 28" · "Done" · "Home" · "Files" · "Invoices" · "Messages"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Warm white #FAFAF7 with nothing in it. A bottom tab bar in Warm white #FAFAF7 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Requests list with three rows, each with a title, date and a status tag (In progress, Answered, Done). A small plus button at top right. Warm white bottom tab bar, Files active.

On-screen text, in reading order: "Requests", "Payroll change", "Oct 9", "In progress", "1099 question", "Oct 3", "Answered", "New bank account", "Sep 28", "Done", "Home", "Files", "Invoices", "Messages".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. No photographs.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel client app requests list with payroll, 1099 and bank account requests and their status

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Messages — `images/designs/client-portal/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Kim Alvarez" · "KA" · "Bookkeeper" · "Your September books are closed. The report is in Documents." · "Thank you! I will review it tonight." · "Write a message" · "Home" · "Files" · "Invoices" · "Messages"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain Warm white #FAFAF7 with nothing in it. A bottom tab bar in Warm white #FAFAF7 with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: A thread with the bookkeeper: name and initials at top, one incoming gray bubble, one outgoing sunflower bubble, and a composer above the tab bar. Warm white bottom tab bar, Messages active.

On-screen text, in reading order: "Kim Alvarez", "KA", "Bookkeeper", "Your September books are closed. The report is in Documents.", "Thank you! I will review it tonight.", "Write a message", "Home", "Files", "Invoices", "Messages".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. No photographs.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel client app message thread with the bookkeeper about the September report

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Activity history — `images/designs/client-portal/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Activity" · "All" · "Documents" · "Payments" · "Messages" · "This week" · "You uploaded Q3 Bank Statement.pdf" · "Oct 6" · "Kim shared September Report.pdf" · "Oct 1" · "Earlier" · "Payment received: INV-2987" · "Sep 30" · "Request answered: 1099 question" · "Sep 29" · "You signed Engagement Letter.pdf" · "Sep 12"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Activity history page: filter chips at top and a vertical timeline of five events with small icons and dates, grouped under This week and Earlier.

On-screen text, in reading order: "Activity", "All", "Documents", "Payments", "Messages", "This week", "You uploaded Q3 Bank Statement.pdf", "Oct 6", "Kim shared September Report.pdf", "Oct 1", "Earlier", "Payment received: INV-2987", "Sep 30", "Request answered: 1099 question", "Sep 29", "You signed Engagement Letter.pdf", "Sep 12".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FAFAF7. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel portal activity history timeline with uploads, payments and answered requests

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: Staff admin — `images/designs/client-portal/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Clients" · "Review" · "Invoices" · "Requests" · "Clients" · "64" · "Docs to review" · "17" · "Invoices overdue" · "3" · "Open requests" · "12" · "Client" · "Open requests" · "Docs waiting" · "Ruiz Family Bakery" · "2" · "1" · "Northgate Dental" · "0" · "3" · "Lumen Yoga" · "1" · "0"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Kestrel Bookkeeping (kestrel.example), a bookkeeping firm with a private portal for its small-business clients. It is a fictional organization. Palette, used strictly: Warm white #FAFAF7 (page background), Charcoal ink #22262E (text and sidebar), Sunflower #F4C430 (accent, primary buttons), Soft sunflower #FDF3CF (tint for highlights and notices), Cool gray #E6E7EA (cards, borders and surfaces). Typography: headings in Plus Jakarta Sans, semibold; body in Inter. Mood: friendly, trustworthy and tidy. UI style: charcoal sidebar, rounded 12px cards, sunflower buttons with charcoal text, gentle status tags, realistic data, uncluttered.

Screen: Staff-side admin with charcoal sidebar. Four KPI tiles. A client list table with open requests and documents waiting, and a sunflower-tinted row for the one needing attention.

On-screen text, in reading order: "Clients", "Review", "Invoices", "Requests", "Clients", "64", "Docs to review", "17", "Invoices overdue", "3", "Open requests", "12", "Client", "Open requests", "Docs waiting", "Ruiz Family Bakery", "2", "1", "Northgate Dental", "0", "3", "Lumen Yoga", "1", "0".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background Warm white #FAFAF7. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Kestrel staff admin with client, review, invoice and request totals and a client list

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
