# Custom CRM — image prompts

Design `custom-crm` · Software · **Concept** (a fictional organization, never presented as a client).
Tagline: A CRM shaped to how your sales team works, from first call to signed deal.

Read [README.md](README.md) first for the Higgsfield workflow, sizes and regeneration rules.

## Design world

Every prompt below repeats this block, so all 10 images look like one product.

- **Organization (fictional):** Brightwell Supply Co., a wholesale supplies company running its own custom CRM, "Brightwell CRM"
- **Domain, if a URL ever shows:** `brightwell.example`
- **Typography:** Inter throughout with tabular numbers; semibold headings
- **Mood:** crisp, efficient and calm
- **UI style:** graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel)
- **Imagery:** no photographs; the product UI carries the images
- **Device scenes (cover and hero):** a clean white desk against a soft gray wall, a mint ceramic mug and a small notebook, bright neutral daylight

| Color | Hex | Use |
|---|---|---|
| White | `#FFFFFF` | page background |
| Graphite | `#1F2328` | text and sidebar |
| Emerald | `#1E9E6A` | primary and accent, buttons, positive values |
| Mint | `#E3F4EC` | soft tint for highlights and selected rows |
| Amber | `#F2B544` | warnings and due-soon tags only |

**Consistency tip:** generate Website 1 and App 1 first. When they look right, attach them as reference images in Higgsfield for the other screens of this design and add "Match the style of the attached reference images." to the start of the prompt.

## Images

### 1. Cover (shop card) — `images/designs/custom-crm/cover.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 2K |
| Final file | 1200 × 800 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop and phone. The shop card shows it as-is with a Concept badge over the top-left corner. |

**On-screen copy:** "Pipeline" · "Today"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop, open and angled slightly toward the viewer, with a modern smartphone standing upright in front of it to the right.

Setting: a clean white desk against a soft gray wall, a mint ceramic mug and a small notebook, bright neutral daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screens: the laptop shows the Brightwell CRM pipeline board with columns of white deal cards and a graphite sidebar; the phone shows the mobile Today task list. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Pipeline", "Today". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: reads instantly at small size. Two devices only, big simple shapes, the laptop screen about 55% of the frame width, centered a little right of middle. Keep the top-left corner of the frame calm and empty, because a small label sits over it.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM concept on a laptop and a phone: the deal pipeline and the mobile task list

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 2. Hero (design page) — `images/designs/custom-crm/hero.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K |
| Final file | 2400 × 1600 WebP, plus a 600 × 400 `-sm` thumbnail |
| Framing | Composed device scene: laptop, tablet and phone. Shown as-is at the top of the design page. |

**On-screen copy:** "Pipeline" · "$32,000" · "Team dashboard"

```text
A photorealistic product photograph, 3:2 landscape, of a slim modern laptop in the center, a tablet leaning on a low stand to the left, and a modern smartphone standing upright to the right, with clear space between all three.

Setting: a clean white desk against a soft gray wall, a mint ceramic mug and a small notebook, bright neutral daylight. Soft natural light from the left, gentle realistic shadows, the background slightly out of focus while every screen is sharp and bright. Device bodies in a neutral matte finish with no logos.

Design world shown on the screens: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screens: the laptop shows the pipeline board; the phone shows the deal detail; the tablet shows the team dashboard with KPI tiles and charts. Each screen is lit, straight and fully visible, with low glare.

Readable screen text (large headlines only): "Pipeline", "$32,000", "Team dashboard". Smaller interface details are clean shapes, bars and neat short lines, not invented words.

Composition: wide and balanced, eye level, the devices filling about 70% of the width, with calm space above. This is the product hero image, so the screens are the stars.

No people, no hands, no faces, no brand logos, no extra devices, no clutter. Product is the hero.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM concept: pipeline on a laptop, deal detail on a phone and the team dashboard on a tablet

