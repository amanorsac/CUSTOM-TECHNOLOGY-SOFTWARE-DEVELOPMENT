# Kingsley Anyenor: draft artist website ("Crimson altar")

**Status:** design approved in chat on 2026-11-16. This is a **draft to pitch to him**. Branch `build/kingsley`. Do not merge to `main` without asking.

## Who and why

Kingsley Anyenor is a Ghanaian gospel minister, worship leader and songwriter based in Accra. His ministry runs through **The Refined**, a non-denominational music and outreach group that is also his band, choir and music imprint. Sources: the brief "The Refined.pdf" supplied by the owner, his YouTube channel, Instagram, Spotify and Apple Music pages.

- **Motto:** "Revived to revive". Rooted in Malachi 3:1–3.
- **Pillars:** Revival, Consecration, Restoration (wording from the brief, used verbatim).
- **Quote:** "A new generation arose who knew not Jesus but they met me! I reveal the Glorified Jesus in my generation!"
- **Catalogue:** the *Deeper Worship* series (Vol. 1, Vol. 2, 3.0, 4.0, 5.0, 6.0), Ghana Worship Medley, Ghana Praise Medley, singles (Praise The Lord, Holy are you Lord, God of Israel, Ayeyi Ndwom, Amen, Isaiah 63, We Will Not Bow, Be Lifted High, Your Spirit and others), *THE UNVEILED* (feat. Vivi Adjei), HOLY (feat. Philip Adzale), Pentecost (feat. Siisi Baidoo), Maranatha (feat. Vivi Adjei).
- **Gatherings:** The Refined Experience and New Wineskin, in Accra. Refined Experience 2027 is "coming soon" with no date.
- **Band credits:** Apostle Kubi (producer/piano), Theophil Jed Jnr (music director), Joojo Forson (drums), Stephen Amanor Sackey (mixing/mastering).
- **Channels:** YouTube `@kingsleyanyenor` (4.41K subscribers, 52 videos on 2026-11-16), Instagram `@kingsleyanyenor`, Spotify artist `1TlaDAmkhwEJv7qz6WfsqE`, Apple Music artist `1561319671`.

**Goal:** an artist website. Music comes first: his songs are embedded and playable, and the latest release is always on show. Booking and events are secondary.

**Success:** a visitor can play his newest release within one click of landing, and can reach any song in the catalogue in two. Kingsley sees it and wants it.

**Starting point:** joemettlemusic.com, for its structure only (simple menu, portrait hero, one big quote, a page per release, band page, events tabs, detailed booking form). Not a copy: our look, layout, copy and code are our own, and we add music to the home page, which that site lacks.

## Guardrails

- **Draft, unlisted.** Served under `/preview/kingsley/`. Each page carries `<meta name="robots" content="noindex, nofollow">`. The worker already sends `X-Robots-Tag: noindex, nofollow` for `/preview/` paths. Not in the sitemap, not linked from the CTSD site. A thin top bar reads "Concept for Kingsley Anyenor · prepared by CTSD · not yet published".
- **Facts only.** No invented dates, venues, numbers, awards or testimonials. View counts are not shown (they go stale). The Praise Achievement Awards line says "nominated" and nothing more.
- **Media.** Photos come only from the owner's Drive folder "KINGSLEY ANYENOR". Music plays only through official YouTube, Spotify and Apple Music embeds and links. Nothing is downloaded or re-hosted from those services.
- **Privacy.** YouTube embeds use `youtube-nocookie.com`. No third-party iframe loads until the visitor clicks play.
- **Palette.** The CTSD navy/ember palette is not used here. This site has its own.

## Identity

- **Colours:** altar black `#0D0A0A`, deep crimson `#8E1616`, crimson glow `#C8281E` (stage wash, used in gradients and rules), amber `#E8A03A` (buttons and highlights), cream `#F4EBDD` (text on dark), blush grey `#E6DEDB` (light sections on The Refined), muted `#A89C92`.
- **Type (self-hosted):** Fraunces for headings and the big quote, Inter for body and UI.
- **Feel:** a dark stage lit in crimson with warm spotlights. Full-bleed live photos. Motion is slow and calm: fades and gentle rises of 300–500 ms, respecting `prefers-reduced-motion`. Nothing bouncy.
- **Logo:** a text lockup "KA | THE REFINED" set in type until he supplies the real file.

