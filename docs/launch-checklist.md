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

Do these in order, one at a time. Part A must be finished before anything is pushed to `main`, because **every push to `main` publishes the live site**. If the site goes live before Part A is done, both forms will say "Sorry, something went wrong" and no lead will be saved.

### Part A: do these BEFORE the first push to `main`

1. **Set up Supabase (where leads are stored).**
   1. Sign in at supabase.com and create a new project.
   2. Open the **SQL Editor**, paste in everything from the file `supabase/leads.sql`, and click **Run**. This creates the `leads` table and the private `lead-uploads` storage bucket for logos.
   3. Open **Project Settings → API**. Keep this page open: you need the **Project URL** and the **service_role** key in steps 4 and 5. The service_role key is a password: never paste it into any file in the project.

2. **Set up Resend (sends the lead emails).**
   1. Sign in to resend.com with **amanorsac@gmail.com** (create the account with that address if you do not have one yet).
   2. Open **API Keys**, click **Create API Key**, and copy the key. You need it in step 5.
   3. Recommended: open **Domains** and verify a domain you own (for example amanorsac.studio, or the new CTSD domain once you have it). Resend shows you DNS records to add; wait until it says **Verified**.
   - Why step 3 matters: until you set `MAIL_FROM` (step 4), lead emails are sent from Resend's shared test address, `onboarding@resend.dev`. That address can only deliver to the Resend account owner's own inbox (amanorsac@gmail.com). So you will still get every new lead by email, but **visitors get no confirmation email**. To send visitors their "we received your request" email, you need a verified domain and `MAIL_FROM`.

3. **Set up Turnstile (the spam check on the forms).**
   1. In the Cloudflare dashboard, open **Turnstile** and click **Add widget**.
   2. Under hostnames, add the Worker's address, `custom-technology-software-development.<your-account>.workers.dev`, and your own domain too if you already have one.
   3. Cloudflare shows two keys. Each goes in one place only:
      - **Site key** (public): open `public/start.html` and `public/mockup.html`, find `data-sitekey="1x00000000000000000000AA"`, and replace the test value with your site key in both files. These two files are the only place the site key lives; `wrangler.jsonc` has no site-key setting.
      - **Secret key** (private): keep it for step 5. Never put it in any file.

4. **Fill in `wrangler.jsonc`.**
   - Set `SUPABASE_URL` to the Project URL from step 1, for example `"https://abcdefgh.supabase.co"`.
   - If you verified a domain in step 2, set `MAIL_FROM` to a sender on that domain, for example `"CTSD <hello@amanorsac.studio>"`. Leave it as `""` only if you accept that visitors will get no confirmation email.

5. **Store the three secret keys in Cloudflare.** In a terminal, inside the project folder, run `npx wrangler login` once, then run each line below. Paste the matching value when it asks. If it asks whether to create the Worker, answer yes.
   - `npx wrangler secret put SUPABASE_SERVICE_KEY` (the service_role key from step 1)
   - `npx wrangler secret put RESEND_API_KEY` (the API key from step 2)
   - `npx wrangler secret put TURNSTILE_SECRET` (the secret key from step 3)

6. **Optional: analytics.** Paste your Cloudflare Web Analytics token into `CF_BEACON_TOKEN` in `public/assets/js/shell.js`.

7. **Commit the changes from steps 3, 4 and 6, and push to `main`.** This is the first deploy.

### Part B: right after deploying

8. **Check the build.** In the Cloudflare dashboard, open the Worker's **Deployments** (or Builds) tab and confirm the latest build succeeded.

9. **Send one test project request on the live site, straight away.** Open the deployed address and fill in `/start` with your own details. Then check all three:
   - The form shows the thank-you page.
   - A new row appears in Supabase (**Table Editor → leads**).
   - An email about the new lead arrives at amanorsac@gmail.com. If you set `MAIL_FROM`, a confirmation email also arrives at the address you typed in the form (use a different address from amanorsac@gmail.com to be sure).
   If the form says "Sorry, something went wrong", recheck steps 1 to 5. In the Cloudflare dashboard, the Worker's **Logs** name any missing setting.

10. **Test the logo upload on the live site.** Fill in `/mockup` and attach a small PNG image as the logo. Then check:
    - In Supabase, open **Storage → lead-uploads**: the file is there, with a long random name ending in your file name.
    - In **Table Editor → leads**, the new row's `logo_path` column holds that same name.

11. **Attach your domain.**
    1. Choose a domain and attach it to the Worker in the Cloudflare dashboard (Worker → **Settings → Domains & Routes → Add → Custom domain**).
    2. In **Turnstile**, add the new domain to the widget's hostnames.
    3. Turn off the duplicate `workers.dev` address, so it does not compete with your domain in search results: add the line `"workers_dev": false,` to `wrangler.jsonc` (under the `"compatibility_date"` line), then commit and push. After that, only your domain serves the site.
    4. Repeat step 9 once on the new domain.

12. **Add the images.** Generate them with the prompt sheets in `docs/image-prompts/`, put them in `public/images/`, then run `node scripts/make-thumbs.mjs` to create the small versions. Commit and push.

13. **Set a reminder** to delete leads older than 24 months, as the privacy page promises.

14. **Check the site in Firefox** by hand: the home page, a design page, and send the start form once.

15. **Re-run Lighthouse on the live domain** for the same five pages and compare with the table above.
