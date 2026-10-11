# Mira's Sartorial: draft store ("The Maison")

Date: 2026-10-11. Status: approved in conversation, awaiting written-spec review.

## Purpose

Mira's Sartorial is CTSD's second client. They are a custom fashion label: bridal, bespoke, custom, corporate and wedding-guest work. This draft is a sample store that CTSD shows the seller to win and shape the project.

Success means that:
- the seller sees her own work presented with the calm, premium feel of a luxury house
- every path ends in a custom-order conversation on WhatsApp
- every missing fact is visibly a placeholder, so nothing false is shown as real

**What the owner asked for:**
- a sample fashion store with the feel of the Louis Vuitton site
- a seller bio
- the seller's Instagram videos
- custom orders only
- WhatsApp ordering, with a QR code as a placeholder

**Owner answers:**
- The woman in the blue outfit is the seller, and the owner will send her bio.
- Prices read "Price on request".
- The direction is "The Maison".

## Ground rules

- **Location.** The draft is unlisted at `/preview/miras-sartorial`, built like the Kezia Woods draft. It sits under `/preview/`, so it is already noindexed (`X-Robots-Tag`), disallowed in robots.txt and absent from the sitemap. The page also carries `<meta name="robots" content="noindex, nofollow">`.
- **Reference only.** Louis Vuitton is a reference for feel only. No Louis Vuitton name, logo, monogram, colours, copy or layout is reproduced, and nothing on the page mentions them.
- **Nothing is sent.** No form posts, no fetch and no analytics. The WhatsApp request builds a message and shows it, and nothing more, until the number is confirmed (see WhatsApp).
- **Placeholders.** Every placeholder carries a visible "Placeholder" tag and a `data-placeholder` attribute, so a test can list them all. They are:
  - the bio
  - the seller's name
  - the reels
  - the QR code
  - the WhatsApp number
  - the making timeline
- **Public facts.** The only facts used are on her public Instagram profile, @miras__sartorial_:
  - the name "Mira's Sartorial"
  - the services: bridal, bespoke, custom, corporate, wedding guest
  - TikTok @miras_sartorial
  - the phone number 055 701 8888, which is not used until the owner confirms it is her WhatsApp
- **Naming.** Text uses "Mira's Sartorial". The logo image stays as supplied ("MIRAS SARTORIAL").

## Images

The sources are the owner's files. `scripts/client-assets.mjs miras-sartorial` processes them into `public/assets/preview/miras-sartorial/img/` as WebP, at widths of 480, 960 and 1600 where the source allows, with `width` and `height` set.

| Source | Use |
|---|---|
| Four-model portrait (6) | Hero on phones; Yellow Floral model crop |
| Four-model wide (8) | Hero on desktop |
| Purple Swirl flat (4), Pink Swirl flat (9), Multi Abstract flat (7) | Card and gallery flats |
| Catalogue sheet (5) | Red Floral flat, side, back, waist and fabric crops. The baked-in text labels and icon row are cut off. |
| Models (6/8) | Per-print model crops for the hover swap and the gallery |
| Logo (10) | Header and footer. Its white background is trimmed, and a transparent PNG and WebP are exported. |
| Portrait (11) | The atelier section. The sparkle mark in the bottom-right corner is cropped out. |

Yellow Floral has no flat shot, so its card and gallery use the model crop only.

## The page

One HTML page, `public/preview/miras-sartorial.html`, plus `public/assets/preview/miras-sartorial/{ms.css, main.js, fonts/}`. Fonts are self-hosted:
- **Cormorant Garamond** (500 and 600, plus 500 italic) for headings, chosen as close to the logo's lettering
- **Jost** (400 and 500) for everything else

### Look

| Role | Value | Use |
|---|---|---|
| Paper | `#FFFFFF` | Page |
| Ink | `#141210` | Text |
| Muted | `#6B625B` | Secondary text, 5.9:1 on white |
| Sand | `#F4EDE3` | Alternate sections |
| Espresso | `#2A1A10` | Footer |
| Sun | `#F2A20C` | WhatsApp actions only, with ink text on it (8.8:1) |
| Line | `rgba(20,18,16,.12)` | Rules |

The page is mostly white, with generous space, thin rules and uppercase spaced labels. Every text pairing meets WCAG AA.

### Sections, in order

1. **Header.** A menu button on the left opens a full-height panel with the section links. The logo sits centred, and a WhatsApp icon on the right jumps to the order section. The header is sticky and shrinks to a slim bar after 80 px of scroll.
2. **Hero.** A full-bleed photo (the wide shot on desktop, the portrait on phones) under the line "Made to order. Made for you." A "Discover the edit" link scrolls to the edit. The photo drifts in a slow scale, 1.0 to 1.06 over 20 s.
3. **The Wide-Leg Edit** (`#edit`). An intro line reads "Five prints. One silhouette. Cut to your measurements." Below it, a grid of five cards: Red Floral, Purple Swirl, Pink Swirl, Multi Abstract and Yellow Floral.
   - Each card shows the flat, which crossfades to the model crop on hover or focus. Below the image are the name and "Price on request".
   - The grid has 4 columns at 1200 px and up, 3 at 900, and 2 below that. Yellow Floral wraps.
   - Each card is a link to `#piece-<slug>`.
