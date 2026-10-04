# CTSD launch checklist

QA run on branch `build/ctsd-v1` against local `wrangler dev` (port 8787). Nothing has been pushed or deployed.

## Automated checks

- Unit tests: `npm test` passes.
- End-to-end: `npx playwright test` passes on chromium and webkit. Firefox is opt-in (`PW_FIREFOX=1`) and cannot launch on the build machine, so it needs a manual check (see Owner steps).
- Link crawl (`tests/e2e/links.spec.js`): starts at `/` and `/demo/`, follows every same-origin link, and checks that every page returns 2xx. It also checks that every `img` has an `alt` (empty alt only on decorative images), and that nothing else 404s. Image 404s under `/images/site/` and `/images/designs/` are expected until the real images are added.

## Lighthouse

Run with Lighthouse (npx) and desktop Chrome, headless, against `wrangler dev`. Scores are Performance / Accessibility / Best Practices / SEO. Gates: Performance 90 or more, Accessibility 95 or more. All pages pass on both presets.

| Page | Desktop | Mobile |
|---|---|---|
| `/` | 100 / 100 / 96 / 100 | 99 / 100 / 96 / 100 |
| `/designs` | 100 / 99 / 96 / 100 | 100 / 99 / 96 / 100 |
| `/designs/modern-church` | 100 / 100 / 96 / 100 | 99 / 100 / 96 / 100 |
| `/start` | 100 / 100 / 100 / 100 | 97 / 100 / 100 / 100 |
| `/demo/` | 100 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |

Notes:
- Best Practices 96 on three pages is only the console error for the not-yet-created images (404 under `/images/`). It goes to 100 once the images exist.
- This is localhost, not production. Mobile Performance uses simulated throttling, so re-run against the real domain after deploying.
- Before fixes, `/designs` scored 83 (desktop) and 87 (mobile), and `/start` mobile scored 86. The cause was layout shift: the design grid and the option cards are filled in by JavaScript, which pushed the CTA and footer down. Fixed by reserving space until they render (`.shop-grid:empty` in `shop.css`, `.choices[data-icons]:not(:has(*))` in `forms.css`).

## Screenshot pass

Every page (home, solutions, 4 industries, designs, 12 design pages, demo, about, start, mockup, privacy, thanks, and the 404) was captured full-page at 375, 768, 1280 and 1920 on chromium and webkit. A script confirmed no horizontal scroll on any page at any size. A sample at 768 (home, designs, a design page) was reviewed by eye.

Findings:
- No layout bugs found at 768. The grids drop to two columns cleanly.
- Full-page screenshots show blank bands on the home page until scrolled, because sections fade in on scroll. They render correctly when scrolled. This is expected behaviour.
- Cosmetic, left as is: on design pages with an odd number of features, the last row in the two-column grid has an empty cell with faint divider lines. The related-designs list also shows one card alone on its row at 768.
- The images are placeholders and CSS mocks for now, by design.
- Firefox was not tested (cannot launch on the build machine).

## Owner steps

Do these in order. Anything marked optional can wait.

1. **Create the Supabase project.** Sign in at supabase.com, create a new project, open the SQL editor, and run the contents of `supabase/leads.sql`.
2. **Connect the Worker to Supabase and the other services.** In `wrangler.jsonc`, set `SUPABASE_URL` to your project URL. Then run each of these and paste the value when asked:
   - `npx wrangler secret put SUPABASE_SERVICE_KEY`
   - `npx wrangler secret put RESEND_API_KEY`
   - `npx wrangler secret put TURNSTILE_SECRET`
3. **Create the Turnstile widget** in the Cloudflare dashboard (Turnstile section). Replace the test site key in `public/start.html` and `public/mockup.html` (the `data-sitekey` attribute) with your real site key.
4. **Optional:** set `MAIL_FROM` in `wrangler.jsonc` to a sender address you have verified in Resend.
5. **Analytics:** paste the Cloudflare Web Analytics token into `CF_BEACON_TOKEN` in `public/assets/js/shell.js`.
6. **Choose a domain** and attach it to the Worker in the Cloudflare dashboard.
7. **Generate the images** using the prompt sheets in `docs/image-prompts/`, put them in `public/images/`, then run `node scripts/make-thumbs.mjs` to create the small versions.
8. **After deploying, submit one real lead** through the site. Check that a new row appears in Supabase and that an email arrives at amanorsac@gmail.com. Also confirm the Cloudflare build succeeded.
9. **Set a reminder** to delete leads older than 24 months, as the privacy page promises.
10. **Check the site in Firefox** by hand (home, a design page, and submit the start form).
11. **Re-run Lighthouse on the live domain** for the same five pages and compare with the table above.
