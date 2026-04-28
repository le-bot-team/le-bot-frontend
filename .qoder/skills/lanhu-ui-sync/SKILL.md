---
name: lanhu-ui-sync
description: Sync frontend UI code with Blue Lake (lanhu) design specs by fetching design tokens via lanhu-mcp tools, comparing against current implementation, and applying fixes using the gradient overlay method (global CSS → page → component layers). Use when aligning any frontend module with 蓝湖 designs, replacing UI styles, or when the user mentions 设计稿, design replacement, lanhu, or UI比对.
---

# Blue Lake Design UI Sync

## Overview

This skill syncs frontend code with Blue Lake (蓝湖) design specifications. The workflow follows a 9-step process: identify designs, fetch data, extract style tokens, compare with current code, apply fixes in a layered cascade, and verify.

## Prerequisites

- lanhu-mcp package installed (`node_modules/@star_work/lanhu-mcp/dist/index.js` exists)
- Blue Lake login cookie valid (`~/.lanhu-mcp/cookie.json`)
- On Windows: use `node node_modules/@star_work/lanhu-mcp/dist/index.js` directly (NOT `npx`)

**Project constants**:

- `tid`: `043c655d-def8-4d64-8b42-11143b799069`
- `pid`: `aba59ed3-cb41-4ddb-9e79-ccb13b416f04`
- Design data dir: `page/lanhu-mcp-assets/`

---

## Workflow

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

### Phase 1: Identify & Fetch

**Step 1** — Search `page/lanhu-mcp-assets/all-designs.json` for designs matching the target module by name keyword. Extract `id` (used as `image_id`) and `name`.

**Step 2** — Call `lanhu_get_design` for each image_id. Output is saved to `page/lanhu-mcp-assets/designs/{image_id}.json`. Contains node types (shape/text/container/icon), UnoCSS classes, and text styles.

**Step 3** — **CRITICAL**: Parsed JSON shape nodes do NOT contain fill/gradient colors. These MUST be extracted from raw JSON:

- Check if `{image_id}_raw.json` exists
- If not, search for the same component name in other `_raw.json` files — same-named components share styles across designs
- Extract `fills[]`, `borders[]`, `shadows[]`, `radius`/`paths[].radius` from raw JSON

### Phase 2: Diff Analysis

**Step 6** — Compare 8 dimensions:

| Dimension               | Design Source                                      | Code Source                                 |
| ----------------------- | -------------------------------------------------- | ------------------------------------------- |
| Page background         | raw JSON `fills[0].gradient.stops`                 | Page component CSS                          |
| Button color            | raw JSON `fills[0].color.value`                    | Button CSS `background`                     |
| Button border           | raw JSON `borders[]`                               | Button CSS `border`                         |
| Input field styling     | raw JSON `fills[]`, `paths[].radius`, `borders[]`  | `.input-group` / `.design-input` CSS        |
| Dimensions              | parsed JSON `class: w-Xpx h-Ypx`                   | CSS `width`/`height`                        |
| Text styles             | parsed JSON `text.style.font/color`                | CSS font properties                         |
| Text content            | parsed JSON `text.style.content`                   | Vue template text/placeholder               |
| Inline action buttons   | parsed JSON text node inside shape                 | HTML element + class                        |
| **Component structure** | parsed JSON shape hierarchy (sibling shapes)       | DOM element tree                            |
| **Element visual role** | parsed JSON shape dimensions matching input fields | HTML class usage (`.input-group` vs custom) |
| **Vertical spacing**    | Y-coordinate deltas between consecutive shapes     | CSS margin-top / gap between siblings       |

### Phase 3: Apply Fixes

**Step 7** — Apply in cascade order (gradient overlay method):

1. **Global CSS variables** (`src/css/app.scss` `:root`) — add/modify CSS custom properties
2. **Page-level styles** (e.g., AuthPage.vue) — page background gradient
3. **Component-level styles** — scoped CSS for buttons, inputs, text

### Phase 4: Verify