## Pages

All pages share a header (wordmark, menu, icons for YouTube, Spotify, Apple Music, Instagram), a footer, and the persistent player bar.

Menu: **Home · Music · The Refined · Events · Book · Contact**

The ministry *is* The Refined, so there is one page for both, not two.

### 1. Home (`/preview/kingsley/`)
1. **Hero carousel.** A full-screen, edge-to-edge carousel of wide stage photos, led by `_MG_9033` (choir in white on the crimson stage) and followed by three or four similar frames (`_MG_9032`–`9035`, `AMH_5848`–`5851`). Slides cross-fade every 6 seconds with a slow zoom; arrows, dots and swipe let visitors move by hand; it pauses on hover and focus, and under reduced motion it shows the first slide only. The wordmark, "Revived to revive" and two buttons sit over a dark gradient at the bottom left: "Listen now" (scrolls to Latest Release) and "Book Kingsley". The first slide is in the HTML and preloaded; the rest load after.
2. **Latest Release.** The newest YouTube upload, filled in from `/api/kingsley/latest`: thumbnail with a play button, title, release date, and "Listen on Spotify / Apple Music / YouTube" buttons. Play loads the video into the player.
3. **Popular.** Three fixed picks: Deeper Worship 3.0, Ghana Worship Medley, Ghana Praise Medley.
4. **Quote band.** His quote, alone, in large Fraunces on altar black.
5. **Live video band.** A full-width, edge-to-edge band directly under the quote, as on joemettlemusic.com: a wide performance image with a single play button. Clicking it plays the newest live video in the player, expanded. In the draft the band is a still stage photo. When he supplies a 10–15 second clip, it becomes a muted, looping, self-hosted video (paused under reduced motion), with the same play button.
6. **Pillars.** Revival, Consecration, Restoration with the brief's one-line descriptions, linking to The Refined.
7. **Spotify artist player.** The official artist embed, loaded on click.
8. **Events strip.** One slim line: "The Refined Experience 2027 · coming soon", linking to Events.

### 2. Music (`/preview/kingsley/music/`)
- **Deeper Worship** as numbered cards, Vol. 1 to 6.0, newest first.
- **Singles and live videos**, **Medleys**, and **THE UNVEILED** as further groups.
- Each card shows the thumbnail, title, year and a play button, and links to its release page.

### 3. Release page (`/preview/kingsley/music/<slug>/`)
One per release in the catalogue. Cover or thumbnail, title, type, year, featured artists, credits where known, the YouTube video (click to load), a Spotify embed where the release has a Spotify link, and the three streaming buttons. Buttons without a known link are left out, not shown as dead links.

### 4. The Refined (`/preview/kingsley/the-refined/`)
The ministry page. In order: what The Refined is and "Revived to revive" (Malachi 3:1–3); Kingsley's story with a studio portrait; the three pillars in full; the worship philosophy ("a natural response to the greatness of God"); the band and choir with the four credited collaborators and their roles; a gallery of stage photos; the awards nomination. Light blush-grey sections break up the dark.

### 5. Events (`/preview/kingsley/events/`)
- **Upcoming / Past** tabs.
- Upcoming holds one card: "The Refined Experience 2027 · coming soon · Accra", with no date and no RSVP.
- Past holds The Refined Experience gatherings with photo galleries from the Drive subfolders "REFINED NEW" and "REFIENED EX OLD". No dates are stated unless he supplies them.
- New Wineskin is named as a flagship gathering in the intro text.
- **RSVP is out of scope for this build** (see Later phases).

### 6. Book (`/preview/kingsley/book/`)
A booking form for churches and programmes: organiser type (church, conference, campus, other), organisation name, contact name, phone (defaults to +233), email, host pastor or minister, event name, date, start time, expected length of ministration, other ministers, venue and city, country, notes.

### 7. Contact (`/preview/kingsley/contact/`)
A short message form (name, email, message) and the social and streaming links. No address, phone or email is printed until he supplies them.

## How it works

### Files
- Pages: `public/preview/kingsley/**/index.html`, static HTML like the rest of the site.
- Assets: `public/assets/preview/kingsley/` holding `css/site.css`, `js/app.js`, `js/player.js`, `js/nav.js`, `fonts/`, `img/`, and `data/catalogue.json`.
- Worker: `src/routes/kingsley-latest.js`, registered in `src/worker.js`.