**Regenerate if:** any readable screen text is garbled or misspelled; devices are warped, duplicated or have melted keyboards or bent screens; any person, hand or finger appears; logos appear on the devices; the setting drifts into dark brown wood or wood-slat walls (that is the CTSD site's world, not this design's); glare or darkness hides the screens; the palette on the screens does not match the design world.

### 3. Website 1: Deal pipeline — `images/designs/custom-crm/web-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Brightwell CRM" · "Pipeline" · "Contacts" · "Companies" · "Tasks" · "Reports" · "Settings" · "Q4 2026" · "New Deal" · "New" · "Qualified" · "Proposal" · "Negotiation" · "Won" · "Harlow Dental" · "$18,400" · "Mesa Cafés" · "$7,250" · "Pinecrest School" · "$32,000" · "Tidewater Clinic" · "$12,900" · "Due today"

```text
A flat, straight-on UI screenshot of one desktop web app screen, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: Graphite sidebar with the product name and six links (Pipeline active). Header with title, a quarter selector and an emerald New Deal button. Five pipeline columns, each headed by its stage name. The first four columns each hold one white deal card (company, value and an owner initials dot) in the order listed; the Won column holds a soft mint empty state. The Harlow Dental card has a small amber "Due today" tag.

On-screen text, in reading order: "Brightwell CRM", "Pipeline", "Contacts", "Companies", "Tasks", "Reports", "Settings", "Q4 2026", "New Deal", "New", "Qualified", "Proposal", "Negotiation", "Won", "Harlow Dental", "$18,400", "Mesa Cafés", "$7,250", "Pinecrest School", "$32,000", "Tidewater Clinic", "$12,900", "Due today".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background White #FFFFFF. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM deal pipeline with five stages and deal cards for dental, café, school and clinic customers

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 4. Website 2: Company record — `images/designs/custom-crm/web-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Pinecrest School" · "Dana Morales" · "DM" · "Operations Director" · "Campus count" · "3" · "Renewal month" · "August" · "Activity" · "Call logged" · "Oct 14" · "Email sent: Proposal v2" · "Oct 12" · "Meeting" · "Oct 9" · "Follow up on pricing" · "Due Fri" · "Log Activity"

```text
A flat, straight-on UI screenshot of one desktop web app screen, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: A company record. Left column: company name, primary contact with initials avatar, and custom fields. Centre: an activity timeline with three entries and icons. Right: an open task card with an amber tag and an emerald Log Activity button.

On-screen text, in reading order: "Pinecrest School", "Dana Morales", "DM", "Operations Director", "Campus count", "3", "Renewal month", "August", "Activity", "Call logged", "Oct 14", "Email sent: Proposal v2", "Oct 12", "Meeting", "Oct 9", "Follow up on pricing", "Due Fri", "Log Activity".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background White #FFFFFF. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM company record for Pinecrest School with the contact, custom fields, an activity timeline and an open task

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 5. Website 3: Team dashboard — `images/designs/custom-crm/web-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Team dashboard" · "This quarter" · "Revenue won" · "$284,600" · "Win rate" · "34%" · "Avg. deal" · "$15,800" · "Activities" · "1,126" · "Revenue by rep" · "Jordan Reyes" · "Mia Chen" · "Luis Ortega" · "Monthly revenue"

```text
A flat, straight-on UI screenshot of one desktop web app screen, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: Reports page. Four KPI tiles in a row. Below, a horizontal bar chart of revenue won by rep (emerald bars) beside a clean line chart of monthly revenue. Lots of white space.

On-screen text, in reading order: "Team dashboard", "This quarter", "Revenue won", "$284,600", "Win rate", "34%", "Avg. deal", "$15,800", "Activities", "1,126", "Revenue by rep", "Jordan Reyes", "Mia Chen", "Luis Ortega", "Monthly revenue".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background White #FFFFFF. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM team dashboard with revenue, win rate, average deal and activity totals and two charts

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 6. App 1: Today — `images/designs/custom-crm/app-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Today" · "Tue, Oct 14" · "Call Dana Morales" · "10:00 AM · Pinecrest School" · "Send quote" · "Mesa Cafés" · "Follow up" · "Harlow Dental" · "Overdue" · "Today" · "Deals" · "Contacts" · "Search"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain White #FFFFFF with nothing in it. A bottom tab bar in White #FFFFFF with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: Mobile CRM. Title and date. A short list of three tasks with checkboxes, times and company names; one with an amber tag. White bottom tab bar with graphite icons, Today active in emerald.

