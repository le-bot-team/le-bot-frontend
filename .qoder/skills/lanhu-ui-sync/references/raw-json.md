# Raw JSON Extraction & Gradient Decoding

Everything about getting authoritative design values out of lanhu. The parsed JSON
(`{image_id}.json`) that `lanhu_get_design` writes is NOT enough — fills, borders,
radii and gradient stops only live in the raw Sketch JSON.

---

## Getting raw JSON — `fetch-raw.mjs`

> **CRITICAL cognitive correction**: `lanhu_get_design` does NOT persist raw sketch
> JSON. It downloads the file, parses it internally, and writes only the UnoCSS-tagged
> parsed tree. Any `{image_id}_raw.json` in the repo was produced by the
> project-local script [`page/lanhu-mcp-assets/fetch-raw.mjs`](../../../../page/lanhu-mcp-assets/fetch-raw.mjs),
> which reuses `~/.lanhu-mcp/cookie.json` and calls the same API chain
> (`/api/project/image` → `versions[0].json_url` → OSS download).

To obtain `_raw.json` for a new design:

```powershell
node page/lanhu-mcp-assets/fetch-raw.mjs <image_id>
```

The saved file is byte-identical to what `lanhu_get_design` consumes internally —
it is the authoritative source for all `fills[]`, `gradient`, `borders[]`,
`paths[].radius`.

### When raw JSON cannot be obtained

If `fetch-raw.mjs` fails (cookie expired, network issue, no raw data for this
design), you have two fallbacks:

1. **Search other `_raw.json` files** for the same component name — same-named
   components often share styles across designs. This is preferred.
2. **Pixel sampling** via `page/lanhu-mcp-assets/pick-colors.ps1` — LAST RESORT.
   It can only recover solid colors at sampled coordinates, not gradient stops,
   radii, borders, or shape geometry. Before using this fallback you MUST inform
   the user that the result will not be pixel-exact and ask for confirmation
   (see [`./escalation.md`](./escalation.md)).

---

## Gradient type decoding (Sketch file format)

`gradient.type` is an integer, NOT a string:

| Value | CSS equivalent    |
| ----- | ----------------- |
| `0`   | `linear-gradient` |
| `1`   | `radial-gradient` |
| `2`   | `conic-gradient`  |

**Never assume a `gradient` is linear without reading `type`.** A `type=1` rendered
as `linear-gradient(135deg, …)` looks visually similar at a glance but is
mathematically wrong and will never match the screenshot exactly.

### Radial gradient geometry (type=1)

- `gradient.from` is the center, normalized 0–1 of the shape's bounding box.
- `gradient.to` is a point on the gradient's outer radius.
- `radius_px = |to − from|` scaled by the shape's `(width, height)` in px.
- When `shape.paths[0].type == "ellipse"` and `width == height`, the glow is a
  perfect circle clipped to a circular mask.

CSS equivalent:

```css
radial-gradient(
  circle <radius_px>px at <from.x * 100%> <from.y * 100%>,
  <stops…>
)
```

on a container with `border-radius: 50%` if the shape is a circle.

---

## Alpha model — layer opacity vs stop alpha

`fills[i].opacity` and `layer.opacity` are multiplied into the final alpha at render
time. In CSS, apply `fills[i].opacity` as the pseudo-element's `opacity` and keep
each stop's original alpha — this preserves the 1:1 mapping to raw JSON instead of
pre-multiplying.

> When the user explicitly requests a deviation (e.g. MePage decision A2: stops keep
> raw alpha and the pseudo-element stays `opacity: 1`), document the deviation in
> `tokens.md` with the rationale.

---

## Shape-type coverage — don't skip input fields

The single most common bug is skipping `矩形` (rectangle) shapes because they look
visually empty in the parsed JSON. For every input shape:

- Search `fills[0].color` → set `background` (typical: `rgba(255,255,255,1)`).
- Check `paths[0].radius` → set `border-radius` (typical: `8px`).
- Check `borders[]` → if empty, add a subtle border for visibility on gradient
  backgrounds (`1px solid rgba(147,152,169,0.2)`).
- Measure Y-coordinate deltas between consecutive shapes to derive spacing. Never
  assume a fixed gap.

Both the container (`.input-group`) and the inner input (`.design-input`) must
have the correct background — page gradients bleed through otherwise.

---

## `_raw.json` vs `{id}.json` quick map

| File                    | Produced by                   | Contains                                                     |
| ----------------------- | ----------------------------- | ------------------------------------------------------------ |
| `designs/{id}.json`     | `lanhu_get_design` (mcp tool) | Parsed tree with UnoCSS classes. **No fills, no gradients.** |
| `designs/{id}_raw.json` | `fetch-raw.mjs <id>` (local)  | Raw Sketch JSON. Authoritative for all color/geometry data.  |
| `screenshots/{id}.png`  | `lanhu_get_screenshot` (mcp)  | Bitmap cover, for visual diff only.                          |
| `slices/…/icon-N.png`   | `lanhu_download_slices` (mcp) | Bitmap slices, numbered positionally. Map via SHA-256.       |
