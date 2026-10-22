# Setting up the CTSD back office

The back office lives at **https://ctsdstudio.com/admin**. It needs five things set up once, in this order.

Keys and passwords go into Cloudflare or Stripe directly. Never put them in this repo, in a chat, or in an email.

## 1. Create the database tables (Supabase)

In Supabase, open **SQL Editor** and run these files once each, in order. Each is safe to run again.

1. `supabase/leads.sql`, if you haven't already.
2. `supabase/virtual-assistant.sql`
3. `supabase/back-office.sql`

## 2. Lock /admin to your email (Cloudflare Access)

1. In the Cloudflare dashboard, open **Zero Trust**. The first time, pick a team name, such as `ctsdstudio`, and the free plan.
2. Go to **Access**, then **Applications**, then **Add an application**, then **Self-hosted**.
   - **Name:** CTSD Back Office.
   - **Domain:** `ctsdstudio.com`, path `admin`. Add a second domain line for `ctsdstudio.com`, path `api/admin`.
   - **Policy:** Allow, with an Include rule of **Emails**, set to your email address.
   - **Login method:** One-time PIN, the default.
3. Open the application's **Overview** and copy the **Application Audience (AUD) Tag**.
4. In `wrangler.jsonc`, set:
   - `ACCESS_TEAM` to your team name, for example `ctsdstudio`
   - `ACCESS_AUD` to the AUD tag

   Neither is a secret. Ask Claude to do this and merge.

Without both settings, the back office stays locked for everyone. That's deliberate.

## 3. Connect Stripe

1. **Create a restricted key.** In Stripe, go to **Developers**, then **API keys**, then **Create restricted key**, and name it "CTSD back office". Give it **Write** access to:
   - Customers
   - Invoices
   - Products
   - Prices
   - Subscriptions
   - Billing meters
   - Meter events

   Also give it **Read** access to Checkout Sessions.
2. **Save the key in Cloudflare.** Paste it into a terminal, not into a chat:

   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   ```

3. **Add the webhook.** In Stripe, go to **Developers**, then **Webhooks**, then **Add endpoint**.
   - **URL:** `https://ctsdstudio.com/api/stripe/webhook`
   - **Events:** `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed` and `customer.subscription.deleted`

   Copy its signing secret, then save it in Cloudflare:

   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

4. **Set the finalization grace period.** In Stripe, go to **Settings**, then **Billing**, then **Invoices**, and set the **invoice finalization grace period** to 24 hours. This lets the last day's minutes reach the right invoice.
5. **Set up the plans.** Open **/admin**, then **Settings**, then **Set up Stripe plans and prices**. This creates the minutes meter, the three Virtual Assistant plans and the $499 setup price.

Try it all in Stripe **test mode** first, with a test key. Switch to the live key when you're happy.

## 4. Connect the Adelaide backend

The backend's address is already in `wrangler.jsonc`. Add its admin key as a secret:

```bash
npx wrangler secret put ADELAIDE_ADMIN_KEY
```

On each Virtual Assistant client's page, set **Adelaide id** to that restaurant's `id` in the backend's `data/clients.json`, for example `mango-ember`. That id links the minutes to the right client.

## 5. The $499 Payment Link (website sign-ups)

Create a Stripe Payment Link for the "Virtual Assistant setup" price. Set it to redirect to `https://ctsdstudio.com/virtual-assistant/welcome`. Put the link in `VA_SETUP_LINK` in `wrangler.jsonc`.

## How a month runs

1. **Every hour,** the site sends each live restaurant's new minutes to Stripe.
2. **On the 1st,** Stripe invoices every restaurant (the flat fee plus last month's minutes) and emails them a payment link.
3. **Check the Billing page.** Every row should show a check mark. Anything highlighted needs a look before Stripe finalizes, about a day later.
4. **Watch for failed payments.** They email you, and they appear on the client's timeline.

## Working on it locally

`npm run dev` opens the back office at http://localhost:8787/admin as `dev@ctsd.local`, without Access. That works only on localhost.