On-screen text, in reading order: "Today", "Tue, Oct 14", "Call Dana Morales", "10:00 AM · Pinecrest School", "Send quote", "Mesa Cafés", "Follow up", "Harlow Dental", "Overdue", "Today", "Deals", "Contacts", "Search".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. No photographs.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM mobile Today screen with three sales tasks

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 7. App 2: Deal detail — `images/designs/custom-crm/app-2.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Pinecrest School" · "$32,000" · "Proposal" · "Log Call" · "Email" · "Next step" · "Send pricing for 3 campuses" · "Fri, Oct 17" · "Today" · "Deals" · "Contacts" · "Search"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain White #FFFFFF with nothing in it. A bottom tab bar in White #FFFFFF with a hairline top border sits flush on the bottom edge, and its background runs right to the edge. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: Deal name and value large. A five-step stage bar with Proposal active in emerald. Two action buttons side by side. A next-step card. White bottom tab bar, Deals active.

On-screen text, in reading order: "Pinecrest School", "$32,000", "Proposal", "Log Call", "Email", "Next step", "Send pricing for 3 campuses", "Fri, Oct 17", "Today", "Deals", "Contacts", "Search".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. No photographs.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM mobile deal detail for Pinecrest School at the proposal stage

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 8. App 3: Log a call — `images/designs/custom-crm/app-3.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 9:16 · 4K (the script extends it to 9:19.5) |
| Final file | 1200 × 2600 WebP, plus a 600 × 1300 `-sm` thumbnail |
| Framing | Flat, full-bleed phone screen with NO phone frame, notch or status bar. The site draws the phone frame around it. |

**On-screen copy:** "Log a call" · "Dana Morales" · "Connected" · "Voicemail" · "No answer" · "Notes" · "Wants pricing for 3 campuses by Friday." · "Remind me Fri 9:00 AM" · "Save"

```text
A flat, straight-on UI screenshot of one iPhone app screen, filling the entire 9:16 canvas edge to edge. It is a pure 2D screen capture: no phone body, no device frame, no bezel, no notch, no Dynamic Island, no rounded outer corners, no hand, no background around it, no perspective.

Do not draw a status bar (no clock, signal or battery icons). The top 6% of the canvas is plain White #FFFFFF with nothing in it. There is no tab bar; the bottom 5% of the canvas is plain White #FFFFFF. Keep all text and buttons at least 6% in from the left and right edges.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: Form screen. Contact name at top. Outcome chips with Connected selected in mint and emerald. A notes field with a short note typed in. A reminder toggle. Full-width emerald Save button. No tab bar; the bottom 5% is plain white.

On-screen text, in reading order: "Log a call", "Dana Morales", "Connected", "Voicemail", "No answer", "Notes", "Wants pricing for 3 campuses by Friday.", "Remind me Fri 9:00 AM", "Save".

Look: a real native app, not a website squeezed into a phone. Premium, calm and uncluttered, comfortably large readable type, touch-sized buttons, few containers, simple custom-feeling icons with one consistent stroke. No photographs.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM mobile call log form with a connected outcome, notes and a reminder

**Regenerate if:** any word is garbled or misspelled; a phone body, notch, Dynamic Island, rounded outer corners or status bar clock appears (the site draws its own phone frame); text or buttons touch the side edges; it looks like a website in a phone; colors drift from the palette; people, faces or hands appear.

### 9. Portal: Customer portal — `images/designs/custom-crm/portal-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Brightwell" · "Customer Portal" · "Pinecrest School" · "Quote Q-2291" · "Awaiting approval" · "Approve Quote" · "Orders" · "Order #8812" · "Shipped" · "Order #8790" · "Delivered" · "Reorder" · "Your account manager" · "Jordan Reyes" · "JR"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: A customer-facing portal connected to the CRM, white with a slim graphite top bar. Greeting with the customer name. A quote card awaiting approval with an emerald Approve button, an orders list with status tags, a Reorder button and an account manager card with initials.

