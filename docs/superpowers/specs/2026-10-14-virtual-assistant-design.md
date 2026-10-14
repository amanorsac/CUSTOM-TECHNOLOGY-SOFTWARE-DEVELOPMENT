# Virtual Assistant on ctsdstudio.com

Date: 2026-10-14. Status: awaiting the owner's review.

**Source.** The owner's handoff doc, "Adelaide on ctsdstudio.com — Developer Handoff" (Claude Docs). It is the authority for:
- the copy
- the plans
- the sign-up fields
- the onboarding steps
- the acceptance checklist

This spec records what CTSD decided on top of it, and how the site builds it.

## Decisions

1. **The product is the Virtual Assistant.** It's an AI phone assistant for restaurants. "Adelaide" is only the demo assistant's name, and every client names their own (owner, 2026-10-14). So:
   - **Page addresses.** They are `/virtual-assistant`, `/virtual-assistant/pricing`, `/virtual-assistant/start` and `/virtual-assistant/welcome`.
   - **Product name.** Headings, the menu, the home card and the page titles say "Virtual Assistant".
   - **Where "Adelaide" appears.** Only for the demo: the live number ("Call our demo assistant, Adelaide"), the sample call, and the example lines in the feature cards ("Example: Adelaide says…").
   - **The handoff's copy.** Where it says "Adelaide" as the product, it's rewritten to "your assistant" or "the Virtual Assistant". Everything else stays as written.
   - **A new line.** "Your assistant, your name. Pick her name and voice; we set her up with your menu."
   - **The sign-up form.** It adds "Assistant name (optional, we can suggest one)".
   - **The footer brand line.** "Virtual Assistant by CTSD Studio · Charlottesville, VA."
2. **Payment is a Stripe Payment Link** that the owner creates for the $499 setup fee. Its after-payment page is `https://ctsdstudio.com/virtual-assistant/welcome`.
   - The link lives in one setting, `VA_SETUP_LINK` in `wrangler.jsonc`. It isn't a secret.
   - While it's empty, a submitted sign-up goes straight to the welcome page, which says "We'll send your secure payment link by email."
   - No Stripe key is ever stored on the site. The recurring plans start at go-live and are set up by the owner in Stripe, as the handoff says.
3. **Analytics are stored by the site.** A tiny `POST /api/event` endpoint records three events in a new Supabase table, `va_events`:
   - `call_click`
   - `form_start`
   - `signup_complete`

   Each row holds the event name, the page, and a timestamp. There's no IP address and no cookie. The SQL lives in `supabase/va-events.sql`, and the owner runs it once.
4. **The backend address doesn't change in this work.** Moving it to adelaide.ctsdstudio.com stays the owner's step, because it means switching the Retell URLs. The site never calls the backend's private endpoints. The pricing estimator uses the handoff's formulas, not the backend's `/quote` endpoint, so the page never depends on the phone system being up.
5. **The demo's live chat is dropped,** as the handoff says. The real phone number replaces it.

## Pages

All pages use the site's existing header, footer, fonts and midnight-and-ember colours (`tokens.css`, `site.css`). They follow the patterns of the current inner pages.

### `/virtual-assistant`, the product page

1. **Hero.**
   - Label: "Virtual Assistant for restaurants".
   - h1: "Every missed call is a missed table."
   - The handoff's subhead, with "Adelaide" changed to "Your Virtual Assistant".
   - **Primary button:** "Call our demo: (434) 838-3287", a `tel:+14348383287` link. Below it: "Our demo assistant, Adelaide, answers 24/7."
   - **Secondary button:** "Get started", linking to `/virtual-assistant/start`.
   - The proof row: 24/7 · Under 1 second · 0 calls on hold.
2. **Hear a call.** The demo's sample-call player is ported. It plays the scripted booking call as a transcript, with a waveform and optional speech using the browser's voice. Its "Speak aloud" toggle is off by default. The typed live chat is removed.
3. **How it works.** The handoff's three steps.
4. **What your assistant handles.** The six cards from the handoff, each with its example line.
5. **What missed calls cost you.** The demo's calculator, ported:
   - lost orders = missed per week × 4.33 × conversion
   - lost money = lost orders × average ticket
   - break-even = ceil(497 ÷ ticket) saved calls
6. **Your assistant, your name.** One short section: every restaurant chooses her name and voice.
7. **Pricing summary.** The three plans in brief, with a "See full pricing" link.
8. **FAQ.** The handoff's six questions as `<details>` elements, with "Adelaide" changed to "your assistant".
9. **Closing band.** "Get started" and the phone number again, then the brand line.

### `/virtual-assistant/pricing`