**Step 8** — Run `vue-tsc --noEmit` + PWA build; both must pass with zero errors.

**Step 9** — Visual confirmation: compare design screenshot against implemented styles for background, button, input, and text accuracy.

---

## Core Principles

### 1. Trust raw JSON, not screenshots — and never trust memory

Screenshots can be misleading (e.g., rounded corners create visual gradient illusion). Always extract exact RGBA values from raw JSON `fills[].color.value`. If `fills[].type` is `"color"`, it's solid; if `"gradient"`, use the gradient stops.

**CRITICAL**: Never assume that two shapes with the same visual appearance share the same dimensions, border, or radius. Always measure each shape individually from the design data. Never rely on "this looks like the same style" or "we used 12px elsewhere" — extract every value from the raw JSON every time. Hardcoding styles is the root cause of design drift.

### 2. Input fields are the #1 most commonly missed dimension

Parsed JSON represents input shapes as bare nodes with ONLY dimensions — no fills, borders, or radius. These MUST be extracted from raw JSON. For every input shape:

- Search `fills[0].color` → set `background` (typical: `rgba(255,255,255,1)`)
- Check `paths[0].radius` → set `border-radius` (typical: `8px`)
- Check `borders[]` → if empty, add subtle border for visibility on gradient backgrounds
- **Both the container (`.input-group`) and inner input (`.design-input`) must have the correct background**
- **Measure the actual Y-coordinate deltas between consecutive shapes to derive spacing, never assume a fixed gap**

### 3. Distinguish design placeholders from production content

Design files contain mock data that must NOT leak into production:

- `按钮文案` → generic container name; real text is the child text node's `content`
- `15858077935` → demo phone number, not production data
- Error state text → show conditionally, not hardcoded

### 4. Avoid Quasar components for design-critical elements

Quasar `q-input`/`q-btn` inject their own border, radius, background, font, and padding styles that override design tokens. For elements that must match exact design specs, use plain HTML (`<input class="design-input">`, `<span class="action-link">`) with custom CSS classes referencing design token variables.

### 5. Always include fallback values in CSS var() calls

Use `var(--clr-input-bg, rgba(255, 255, 255, 1))` pattern so components degrade gracefully even if global variables are missing.

### 6. Verify DOM structure matches design shape hierarchy

When design specs show multiple sibling shapes (e.g., two separate rectangles side by side), each shape must correspond to an independent HTML element with its own border, radius, and background. Merging sibling shapes into a single container causes missing visual separation. Check that the number of top-level visual elements in the DOM matches the number of sibling shapes in the design.

### 7. Visual semantics over functional semantics — design appearance is the only truth

When a design shape (e.g., `矩形 1992`, 311×48px) visually looks like an input field (same border, radius, background, height), the HTML element MUST use the same visual class (e.g., `.input-group`) — even if the element is functionally read-only text, a label, or a display-only value. Never use a plain `<div>` or `<span>` with ad-hoc styles when the design shows the same visual container as other input fields. This prevents style drift and position misalignment.

**Rule**: The design shape determines the HTML class, not the functional role. If a design rectangle has the same dimensions/style as input fields, wrap its content in `.input-group` (with a modifier like `--readonly`) instead of creating a separate class. Do NOT invent new CSS classes for elements that design shows as identical containers.

### 8. Use robust CSS spacing selectors for stacked form elements — measure from design

Design specs define vertical gaps between stacked form elements. These gaps MUST be derived from the actual Y-coordinate measurements in the parsed JSON (`shape.text.frame.top` deltas), not from memory or preset values. CSS adjacent sibling selectors like `.input-group + .input-group` are fragile — they break when wrapper elements (`.input-row`, error messages, etc.) are inserted between `.input-group` siblings.

**Rule**: First measure the gap from design data. Then define spacing rules for ALL possible sibling combinations in the form layout:

