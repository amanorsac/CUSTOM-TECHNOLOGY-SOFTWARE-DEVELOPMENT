# CTSD Website — Design Spec

**Date:** 2026-10-03
**Status:** Approved in conversation, awaiting written-spec review
**Owner:** Stephen Amanor Sackey (Amanorsac Studio)

---

## 1. Purpose

Build the marketing website for **Custom Technology & Software Development (CTSD)**: *"Technology built around your organization."*

CTSD builds custom websites, mobile apps, client and member portals, custom CRMs, third-party CRM integrations, admin dashboards and automation for **businesses, churches, schools and nonprofits**. All four verticals get equal weight.

The site has to:

1. Look premium and make CTSD look capable of serious projects, not "a web-design shop."
2. Let visitors **browse concept designs like products in a shop** and open each one as a product page.
3. **Prove the "easy to manage" claim** with a live admin demo visitors can click through.
4. Turn visitors into leads through a **project intake form** and a **free mockup request**.

**Source of truth for copy and positioning:** the CTSD Brand Identity Document (pasted 2026-10-03). This spec overrides that document only where noted. The main override is the color palette (§5).

### Success criteria

- A visitor from any of the four verticals can reach a design relevant to them within 2 clicks of the homepage.
- Every design page ends in a "Build something like this" call to action that opens the intake form with the design pre-filled.
- Lead submissions reach the Supabase `leads` table **and** the owner's inbox.
- The admin demo works with no login and cannot change any server data.
- Lighthouse: Performance ≥ 90 and Accessibility ≥ 95 on desktop and mobile. WCAG 2.1 AA, which matters because CTSD will pitch accessibility to schools.
- Phone layout works at 375px wide with no horizontal scrolling.

---

## 2. Decisions

