# Lanhu UI Sync — 9-Step Workflow

Full expansion of the sync workflow referenced by SKILL.md. Use this file when actually
executing a sync task — each phase tells you which tool to call and what artifact to
produce.

```
Task Progress for [module-name]:
- [ ] Step 1: Identify target design image_ids
- [ ] Step 2: Fetch parsed JSON via lanhu_get_design
- [ ] Step 3: Extract fills/gradients from raw JSON (MUST search ALL shape types)
- [ ] Step 4: Download screenshots for visual reference
- [ ] Step 5: Download slices (icons/images) if needed
- [ ] Step 6: Generate diff report (8 dimensions)
- [ ] Step 7: Apply fixes using gradient overlay method
- [ ] Step 8: Build verification
- [ ] Step 9: Visual confirmation
```

---

## Phase 1 — Identify & Fetch (Steps 1–3)

### Step 1. Pick design image_ids

Search `page/lanhu-mcp-assets/all-designs.json` for designs matching the target module
by name keyword. Record each target's `id` (used as `image_id`) and `name`.

### Step 2. Fetch parsed JSON (`lanhu_get_design`)

Call `lanhu_get_design` for each image_id. **You MUST pass the full URL containing
`pid` and `tid`**:

```
https://lanhuapp.com/web/#/item/project/detailDetach?pid={pid}&tid={tid}&image_id={image_id}
```

Passing only `image_id` or a bare `stage?image_id=` URL will NOT work — lanhu-mcp needs
the project context to fetch raw node data. The tool writes the parsed (UnoCSS-tagged)
tree to `page/lanhu-mcp-assets/designs/{image_id}.json`.

Project constants:

- `tid` = `043c655d-def8-4d64-8b42-11143b799069`
- `pid` = `aba59ed3-cb41-4ddb-9e79-ccb13b416f04`

### Step 3. Extract fills/gradients from raw JSON

**CRITICAL** — the parsed JSON does NOT contain fill/gradient colors for shape nodes.
You MUST work from raw JSON. See [`./raw-json.md`](./raw-json.md) for the full extraction
methodology (including gradient-type decoding, alpha model, radial geometry, and
`fetch-raw.mjs` usage).

Minimum you should extract per shape: `fills[]`, `borders[]`, `shadows[]`, and
`radius` / `paths[].radius`.

---

## Phase 2 — Visual Assets (Steps 4–5)

### Step 4. Download screenshots (`lanhu_get_screenshot`)

Save to `page/lanhu-mcp-assets/screenshots/{image_id}.png` for visual reference during
the diff and during final verification.

### Step 5. Download slices (`lanhu_download_slices`)

Only run when the page needs bitmap assets (icons, avatars, decorative images).
The tool emits slices as generic `icon-1.png`, `icon-2.png`, … — these filenames
are positional and do NOT encode semantics. Before using any slice, run the
SHA-256 cross-reference method described in [`./slice-mapping.md`](./slice-mapping.md).

---

## Phase 3 — Diff Analysis (Step 6)

### Step 6. Compare 8 dimensions against the current code

| Dimension               | Design Source                                      | Code Source                                 |
| ----------------------- | -------------------------------------------------- | ------------------------------------------- |
| Page background         | raw JSON `fills[0].gradient.stops`                 | Page component CSS                          |
| Button color            | raw JSON `fills[0].color.value`                    | Button CSS `background`                     |
| Button border           | raw JSON `borders[]`                               | Button CSS `border`                         |
| Input field styling     | raw JSON `fills[]`, `paths[].radius`, `borders[]`  | `.input-group` / `.design-input` CSS        |
| Dimensions              | parsed JSON `class: w-Xpx h-Ypx`                   | CSS `width` / `height`                      |
| Text styles             | parsed JSON `text.style.font` / `color`            | CSS font properties                         |
| Text content            | parsed JSON `text.style.content`                   | Vue template text / placeholder             |
| Inline action buttons   | parsed JSON text node inside shape                 | HTML element + class                        |
| **Component structure** | parsed JSON shape hierarchy (sibling shapes)       | DOM element tree                            |
| **Element visual role** | parsed JSON shape dimensions matching input fields | HTML class usage (`.input-group` vs custom) |
| **Vertical spacing**    | Y-coordinate deltas between consecutive shapes     | CSS margin-top / gap between siblings       |

The output of this step is a written diff report (bullet-list or table) that the
user can audit BEFORE you start editing files.

---

## Phase 4 — Apply & Verify (Steps 7–9)

### Step 7. Apply fixes using the gradient overlay method

Apply changes in cascade order so upstream variables propagate to downstream pages
automatically:

1. **Global CSS variables** (`src/css/app.scss` `:root`) — add or modify CSS custom
   properties.
2. **Page-level styles** (e.g. `AuthPage.vue`) — page background gradient, layout
   spacing.
3. **Component-level styles** — scoped CSS for buttons, inputs, text.

Rationale: design tokens live as CSS variables at the root; pages consume variables
and set page-scoped composition; components reuse variables via `var(--…, fallback)`
for resilience.

### Step 8. Build verification

Run both:

- `pnpm exec vue-tsc --noEmit` — must pass with zero errors.
- PWA build (e.g. `pnpm build` or `quasar build -m pwa`) — must pass with zero errors.

If type errors appear, fix them before moving to Step 9.

### Step 9. Visual confirmation

Open the saved screenshot (`page/lanhu-mcp-assets/screenshots/{image_id}.png`)
side-by-side with the implemented page. Confirm background, buttons, inputs, and
text accuracy. Update `tokens.md` with any new verified values.