- **The plans.** Three plan cards. Monthly at $497 leads and is marked "Most restaurants", with Pay as you go and Cap beside it. Each shows its included minutes and its reminder texts, plus the $499 setup fee line and "Month to month, no contract".
- **The estimator.**
  - Sliders: calls per day (3–80) and call length (1–5 min).
  - minutes = calls × length × 30.4.
  - Plan costs: Monthly = 497 + max(0, m − 1000) × 0.35. Pay as you go = 149 + m × 0.40. Cap = min(149 + m × 0.45, 649).
  - The lowest plan is badged.
  - At 1,000 minutes it reads $497 / $549 / $599.
- **A short billing FAQ:** when the subscription starts, overage, cancelling.

### `/virtual-assistant/start`, sign-up

**Fields.** The handoff's eleven fields, plus "Assistant name". Required unless marked:

| Field | Notes |
|---|---|
| Restaurant name | |
| Owner name | |
| Mobile | |
| Email | |
| Restaurant address | |
| Current phone number | |
| Opening hours | One line per day, Mon–Sun |
| Menu | File (PDF, JPG, PNG, up to 10 MB) or link. One of the two is required. |
| Reservations | Yes or no. If yes: max online party size, and booking system (OpenTable, Resy, None, Other). |
| Pickup orders | Yes or no. If yes: typical ready time. |
| Staff transfer number | |
| Plan | Monthly, Pay as you go, or Cap. Monthly is preselected. |
| Answer mode | All calls, or missed calls only |
| Assistant name | Optional |
| Notes | Optional |

**Consent.** A checkbox with the handoff's line: "By signing up you agree that calls to your restaurant may be answered and recorded by an AI assistant."

**On submit:**
1. Validate the fields.
2. Upload the menu file through the existing signed-upload route. It goes to the private Supabase bucket, never a public URL. The route accepts PDFs for the menu.
3. Post to `/api/lead` with `kind: "virtual-assistant"`. That saves the lead and emails all the answers to the owner (LEAD_EMAIL).
4. Record `signup_complete`.
5. Send the visitor to the Stripe Payment Link if one is set. Otherwise go to `/virtual-assistant/welcome`.

Errors keep everything typed and offer the existing email fallback, the same way the current forms do.

### `/virtual-assistant/welcome`

- A thank-you.
- The handoff's onboarding steps, shown as a timeline: go live in about a week.
- The contact email.
- A link back to the demo number.

### Navigation and the home page

- "Virtual Assistant" is added under Solutions in the header and footer, in `shell-markup.js`. It's a link to `/virtual-assistant`.
- A card on the home page leads to it. It sits with the services, in the same style as the cards beside it.
- The four pages are added to the sitemap, except `start` and `welcome`.
- Each page has its own share image from `scripts/og-images.mjs`.

## Back end changes in this repo

- **`src/routes/lead.js` and its validation.**
  - It accepts `kind: "virtual-assistant"` with the fields above, all trimmed and length-capped.
  - Its owner email lists every answer, plus the menu file's private path.
  - The upload route allows `application/pdf` up to 10 MB, for this kind only.
  - The logo upload keeps its 5 MB image rule.
- **`src/routes/event.js`, new.**
  - Route: `POST /api/event`.
  - Body: `{ event, page }`.
  - It accepts only the three event names and a same-site page path. Anything else gets a 400.
  - Valid events are inserted into `va_events` with the service key. Failures are logged and still answer 204, so tracking never breaks a page.
- **Previews.** Supabase stays blank in previews (`wrangler.jsonc`), so previews never write leads or events. Forms there show the email fallback, as they do today.

## Not in scope

- The phone system, Retell, the Adelaide Worker code and its address.
- Stripe products and subscriptions. The owner creates them, as the handoff says.
- Multi-restaurant backend support. It's the handoff's open question for the owner.

## Testing

- **vitest.**
  - `/api/lead` with `kind: "virtual-assistant"`: valid input succeeds, and missing fields give a 400 that names them.
  - The upload route accepts a PDF for this kind and rejects one for the logo.
  - `/api/event` accepts the three events and gives a 400 for anything else.
  - The sitemap includes the two public pages.
- **Playwright, `tests/e2e/virtual-assistant.spec.js`.**
  - **The product page.** It loads with one h1. The `tel:` link is `tel:+14348383287`. The six cards, the FAQ and the sample-call player all work.
  - **The calculators.** The missed-call calculator's default reads $1,949 (25 a week, $45, 40%). The estimator at 1,000 minutes reads $497, $549 and $599, and badges Monthly.
  - **The form.** Required fields show errors. A valid submit with a mocked `/api/lead` lands on the welcome page, or the Payment Link once it's set.
  - **Tracking.** A `call_click` event is posted when the number is clicked.
  - **Navigation.** "Virtual Assistant" is in the Solutions menu and on the home page.
  - **Layout.** At 375 and 1280 px there's no horizontal scroll and no serious axe violations.
  - **Secrets.** No secret appears in any page source.
