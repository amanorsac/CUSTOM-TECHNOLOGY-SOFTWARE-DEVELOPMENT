# CTSD back office

Date: 2026-10-14. Status: awaiting the owner's review.

## Purpose

One private place to run CTSD Studio:
- the Virtual Assistant restaurants, from sign-up to live
- the monthly bills
- website and app clients and their projects
- a view of the money

The owner chose:
- **Scope.** All four areas in the first version: Virtual Assistant clients, monthly invoices, website and app clients, and a money overview.
- **Invoicing.** Stripe creates, emails and collects every invoice.
- **Location and sign-in.** It lives at ctsdstudio.com/admin, behind Cloudflare Access with an email one-time code.

**Success** means that once a month the owner opens the billing page, checks the numbers, and has nothing else to do. Stripe bills every restaurant correctly for its plan and minutes. Between billing runs, every client, lead and invoice is one click away.

## Ground rules

- **Access.**
  - `/admin/*` and `/api/admin/*` are protected by a Cloudflare Access application that allows only the owner's email. The owner sets it up in the dashboard, with steps in `docs/back-office-setup.md`.
  - The Worker also checks the `Cf-Access-Jwt-Assertion` header. It verifies the token against the team's public keys and the application's audience tag (the `ACCESS_TEAM` and `ACCESS_AUD` settings). Anything without a valid token gets a 403, so a misconfigured Access rule can't expose data.
  - The pages carry `noindex`, robots.txt disallows `/admin/`, and nothing links to them from the public site.
- **Secrets.** The owner enters them with `wrangler secret put`; Claude never sees or types them. They are:
  - `STRIPE_SECRET_KEY`, a restricted key with the scopes listed in the setup doc
  - `STRIPE_WEBHOOK_SECRET`
  - `ADELAIDE_ADMIN_KEY`

  None of them ever reaches a page.
- **Where data lives.**
  - Stripe is the record for money: customers, subscriptions, invoices and payments.
  - Supabase is the record for people and work: clients, projects, notes and usage reports.
  - The Adelaide backend is the record for calls and minutes.

  The back office only reads from and writes to these three. It never copies invoices into its own tables.
- **No card data** is ever handled. Payment happens on Stripe's hosted pages.

## Stripe setup (one button)

A **"Set up Stripe"** action on the Settings page creates whatever is missing, safely and more than once if needed. It finds existing items by their lookup keys, so it never makes duplicates. It creates:

| Item | Detail |
|---|---|
| Meter `va_minutes` | Sum of minutes per customer |
| Product "Virtual Assistant Monthly" | Flat price $497/month, plus a metered price on `va_minutes`, graduated: minutes 1–1,000 cost $0, then $0.35 |
| Product "Virtual Assistant Pay as you go" | Flat $149/month, plus metered $0.40 per minute |
| Product "Virtual Assistant Cap" | Flat $149/month, plus metered graduated: minutes 1–1,111 cost $0.45, then $0 with a flat $0.05 on that tier, so the month totals exactly $649 at the cap |
| Product "Virtual Assistant setup" | One-time price, $499 |

The Settings page shows what exists, with links into the Stripe dashboard.

## Data (new Supabase tables in `supabase/back-office.sql`)

**`clients`.** One per business:
- `id`
- `created_at`
- `kind`: `va` or `project`
- `name`, `contact_name`, `email`, `phone`, `address`
- `status`:
  - for `va`: new, paid, onboarding, live, paused or cancelled
  - for `project`: prospect, active, done or lost
- `stripe_customer_id`, `stripe_subscription_id`
- `plan`: `monthly`, `payg` or `cap`
- `adelaide_id`: the client id in the Adelaide backend's `data/clients.json`
- `va_number`: the assistant's phone number
- `go_live_on`
- `source_lead_id`, `source_signup_id`
- `notes`

**`projects`.** For website and app work:
- `id`, `client_id`, `created_at`
- `title`
- `kind`: website, app, portal, crm or other
- `status`: quoted, active, delivered or closed
- `quote_total`
- `notes`

**`activity`.** A timeline line per client:
- `id`, `client_id`, `at`
- `kind`: note, status, invoice, payment, usage or email
- `text`

**`usage_reports`.**
- `client_id`, `month`
- `minutes_reported`
- `updated_at`

It stops the same minutes being reported to Stripe twice.

All tables use the existing access model: RLS on with no policies, and only the Worker's service key can read them.

## Screens (`/admin`)

Plain, fast pages in the CTSD look, with dark navy on light. Each table has search, and each client's activity is shown as a timeline.