### Catalogue (`data/catalogue.json`)
The single source for every release. Each entry: `slug`, `title`, `group` (deeper-worship, single, medley, unveiled), `year`, `youtubeId`, `featuring`, optional `spotifyUrl`, optional `appleUrl`, optional `credits`. The Music page and release pages are generated from it by a small build script, `scripts/build-kingsley.mjs`, so adding a song is one JSON entry. YouTube IDs and per-release Spotify links are collected during the build; Apple links are already known for 12 releases.

### Latest release route
- `GET /api/kingsley/latest` fetches YouTube's public channel feed (`https://www.youtube.com/feeds/videos.xml?channel_id=<id>`), takes the newest entry and returns `{ ok, youtubeId, title, published, source: "feed" }`.
- Shorts are skipped: the route returns the newest entry whose feed link does not contain `/shorts/`.
- The response is cached with the Workers Cache API for 30 minutes.
- If the feed fails or returns nothing, the route returns the first entry of the catalogue with `source: "fallback"` and status 200.
- The home page ships with the fallback release already in its HTML, then swaps in the feed result. If the request fails, the page stays as shipped. If the returned ID matches a catalogue entry, that entry's streaming links are used; otherwise only the YouTube button shows.

### Persistent player
- A bar fixed to the bottom of the screen: thumbnail, title, play/pause, next, and an expand button that shows the video.
- It wraps one YouTube IFrame Player (`youtube-nocookie.com`), created on the first play click.
- `nav.js` swaps page content without a full reload: it intercepts same-site links under `/preview/kingsley/`, fetches the page, replaces `<main>` and the title, and updates history. The player bar sits outside `<main>`, so playback continues. If the fetch fails or JS is off, links work as normal page loads and the music simply stops.
- The queue is the group the visitor started from (for example, the Deeper Worship series).

### Forms
- Book and Contact post to the existing `/api/lead` route with a `source` of `kingsley-book` or `kingsley-contact`, reusing its honeypot, Turnstile and email handling. The route's validation is extended only as far as needed to accept these two sources and their fields.
- On branch previews, where Supabase is switched off, the forms behave like the CTSD forms do there: the email fallback.
- Success shows an inline confirmation. A failure shows a plain message and keeps what the visitor typed.

### Images
Drive photos are downloaded once, resized to at most 2000 px wide, and saved as WebP with a JPEG fallback. The 13–21 MB portraits end up under 300 KB each. Every `<img>` has width, height and alt text; images below the fold are lazy-loaded.

## Testing

- **Unit (vitest):** the feed parser (normal feed, empty feed, malformed XML, Shorts skipped), the fallback path, and catalogue validation (unique slugs, every entry has a `youtubeId`).
- **Worker tests:** `/api/kingsley/latest` returns 200 with the right shape on feed success and on feed failure, and sets cache headers. `/preview/kingsley/` responses carry `X-Robots-Tag: noindex, nofollow`.
- **End to end (Playwright):** the hero carousel advances, responds to arrows and stops under reduced motion; the video band play button starts the player; home shows a latest release with the feed mocked and with it failing; the Music page lists every catalogue entry; a release page loads its embed only after a click; music keeps playing across a page change; Book form validation and success state; no horizontal scroll at 375 px.
- **Checks:** keyboard access to the player and menu, visible focus, colour contrast of cream and amber on black, reduced-motion honoured.

## Later phases (not in this build)

- **RSVP for gatherings:** `POST /api/rsvp`, a Supabase `rsvps` table and a passcode-protected list for his team. Built when Refined Experience 2027 has a date. It gets its own spec.
- **Going live:** his own domain, moving the pages out of `/preview/`, removing the concept bar and the noindex.
- **Giving or partnership:** not requested.

## To confirm with Kingsley

1. The logo file (the draft uses a typed lockup).
2. Who receives booking and contact emails (the draft sends to the CTSD `LEAD_EMAIL`).
3. Refined Experience 2027: date, venue, and whether New Wineskin has a date.
4. Dates and names for the past gatherings in the two photo folders.
5. Contact details he wants public, if any.
6. Any release missing from Spotify or Apple Music, and his preferred "popular" three.
7. A 10–15 second live clip for the home video band, and which photos he wants in the hero carousel.
