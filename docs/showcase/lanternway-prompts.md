# Lanternway Church: photo and video prompts

Generate these in Higgsfield with **Nano Banana**, save them to `assets-src/lanternway/` with the file names
below (PNG or JPG is fine), then run `node scripts/showcase-assets.mjs lanternway` and
`node scripts/depth-map.mjs public/assets/showcase/lanternway/img/hero.webp`. Each one replaces a placeholder
cropped from the concept images.

**Shared style (add to every prompt):** *calm editorial photography of a modern neighborhood church, warm
morning light, light oak and linen and white plaster, soft shadows, places and objects only, no people,
no text, no logos.*

| File | Size | Prompt |
|---|---|---|
| `hero.jpg` | 21:9, 2K+ | A sunlit sanctuary from the side aisle: three tall leaded windows on the **upper right**, strong morning light streaming in and casting window-shaped patches across light wooden pews, white pillar candles on the stone sills. Keep the **lower-left third quiet and softly shadowed** for the headline. Visible beams of light with a little haze. |
| `candles.jpg` | 16:9 | A row of white pillar candles on a stone ledge, warm low sun raking across the wall. |
| `pews.jpg` | 16:9 | Rows of empty light-oak pews, tall arched windows, soft daylight. |
| `bible.jpg` | 16:9 | An open Bible on a linen tablecloth, a ribbon marker, soft side light. |
| `exterior.jpg` | 16:9 | A red-brick church at dusk, every window glowing warm, a steeple against a violet sky. Leave the windows clearly visible; the footer lights them one by one. |
| `sanctuary.jpg` | 3:4 | A bright white sanctuary with a pulpit and a simple wooden cross. |
| `ledge.jpg` | 1:1 | Four candles on a deep stone window ledge, morning light. |
| `chapel.jpg` | 3:4 | A white clapboard chapel with a steeple at twilight, warm windows. |
| `linen.jpg` | 21:9 | An open Bible on a linen table, close and low, very soft light. |

## Video (later, needs Higgsfield credits)

Kling 3.0, standard mode, sound off, 5–8 seconds:

- **`hero-light.mp4`:** from `hero.jpg`: *Locked-off camera. Dust drifts slowly through the beams of morning light, the candle flames flicker gently, the light patches on the pews shift slightly. Seamless loop.* (Optional: the WebGL hero already draws beams and dust.)
- **`exterior-dusk.mp4`:** from `exterior.jpg`: *Slow push in toward the doors as the sky darkens and the windows glow brighter.*