On-screen text, in reading order: "Brightwell", "Customer Portal", "Pinecrest School", "Quote Q-2291", "Awaiting approval", "Approve Quote", "Orders", "Order #8812", "Shipped", "Order #8790", "Delivered", "Reorder", "Your account manager", "Jordan Reyes", "JR".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background White #FFFFFF. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell customer portal with a quote to approve, recent orders and the account manager

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.

### 10. Admin: CRM settings — `images/designs/custom-crm/admin-1.webp`

| | |
|---|---|
| Generate | Nano Banana Pro · aspect ratio 3:2 · 4K (the script trims it to 16:10) |
| Final file | 2400 × 1500 WebP, plus a 600 × 375 `-sm` thumbnail |
| Framing | Flat, full-bleed screen with NO device or browser frame. The site draws the browser frame around it. |

**On-screen copy:** "Settings" · "Pipeline stages" · "New" · "Qualified" · "Proposal" · "Negotiation" · "Won" · "Custom fields" · "Campus count" · "Number" · "Renewal month" · "Date" · "Users & roles" · "Jordan Reyes" · "Sales rep" · "Mia Chen" · "Manager" · "Add Field"

```text
A flat, straight-on UI screenshot of one desktop web page, filling the entire 3:2 canvas edge to edge. It is a pure 2D screen capture: no browser window, no address bar, no laptop, no monitor, no device frame, no bezel, no desk, no drop shadow around it, no perspective, no tilt.

Design world: Brightwell Supply Co. (brightwell.example), a wholesale supplies company running its own custom CRM, "Brightwell CRM". It is a fictional organization. Palette, used strictly: White #FFFFFF (page background), Graphite #1F2328 (text and sidebar), Emerald #1E9E6A (primary and accent, buttons, positive values), Mint #E3F4EC (soft tint for highlights and selected rows), Amber #F2B544 (warnings and due-soon tags only). Typography: Inter throughout with tabular numbers; semibold headings. Mood: crisp, efficient and calm. UI style: graphite sidebar, white canvas, 10px corners, light gray hairlines, emerald buttons, realistic data, uncluttered (no more than one chart per panel).

Screen: Admin settings page. Left: pipeline stages as a reorderable list with drag handles. Middle: custom fields list with field types. Right: users and roles table. Clean and quiet.

On-screen text, in reading order: "Settings", "Pipeline stages", "New", "Qualified", "Proposal", "Negotiation", "Won", "Custom fields", "Campus count", "Number", "Renewal month", "Date", "Users & roles", "Jordan Reyes", "Sales rep", "Mia Chen", "Manager", "Add Field".

Look: premium, uncluttered and believable, like a real product built by a top studio. Generous whitespace, large clear type, strong hierarchy, one clear primary action. Background White #FFFFFF. No photographs.

Keep the bottom 6% of the canvas as quiet background with no text, because it is trimmed to 16:10.

Render every listed word exactly as written, crisp, sharp and correctly spelled, and add no other words (plain numbers on chart axes are fine). If the layout has room for more rows or cards than the text provides, leave calm empty space instead of inventing text. No lorem ipsum, no gibberish, no placeholder squiggles posing as text, no watermark, no signature, no real-company logos.
```

**Alt text:** Brightwell CRM settings with pipeline stages, custom fields and user roles

**Regenerate if:** any word is misspelled, garbled or invented; a browser bar, laptop, device frame or drop shadow appears (the site draws its own browser frame, so it would show a frame inside a frame); colors drift from the palette; it looks crowded or has two competing headlines; people, faces or hands appear; important content sits in the bottom 6%.
