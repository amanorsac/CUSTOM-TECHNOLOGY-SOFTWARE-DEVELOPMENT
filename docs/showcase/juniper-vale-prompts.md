# Juniper & Vale: photo and video prompts

Generate these in Higgsfield with **Nano Banana**, then save them to
`assets-src/juniper-vale/` using the file names below (PNG or JPG is fine). Then run
`node scripts/showcase-assets.mjs juniper-vale` and
`node scripts/depth-map.mjs public/assets/showcase/juniper-vale/img/hero.webp`. Each
one replaces a placeholder cropped from the concept image.

**Shared style (add to every prompt):** *architectural real-estate photography, natural light, clean
modern Pacific Northwest homes, warm wood, white walls, soft greenery, crisp verticals, no text, no logos,
no people.*

| File | Size | Prompt |
|---|---|---|
| `hero.jpg` | 16:9, 2K | A single-story modern home with a flat overhanging roof and floor-to-ceiling glass, at **golden hour**, the sun low in the **upper-left** behind trees. The house sits **right of center**; leave the **lower-left third calm and darker** for the headline. Interior lights just switched on, a sofa visible through the glass. Eye-level camera, slight wide angle. |
| `home-linden.jpg` | 4:3 | Two-story craftsman with a deep porch and young maple tree, late afternoon. |
| `home-harbor.jpg` | 4:3 | Bright corner townhouse with a roof terrace, three streets from a marina, blue hour. |
| `home-ridge.jpg` | 4:3 | Cedar-clad modern cabin on a hillside, mountains behind, morning mist. |
| `home-maple.jpg` | 16:9 | White farmhouse with black window frames, gravel drive, overcast soft light. |
| `home-oak.jpg` | 16:9 | Mid-century ranch with a carport and a big oak tree, warm afternoon. |
| `home-cedar.jpg` | 16:9 | Narrow three-story urban infill home, vertical cedar slats, street trees. |
| `room-living.jpg` | 21:9, 2K | **Staged** open-plan living room: linen sofa, oak floor, wool rug, plants, art, warm daylight from big windows. |
| `room-living-before.jpg` | 21:9, 2K | **The same room, same camera, empty and unstaged:** bare floor, dated beige walls, flat light. (Generate from `room-living.jpg` as the reference so the two line up for the before/after slider.) |
| `room-kitchen.jpg` | 16:9 | Kitchen with a white quartz island, oak stools, pendant lights. |
| `street.jpg` | 16:9 | A leafy residential street of modern homes, people-free, golden light. |

## Video (later, needs Higgsfield credits)

Kling 3.0, standard mode, sound off, 5–8 seconds:

- **`hero-loop.mp4`:** from `hero.jpg`: *Locked-off camera. Leaves sway gently, the sun flares softly through the trees, interior lights warm slightly. Seamless loop.* (A future option; the depth-map hero already moves.)
- **`room-walk.mp4`:** from `room-living.jpg`: *Slow dolly forward through the living room toward the window, steady and smooth.*