1. **Overview.**
   - **Revenue.** Collected this month and last month, from paid Stripe invoices. Also the expected monthly recurring revenue: flat fees of active subscriptions, plus this month's usage so far.
   - **Unpaid.** Open and overdue invoices with amounts and days late, linking to Stripe.
   - **Virtual Assistant.** Live restaurants, minutes this month, and projected bills. Profit per client after phone costs (from the Adelaide backend's `your_profit`), less $2 a month per number and Stripe's card fee of 2.9% + 30¢.
   - **Pipeline.** New sign-ups and leads waiting, and projects by status.
2. **Inbox.**
   - New Virtual Assistant sign-ups (`va_signups`) and website leads (`leads`), newest first.
   - Each opens its full answers. A download link for the menu or logo uses a short-lived signed URL.
   - Actions: **Turn into a client**, which creates the client with the details copied in, and **Mark contacted / lost**.
3. **Clients.** A list filtered by kind and status. A client page shows:
   - their details, which can be edited
   - their status
   - their activity
   - **For Virtual Assistant clients:** the plan, the assistant number, the Adelaide id, minutes this month (live from the backend), and the projected bill. Actions:
     - **Create in Stripe**, which makes the customer
     - **Send setup-fee invoice**, a $499 Stripe invoice, if the Payment Link wasn't used
     - **Go live**, which starts the subscription for their plan, billed on the 1st of each month, with the first month prorated
     - **Change plan**
     - **Pause** and **Cancel**
   - **For project clients:** their projects. **New invoice** builds a Stripe invoice with line items (for example a 50% deposit) and sends it from Stripe.
   - **Invoices.** The client's Stripe invoices with status, amount and the hosted link.
4. **Billing.** The month at a glance for every live restaurant:
   - minutes from the backend
   - minutes already reported to Stripe
   - the bill each plan gives (it must match the backend's own `bill`)
   - Stripe's upcoming invoice amount

   Any mismatch is highlighted. **Report usage now** sends any unreported minutes. Usage is also sent automatically every hour (see below), so this button is a safety net.
5. **Settings.**
   - Stripe status and the "Set up Stripe" button.
   - The Adelaide backend connection check (`/health`).
   - The Stripe webhook status.
   - Links to the setup doc.

## Automatic work

- **Hourly usage (Cron Trigger).** For every live restaurant with a subscription:
  1. Read this month's minutes from the backend's `/billing.json`.
  2. Subtract `usage_reports.minutes_reported`.
  3. Send the difference to the Stripe meter as one event, with an idempotency key built from the client, month and hour.
  4. Record the new total.

  Shortly after midnight on the 1st, it makes a final pass for the month that just ended. Its events carry a timestamp inside that period. The setup doc asks the owner to set Stripe's invoice finalization grace period to 24 hours, so the last minutes always land on the right invoice.
- **Stripe webhook** (`POST /api/stripe/webhook`). The signature is verified. On each event:
  - `checkout.session.completed` for the setup Payment Link: the matching sign-up, found by email, is marked `paid`.
  - `invoice.paid` and `invoice.payment_failed`: an activity line on the client, plus an email to the owner on a failure.
  - `customer.subscription.deleted`: the client is marked `cancelled`.

  Stripe sends the invoices and receipts itself.

## Settings (`wrangler.jsonc` vars)

- `ADELAIDE_BASE`: the backend's address
- `ACCESS_TEAM`
- `ACCESS_AUD`

Secrets are set as above. Previews get none of them, so the back office answers "not configured" there.

## Testing

**vitest.**
- **Access check.** A missing, expired or wrong-audience token gets a 403. A valid test-signed token passes.
- **Usage maths.** It reports only the difference, never double-reports, and handles a missing client or a backend outage.
- **Plan bills.** The bill for each plan equals the backend's `computeBill` at 0, 500, 1,000, 1,111, 1,500 and 3,000 minutes.
- **Stripe setup.** It is idempotent against a mocked Stripe.
- **Webhook.** A bad signature gets a 400. Each handled event changes the right row.
- **Inbox conversion.** It copies the right fields.

**Playwright.** Run against mocked APIs, with Access bypassed by a test-only env flag that's off everywhere else. It covers:
- overview cards
- converting a sign-up to a client
- the client page actions calling the right endpoints
- the billing table's mismatch highlight
- no serious axe violations at 1280 px

## Out of scope

- Client-facing logins. Restaurants use the backend's own usage links and Stripe's hosted pages.
- Multi-restaurant changes to the Adelaide backend. That's the owner's open question in the handoff; the back office reads whatever clients the backend lists.
- Accounting exports beyond Stripe's own.
- Staff accounts beyond the owner.

## Addition, 2026-10-19: proposals and quotes (owner approved the spec with this added)

- **Projects carry a proposal.** Each project holds:
  - its scope text
  - line items (description and amount, with a negative line for a discount such as the 50% launch offer)
  - a deposit percentage, 40% by default
  - a valid-until date
- **Proposal view.** The project page has **Proposal**, which opens `/admin/proposal.html?id=<project>`. It's a print-styled, branded page:
  - the CTSD header, the client and the scope
  - the line items and total, with the payment schedule (40% deposit, 30% at design approval, 30% at launch)
  - the terms and an acceptance block

  **Save as PDF** uses the browser's own print-to-PDF. The Worker cannot run a browser, so this is how a proposal becomes a PDF.
- **Invoice the deposit.** This creates a Stripe invoice for the deposit percentage of the total, sent by Stripe. Later milestones use **New invoice** with their own lines.
- **Client pricing card.** The card itself lives in `docs/business/pricing-card.html`, and `scripts/business-pdfs.mjs` renders it to PDF.