| Topic | Decision |
|---|---|
| Verticals | Business, Church, Education, Nonprofit, all equal weight |
| Visual direction | Brown wood brand board (overrides the brand doc's obsidian and blue palette) |
| Pricing | **No prices shown anywhere.** Every call to action leads to a quote or the free mockup |
| Hosting | **New GitHub repo and own domain** (domain to be chosen), Cloudflare, same stack as amanorsac.studio |
| Lead capture | Project intake form + free mockup request |
| v1 scope | Core site, 12 concept designs, live admin demo |
| Out of v1 | Website audit tool, portal for real CTSD clients, blog, pricing pages, real case studies |

---

## 3. Architecture

Same stack as amanorsac.studio (`github.com/Amanorsac-Studio/potfoliowebsite`), started as a fresh repo:

- **Static HTML/CSS/vanilla JS** with no build step. Cloudflare serves files directly.
- **Cloudflare Worker** (`worker.js` + `wrangler.jsonc`). It handles only the `POST /api/lead` and `GET /sitemap.xml` routes. Every other request is served as a static file.
- **Supabase**: one `leads` table and one storage bucket for mockup-request logo uploads. The anon key goes in the client. The `service_role` key is used **only** in Worker secrets.
- **Resend**: the Worker emails the owner when a new lead arrives, using the same pattern as the existing `worker.js`.

### 3.1 Data-driven design catalog

Designs are data, not hand-written pages.

- `data/designs.json` is an array of design objects (schema in §6.2).
- `designs.html` is the shop grid. It reads `designs.json` and supports filtering by `?cat=`.
- `design.html?id=<slug>` is one template that renders any design.
- The Worker also serves the clean URL `/designs/<slug>`, rewriting it to the template and adding server-side `<title>`, description and Open Graph tags for SEO and link previews.
- **Adding a design = add an image folder + one JSON entry.** No new HTML.

### 3.2 Repo layout

```
/index.html                 Home
/solutions.html             Solutions
/industries/business.html   Industry landing pages (4)
/industries/church.html
/industries/education.html
/industries/nonprofit.html
/designs.html               Explore Designs (shop grid)
/design.html                Design product-page template
/demo/                      Live admin demo (self-contained)
/about.html
/start.html                 Start a Project (intake form)
/mockup.html                Free mockup request
/thanks.html
/privacy.html               Privacy policy (forms collect personal data)
/404.html
/data/designs.json
/assets/css/                tokens.css, site.css, design.css, demo.css
/assets/js/                 shell.js, designs.js, design-page.js, forms.js, demo/*
/assets/brand/              logo SVG, icons, favicon, app icons
/images/designs/<slug>/     generated images per design
/images/site/               homepage and section art
/worker.js
/wrangler.jsonc
/supabase/leads.sql
/docs/image-prompts/        Nano Banana prompt sheets per design
```

---

## 4. Pages

Navigation (from the brand doc, §22): **Home · Solutions · Industries ▾ · Explore Designs · Live Demo · About · [Start a Project]**. "Our Work" is left out until real client work exists.

The look follows amanorsac.studio: a slim dark top nav and full-width stacked "product tiles" with two text links each.

### 4.1 Home
1. **Hero:** "Technology built around your organization." with the supporting copy from brand doc §23.
   - Buttons: **Start Your Project** and **Explore What We Build**.
   - Visual: a desktop, a phone, an admin panel and a CRM dashboard together in the wood-office setting.
2. **Service strip:** Web Development · Mobile Apps · CRM · Client Portals · Business Systems · Automation · Integrations.
3. **"More than a website"**: an animated journey Discover → Register → Book → Pay → Receive → Portal → Communicate → Return.
4. **Featured design tiles:** Apple-style stacked tiles, one per vertical plus one Software tile. Each has "View design ›" and "Build something like this ›".
5. **"Built for your team to manage"**: copy from brand doc §31, an admin screenshot, and an **Open the live demo** button.
6. **Who we build for:** four industry cards linking to the industry pages.
7. **Process:** 6 steps (Discover → Design → Build → Test → Launch → Handoff).
8. **Integrations wall:** logos or wordmarks of supported platforms (Planning Center, Stripe, HubSpot, Salesforce, QuickBooks and others).
9. **Final call to action:** "Tell us what your organization needs." Buttons: **Start a Project** and **Get a free mockup**.

### 4.2 Solutions
Three groups from brand doc §34:
- **Digital Experience:** Websites, Mobile Apps, Ecommerce.
- **Business Software:** CRM, Portals, Dashboards, Booking, Membership, Operations.
- **Connected Systems:** API Integrations, Third-Party CRM, Payments, Automation, Authentication, Cloud.

Each item gets a short plain-English description and links to related designs.

### 4.3 Industry pages (×4)
Shared template:
- an industry hero
- the problems that industry has (plain language)
- typical systems (from brand doc §6–9)
- the relevant integrations (e.g. Planning Center for churches; SIS for schools; donor CRM for nonprofits)
- that industry's designs
- the call-to-action band

The Education page includes a short WCAG 2.1 AA / ADA Title II accessibility section. It is a statement of capability, not a legal guarantee.

### 4.4 Explore Designs (shop)
- Filter tabs: **All · Church · Education · Business · Software**. The filter is stored in `?cat=` so the page can be linked.
- Cards: cover image, name, category, short tagline, a **Concept** badge, and the systems included (e.g. "Website · App · Portal · Admin").
- Hover: the image changes to the phone mockup.

### 4.5 Design page (template)
Sections, each shown only if the design has those images:
1. Hero: name, **Concept** badge, tagline, hero mockup. Button: **Build something like this**.
2. **Website**: desktop screens (carousel or stacked).
3. **Mobile App**: phone screens, iOS and Android.
4. **Portal**: member or client login experience.
5. **Administration**: admin screen and a link to the live demo.
6. **Features**: icon list.
7. **Integrations** used.
8. **Related designs** (same category).
9. Call to action: **Build something like this** → `start.html?design=<slug>`.

Brand doc rule §30: every concept is visibly labeled **Concept**. Fictional organizations are never presented as past clients.

### 4.6 Live Demo (`/demo/`)
See §7.

### 4.7 About
- The CTSD story and positioning ("a custom technology partner").
- The founder: Stephen, with a link to amanorsac.studio as proof of shipped software (apps, portal, store).
- Brand promise: **Built around you.**

### 4.8 Start a Project and Free Mockup
See §8.

---

## 5. Visual system

### 5.1 Colors (from the brand board, overriding the brand doc)

| Token | Hex | Use |
|---|---|---|
| `--deep-brown` | `#3E2723` | Primary dark sections, nav |
| `--wood-brown` | `#6B4F32` | Brand surfaces, cards on dark |
| `--warm-tan` | `#C89B6B` | Accent, links, buttons |
| `--gold` | `#D4AF37` | Highlight only (small details, focus rings, badges) |
| `--cream` | `#F7EFE4` | Light section background |
| `--charcoal` | `#1A1A1A` | Text on light backgrounds; darkest sections |
| `--sage` | `#556B2F` | Secondary accent (success, the plant motif) |
| `--off-white` | `#FBF9F6` | Surfaces and cards on light backgrounds |

- Dark wood-tone sections alternate with cream sections. Gold is used sparingly.
- All text and background color pairs must pass WCAG AA contrast. Check in particular: tan on cream, and gold used as text.
- No blue anywhere.
- The site follows the brand board's own split of dark wood sections and cream sections. It does not add a separate dark mode.

### 5.2 Type
- **Headings:** Montserrat (600–700), large, tight letter spacing.
- **Subheadings and labels:** Poppins (500), uppercase labels with wide letter spacing, like "LOGO VARIATIONS" on the board.
- **Body:** Inter (400/500).
- Fonts are self-hosted as woff2 in `/fonts/`, with `font-display: swap`.

### 5.3 Elements
- Wood-grain textures and vertical wood slats used as section backgrounds and dividers, with plant accents. Textures are compressed images and never sit behind body text without an overlay.
- Rounded cards, soft shadows, minimal borders.
- Thin line icons in tan or gold.
- Logo: the hexagonal C+T mark plus the wordmark, in primary, horizontal and icon versions from the brand board. These are rebuilt as **SVG**; the brand-board raster image is not used directly.

### 5.4 Motion
Subtle only:
- elements fade and rise as they scroll into view
- tile images shift slightly on hover
- the journey-flow animation

All motion respects `prefers-reduced-motion`.

---

## 6. Content and images

### 6.1 Launch designs (12)

| Category | Designs |
|---|---|
| Church | Modern Church Platform · Multi-Campus Church · Youth Ministry |
| Education | Private School · Music School · Online Academy |
| Business | Consulting Firm · Real Estate · Restaurant |
| Software | Custom CRM · Client Portal · Booking System |

Nonprofit has no launch designs. It is covered by its industry page and by tagging the relevant designs (Client Portal, Booking System, Modern Church) with `nonprofit` so they appear there.

### 6.2 `designs.json` schema

```json
{
  "slug": "modern-church",
  "name": "Modern Church Platform",
  "category": "church",
  "tags": ["church", "nonprofit"],
  "tagline": "Website, app, giving and member portal in one connected system.",
  "systems": ["Website", "Mobile App", "Member Portal", "Admin"],
  "features": ["Online giving", "Sermon library", "Livestream", "Events", "Groups", "Prayer requests"],
  "integrations": ["Planning Center", "Stripe", "YouTube"],
  "images": {
    "cover": "images/designs/modern-church/cover.webp",
    "hero": "…/hero.webp",
    "website": ["…/web-1.webp", "…/web-2.webp", "…/web-3.webp"],
    "app": ["…/app-1.webp", "…/app-2.webp", "…/app-3.webp"],
    "portal": ["…/portal-1.webp"],
    "admin": ["…/admin-1.webp"]
  },
  "featured": true,
  "concept": true
}
```

### 6.3 Image pipeline (Nano Banana via Higgsfield, generated by the owner in the browser)

- **Per design:** 1 hero device scene, 3 website screens, 3 phone screens, 1 admin or portal screen. That's about 8 images, about 96 in total.
- **Site art:** homepage hero, a "built for your team" admin hero, 4 industry heroes and wood textures. About 10 images.
- **Prompt sheets:** for each design, `docs/image-prompts/<slug>.md` holds that design's fictional organization name, palette, mood and the exact prompt for each image. This keeps every image of one design consistent.
  - Each design gets its **own** palette, so the shop looks varied.
  - The CTSD site around them stays brown wood.
- **Export format:** WebP. 2400px wide for desktop screens, 1200px for phones and cards. Each image also gets a 600px thumbnail.
- **Every image needs real alt text,** describing what the screen shows.
- Text inside generated screens should be readable and plausible. Garbled text means regenerate.

### 6.4 Copy
Copy comes from the brand doc's key messages (§12) and voice rules (§11): simple, clear, confident, no jargon. Calls to action use the brand doc's §37 list and never "Get a Website."

---

## 7. Live admin demo

**Goal:** let a visitor feel how easy it is to run their own system.

- **Location:** `/demo/`, a self-contained single-page app in vanilla JS. It is styled in a neutral admin look with CTSD wood accents.
- **Starting point:** the layout and components of amanorsac.studio's `portal/admin*.html` (sidebar, tables, charts in `assets/charts.js` and `admin-charts.css`), re-skinned. **No Supabase calls.**
- **Data:** seed JSON for three switchable fictional organizations: *Grace Fellowship* (church), *Oakridge Academy* (school) and *Summit Consulting* (business). An org switcher sits in the top bar.
- **What visitors can do:**
  - **Dashboard:** KPI tiles and charts (visitors, giving or revenue, sign-ups).
  - **Pages:** edit a heading, a paragraph and an image on a live preview of the org's homepage. Changes show instantly side by side.
  - **Events:** add, edit or delete an event, which then appears in the preview calendar.
  - **People:** a members, students or clients table with search and filters, and a detail view.
  - **Bookings or Submissions:** an inbox of form submissions; mark as handled.
  - **Notifications:** compose a message and see the phone preview of the push notification.
- **State:** held in memory and mirrored to `sessionStorage`, with all storage calls wrapped in try/catch. A **Reset demo** button restores the seed data. Nothing is ever sent to a server.
- **Banner:** "Demo — changes stay in your browser. Want this for your organization? Start a project."
- **On phones:** the sidebar collapses to a bottom tab bar, and the demo stays usable at 375px.

---

## 8. Lead capture

### 8.1 Start a Project (`start.html`)
Multi-step form with a progress bar. Every step works with the keyboard.
1. **Organization type:** Business / Church / School / Nonprofit / Other.
2. **What you need** (choose several): Website, Mobile App, Client/Member Portal, CRM, CRM Integration, Booking, Payments/Giving, Automation, Not sure.
3. **About you:** organization name, current website (optional), current tools (free text, e.g. "Planning Center, Mailchimp").
4. **Timeline:** ASAP / 1–3 months / 3–6 months / Exploring. **Budget range** (optional): under $5K / $5–15K / $15–50K / $50K+ / Not sure.
5. **Contact:** name, email (required), phone (optional), preferred contact method, message.

- `?design=<slug>` pre-fills a "Inspired by: <Design name>" chip.
- A hidden honeypot field plus **Cloudflare Turnstile** protect against spam.

### 8.2 Free Mockup (`mockup.html`)
- Fields: organization name, type, current website, a style chip (Modern / Classic / Bold / Minimal), a logo upload (optional, max 5MB, png/jpg/svg), email and name.
- Copy: "We'll design a homepage concept for your organization, free. Usually within 3–5 business days." The owner will confirm this turnaround (§11).

### 8.3 Backend
- Both forms send `POST /api/lead` with JSON (the logo is uploaded first to Supabase Storage through a signed upload URL issued by the Worker).
- The Worker:
  1. verifies Turnstile
  2. validates the fields and checks lengths
  3. inserts into `leads` using the service key
  4. emails the owner (`LEAD_EMAIL`, currently amanorsac@gmail.com) through Resend (subject: `New lead: <type> — <org>`)
  5. sends a short confirmation email to the visitor
  6. returns `{ok:true}`
- If something fails, the visitor sees a friendly error with a fallback email link to `LEAD_EMAIL`. The form keeps everything they typed.
- **`leads` table:** `id, created_at, kind ('project'|'mockup'), org_type, org_name, needs text[], website, tools, timeline, budget, design_slug, style, logo_path, name, email, phone, contact_pref, message, status ('new'|'contacted'|'won'|'lost') default 'new'`.
- RLS is on, with **no anon access** of any kind. Only the Worker's service key reads or writes.
- **Viewing leads (v1):** the owner uses the Supabase dashboard table view plus the email notifications. A leads admin page is phase 2.

---

## 9. SEO, performance, analytics

- Every page gets its own title, meta description, Open Graph image and canonical URL.
- The Worker builds `sitemap.xml` from the static pages plus `designs.json`.
- Structured data: `Organization`, `ProfessionalService` and `BreadcrumbList`.
- Images are lazy-loaded with `srcset`. The hero image is preloaded. No frameworks, and the JS for any one page stays under about 50KB.
- Analytics: Cloudflare Web Analytics (cookieless, so no cookie banner is needed). Lead form submissions are tracked as events.
- Accessibility:
  - semantic landmarks and a skip link
  - visible focus rings (gold)
  - form labels and error messages linked to their fields
  - carousels you can stop and drive with the keyboard
  - alt text on every image

---

## 10. Testing

- **Manual checks** at 375, 768, 1280 and 1920px in Chrome, Safari and Firefox.
- **Lighthouse** on Home, Designs, one Design page, Start and Demo, against the §1 targets.
- **Forms:**
  - a successful submission inserts a row and sends both emails
  - a Turnstile failure is rejected
  - oversized or wrong-type logos are rejected
  - the honeypot catches bots
  - the failure path keeps what the visitor typed
- **Demo:** every action works, Reset restores the seed, nothing hits the network (checked in DevTools), and it works with storage blocked.
- **Catalog:** an invalid or missing slug shows a "Design not found" page that links back to the shop. Sections without images are hidden.
- **Link and alt check** across all pages before launch.

---

## 11. Owner inputs needed (do not block building)

1. The **domain** name.
2. ~~The **contact email** that receives leads.~~ **Decided:** `amanorsac@gmail.com` for now. It is stored as the Worker variable `LEAD_EMAIL` so it can be changed later without code edits.
3. The **turnaround promise** for free mockups.
4. **Logo source files**, if they exist. Otherwise the logo is redrawn as SVG from the brand board.
5. Any **"more details"** the owner said were coming.

Until these arrive, the build uses clearly marked placeholders.

---

## 12. Phase 2 (not in v1)

- Free website audit tool (speed, SEO and accessibility score).
- A leads admin page and a portal for real CTSD clients (reusing the amanorsac.studio portal).
- Real case studies replacing "Concept" designs once clients sign off.
- A blog and content per vertical ("church website cost", "Planning Center website", "school ADA compliance").
- More designs (Nonprofit-specific, Healthcare, Multi-location business).