```css
/* Cover all adjacent combinations */
.input-group + .input-group {
  margin-top: 12px; /* value from actual design measurement */
}
.input-row + .input-group {
  margin-top: 12px; /* value from actual design measurement */
}
.input-group + .input-row {
  margin-top: 12px; /* value from actual design measurement */
}
```

Alternatively, use `.auth-panel > * + *` or flex `gap` on the parent for uniform spacing that's DOM-structure-agnostic — but the gap value must still come from design measurement.

---

## Common Pitfalls

| Problem                                                     | Root Cause                                                                                                     | Solution                                                                                                                                                                                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Input rendered transparent with only bottom border          | Input shapes skipped during raw JSON fill extraction                                                           | Always search raw JSON for ALL `矩形` shapes, extract fills + radius + borders                                                                                                                                                             |
| Design placeholder text in production                       | Text content not compared in Step 6                                                                            | Extract real text from child text nodes inside containers                                                                                                                                                                                  |
| Screenshot API returns Parse Error                          | Internal HTTP parsing issue                                                                                    | Use cached PNGs in `screenshots/` directory                                                                                                                                                                                                |
| npx lanhu-mcp fails on Windows                              | PowerShell spawn limitation                                                                                    | Use `node node_modules/@star_work/lanhu-mcp/dist/index.js` directly                                                                                                                                                                        |
| Input background not white despite correct variable         | Container `.input-group` missing `background` property; page gradient bleeds through                           | Add `background` to both container and inner input                                                                                                                                                                                         |
| Sibling shapes merged into one container                    | Design shows independent boxes (e.g., code input + send button) but code uses single container with inner divs | Split into independent HTML elements matching each design shape, each with own border/radius/background. Check ALL pages with the same pattern (SignInOrSignUpPanel, NewPasswordPanel, etc.) — the merge issue tends to recur across pages |
| Read-only field styled as plain text instead of input-group | Email/phone display uses `<div class="email-display">` with ad-hoc styles instead of `.input-group` container  | If the design shape has the same dimensions (311×48px), border, radius as input fields, use `.input-group.input-group--readonly` wrapper. Visual appearance drives class choice, not functional role                                       |
| Spacing breaks between non-adjacent .input-group elements   | CSS `.input-group + .input-group` fails when `.input-row` or other wrappers sit between them                   | Add combinators for ALL sibling pairs: `.input-row + .input-group`, `.input-group + .input-row`. Or use parent-level flex `gap` / `> * + *` selector for structure-agnostic spacing                                                        |
| Quasar components override design tokens                    | `q-input`/`q-btn` add conflicting styles                                                                       | Replace with plain HTML + custom CSS classes                                                                                                                                                                                               |
| Cookie expired                                              | Session timeout                                                                                                | Re-run `lanhu_login`                                                                                                                                                                                                                       |
| tokens.md out of sync with design data                      | tokens.md not updated alongside SKILL.md changes                                                               | Always update tokens.md when design token values change                                                                                                                                                                                    |

---

## Design Token Quick Reference

For the full verified token table, see [tokens.md](tokens.md).

Key values extracted from the login/auth module (applicable across modules):

- Primary button: `311×56px`, radius `28px`, `rgba(18,14,44,1)` solid
- Weak button: `311×56px`, `1px solid rgba(33,186,69,1)` border, text `rgba(99,104,104,1)`
- Input field: `311×48px`, `background: rgba(255,255,255,1)`, radius `8px`, border `1px solid rgba(147,152,169,0.2)`
- Verification code row: code input `172×48px` + send button `127×48px`, gap `12px` (two independent input-groups in `.input-row`)
- Stacked input vertical gap: `12px` between ALL adjacent form elements (input-group, input-row, etc.)
- Read-only display fields (email/phone): same `311×48px` input-group container, `--readonly` modifier
- Placeholder: `15px Regular`, `rgba(147,152,169,1)`
- Error text: `15px Medium`, `rgba(255,93,93,1)`
- Link text: `15px Regular`, `rgba(32,204,249,1)`
- Font: `AlibabaPuHuiTi` (Medium=500, Regular=400)