4. **What we make** (`#make`). Five rows: Bridal, Bespoke, Custom, Corporate and Wedding guest. Each has one line of copy and a "Start a request" link that opens the order section with that service preselected.
5. **The atelier** (`#atelier`). The portrait sits beside a bio block. The heading is "The hands behind the label". The bio paragraph and her name are placeholders, reading "Bio coming from the seller" and "Name coming from the seller".
6. **From her Instagram** (`#reels`). Three 9:16 frames. Each is a placeholder card with the logo, "Reel coming soon" and a "Placeholder" tag. Links below go to Instagram @miras__sartorial_ and TikTok @miras_sartorial, opening in a new tab with `rel="noopener"`.
7. **How custom orders work.** Three steps:
   1. "Choose a print or a service."
   2. "Send your measurements on WhatsApp."
   3. "We make it for you."

   The time to make it is a placeholder: "Timeline confirmed with the seller".
8. **Order on WhatsApp** (`#order`). A square QR placeholder with a dashed border, "QR code" and a "Placeholder" tag. Beside it are a service select (the five services plus "A piece from the edit"), a note field and a "Request on WhatsApp" button (see WhatsApp).
9. **Footer.** Espresso background, the logo, the section links, the Instagram and TikTok links, "© Mira's Sartorial", and "Draft by CTSD · Not yet published".

### A piece's view

Opening `#piece-<slug>` shows a full-screen `<dialog>`. It also opens by clicking a card or loading the hash directly. It contains:

- **Gallery:** the flat, the model crop, and for Red Floral the side, back, waist and fabric crops. Thumbnails sit below the main image. Arrow keys and swipe change the image.
- **Copy:**
  - the name
  - "Price on request"
  - the details: "Lightweight, breathable fabric", "Elastic gathered waist with side ties", "Wide, flowy leg", "Easy care"
- **Request form:**
  - size: XS, S, M, L, XL, 2XL, 3XL, or "My own measurements"
  - a measurements field (waist, hips, length), required only for "My own measurements"
  - a note
  - a "Request on WhatsApp" button

Escape, the close button and the browser's Back button all close it and clear the hash, and focus returns to the card. Opening it adds a history entry, so Back closes it.

### WhatsApp

The number lives in one setting, a `data-whatsapp` attribute on `<body>`, and it is empty in the draft.

**With the number empty, "Request on WhatsApp":**
- validates the form
- builds the message
- shows it in a panel headed "Your message", with a copy button
- adds the note "WhatsApp opens here once the seller's number is confirmed"

No link opens and nothing is sent.

**Once the number is set**, the button opens `https://wa.me/<number>?text=<message>` in a new tab, and the QR placeholder is replaced by a QR code for that link.

The message format:

```
Hello Mira's Sartorial, I'd like to request a custom piece.
Piece: Purple Swirl wide-leg trousers
Size: M
Note: For a wedding in December.
```

For a service request, the "Piece" line reads "Service: Bridal". Measurements, when given, add a "Measurements:" line.

### Motion

- Images reveal with a clip-path wipe from the bottom as they enter, 0.9 s.
- Section headings fade up 16 px.
- Cards lift 4 px on hover.
- The hero drifts.
- The dialog opens with a 0.35 s fade and a 2% scale.

All of it is IntersectionObserver and CSS, with no libraries. Under `prefers-reduced-motion`, everything is static and visible at once. Without JavaScript, all content is visible: the cards link to the order section, and the dialog content is in the HTML.

## Testing

`tests/e2e/miras.spec.js`, following `kezia.spec.js`, in Chromium and WebKit.

**Page and indexing**
- The page loads with one h1, no console errors and no horizontal scroll at 375 and 1280 px.
- Axe finds no serious or critical violations at 375 and 1280 px, with the dialog open and closed.
- The response carries `X-Robots-Tag: noindex, nofollow` and the robots meta. The page is absent from `/sitemap.xml`.

**The edit and the dialog**
- Five cards show "Price on request". Hover or focus swaps to the model image.
- Clicking Purple Swirl opens the dialog. Escape closes it, focus returns to the card, and the hash clears.
- Loading `#piece-pink-swirl` opens that piece.
- The gallery changes with arrow keys.

**WhatsApp**
- An empty form shows errors. "My own measurements" requires the measurements field.
- With the number empty, a valid request shows the exact message, and no request leaves the page.
- With `data-whatsapp` set in a test, the button points to `wa.me` with the encoded message.
- The service select builds a "Service:" line.

**Placeholders and fallbacks**
- Every `[data-placeholder]` has a visible "Placeholder" tag. The test lists the expected set: bio, name, three reels, the QR code, the timeline.
- The Instagram and TikTok links point to the right profiles and open in a new tab.
- Reduced motion leaves all content visible with no transitions running.
- Without JavaScript, all five pieces and the order section are visible.

## Out of scope

- Real reels, the bio and her name, which come from the owner.
- The WhatsApp number, until confirmed.
- A live store, payments or a cart.
- A custom domain.
- Any page beyond this one.
