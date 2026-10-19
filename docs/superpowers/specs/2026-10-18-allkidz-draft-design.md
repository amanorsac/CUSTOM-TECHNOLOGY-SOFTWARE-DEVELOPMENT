# Allkidz Christian Childcare: website and portal (CTSD draft)

**Status:** built as an unlisted client draft, 2026-10-18. Not shown to the client yet.
**Where:** `/preview/allkidz/` (website), `/preview/allkidz/login` and `/preview/allkidz/portal` (portal).
**Brief (from the owner):** redesign allkidzchildcare.org in the exact style of modernmusichub.amanorsac.workers.dev, using photos from the current site and Facebook, plus a dashboard for teachers, parents and sign-up that is easy to use but has advanced features. "Make all decisions and I will do mine later."

## Sources researched

- **allkidzchildcare.org** (Weebly): home, about, provider's profile, mission, statement of faith, kingdom parenting, handbook and its 12 policy pages, fees and payments, 2026 calendar, COVID update, contact. All copy on the new site comes from these pages, tightened.
- **facebook.com/allkidz1015childcare** (logged out, so only the public slice): the "Allkidz4Christ / Nurturing Young Minds in God's Light / Learn · Love · Grow · Faith" logo, the circle-time cover photo, a 2026 "Now enrolling" flyer, and links to Instagram (allkidz4christ), TikTok and YouTube.
- **Modern Music Hub** (the style reference): its `mmh.css`, `app.css`, `app.js` and page structure were carried over whole.

## Decisions I made

| Decision | Why |
| --- | --- |
| **Colour theme: "Sunny playroom"** (owner's pick, 2026-10-18): warm cream page and navy type instead of MMH's black; sunshine yellow buttons, tomato highlights, sky, grass, grape and bubblegum accents; navy sidebar and footer | The black page felt like a teen music studio; a bright cream page reads as a daycare. |
| Reuse the Modern Music Hub layout and components: cream paper sections, six pop colours, Montserrat 800 headlines, Inter body, full-bleed photo panels, pairs, steps, tiles, plans, band CTA, big footer | "Exact design style". The six pop colours already match the Allkidz4Christ logo. |
| Brand mark: a cross built from five play blocks plus a pink ball | Christian + childcare in one shape, drawn in the logo's colours. The hopping blocks replace MMH's equaliser. |
| Headline "Learn. Love. Grow." | Straight from their logo's Learn · Love · Grow · Faith. |
| Colour per age: Infants pink, Toddlers sunshine, Preschool orange, School-age sky, Faith violet, Outdoors lime | Gives every section and every child in the portal a consistent colour. |
| Seven site pages: Home, Programs, Our Day, About, Handbook, Calendar, Enroll | Folds 20 thin Weebly pages into a clear structure; the whole handbook becomes one searchable page. |
| COVID page dropped; its still-useful rules (temperature check, shoes off, sanitiser) moved into Handbook > Health | The 2021 page reads as out of date. |
| Fonts self-hosted, no third-party requests | Same as the other CTSD drafts. |
| Portal runs in the browser on seeded demo data (`store.js`, localStorage) | Lets the owner and client click through every workflow now. One `Store` API, so going live means swapping its insides for the backend (schema in `supabase/allkidz.sql`), not rewriting screens. |
| Three roles: Director, Teacher, Parent | Matches how Allkidz runs (Hannah, assistant Thomas, families). |
| Parents self-register; the director approves and links them to a family | The "sign-up" ask, without strangers seeing children's data. |
| Teachers and new parents get a one-time password and must choose their own | Safer than emailing permanent passwords. |
| The website's tour form and 5-step application land in the portal's enrollment pipeline; "Enroll" turns an application into family + child + parent login in one click | Nobody retypes anything. |
| Billing follows the handbook exactly: weekly, due the Friday before, $10/day late then $20/day after two weeks, $30 bounced check, $1/min late pickup after a 15-minute grace (offered at check-out, staff confirm), registration fee on enrollment, year-end tax statements | These are their written policies. |
| Check-in includes the handbook's health screen and refuses 100°F+ | Their sickness policy, enforced at the door. |

## Portal features

- **Director:** overview with live ratio meter and a "needs your attention" list (new inquiries, pending accounts, payments to confirm, overdue bills, expiring certificates, immunizations due); check-in kiosk; daily reports (meals, naps, diapers, potty, activities, moods, notes, photos; one entry for several children at once); children roster with auto age groups, allergy flags, CSV; families with pickups, bills and statements; staff with time clock, hours, certificates and invites; enrollment kanban with drag and drop; billing (bill next week, apply late fees, record payments, bounced checks, confirm parent-reported payments, CSV); messages; announcements; calendar (closings, tours, birthdays, renewals) that also feeds the website's calendar page; weekly menu and lesson plan (menu also shows on the website); incident reports; insights charts; settings, backup and restore. Ctrl+K search across everything.
- **Teacher:** today (plan, allergies in today, who's here), check-in, daily reports, roster, incidents, messages, the week, calendar, own time clock and certificates.
- **Parent:** home (child status, today's timeline, balance, photos, closings), daily reports by day, messages, bills and "I've paid" reporting, tax statement, calendar, menu and lessons, news, incident acknowledgement, family page (absence reporting, pickup list, photo consent, document upload, password).

## Things for the owner to decide or confirm

1. **Ages.** The website says 3 months to 12 years; the 2026 Facebook flyer says "Ages: 2 and up". The draft uses 3 months to 12 years. Confirm with Hannah.
2. **Tuition.** The site says "call for tuition", so the public pages never show prices. The portal uses placeholder rates ($250 full-time, $175 part-time, $55 drop-in, $100 registration), editable in Settings.
3. **MLK Day.** Their calendar says January 10th; MLK Day 2026 is January 19th. The draft uses the 19th.
4. **Demo people.** Hannah and Thomas are real names from the site; Abena Owusu and every family and child are invented demo data. Staff certificate dates are invented too.
5. **Photos.** Their own photos are low resolution (largest 1600 px; several are 400–960 px), so a few panels look soft on big screens. A short photo shoot, or AI-upscaled versions, would lift the site.
6. **Going live.** Needs a backend (run `supabase/allkidz.sql`, real sign-in, file storage for photos and documents, email/SMS notifications), the Allkidz domain, and the client's sign-off.
7. **Payments.** The portal records Zelle/Venmo/check/cash. Online card or ACH payment (Stripe) could be added later.
