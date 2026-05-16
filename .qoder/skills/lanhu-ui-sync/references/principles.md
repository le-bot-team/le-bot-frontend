# 10 Core Principles

Non-negotiable rules for every Lanhu UI sync task. Pitfalls in
[`./pitfalls.md`](./pitfalls.md) are observed consequences of violating these.

---

## 1. Trust raw JSON, not screenshots — and never trust memory

Screenshots can be misleading (rounded corners create visual gradient illusion,
antialiased edges shift sampled colors). Always extract exact RGBA values from raw
JSON `fills[].color.value`. If `fills[].type == "color"`, it is solid; if
`"gradient"`, use the stops.

**CRITICAL**: Never assume two shapes with the same visual appearance share the
same dimensions, border, or radius. Measure each shape individually from raw JSON.
Never rely on "this looks like the same style" or "we used 12px elsewhere" —
extract every value every time. Hardcoding styles is the root cause of design drift.

---

## 2. Input fields are the #1 most commonly missed dimension

Parsed JSON represents input shapes as bare nodes with ONLY dimensions — no fills,
borders, or radius. These MUST be extracted from raw JSON. See
[`./raw-json.md`](./raw-json.md) → "Shape-type coverage".

---

## 3. Distinguish design placeholders from production content

Design files contain mock data that must NOT leak into production:

- `按钮文案` is a generic container name; real text lives in the child text node's
  `content`.
- `15858077935` is a demo phone number.
- Error-state text should render conditionally, never hardcoded.

---

## 4. Avoid Quasar components for design-critical elements

Quasar `q-input` / `q-btn` inject their own border, radius, background, font, and
padding styles that override design tokens. For elements that must match exact
design specs, use plain HTML (`<input class="design-input">`, `<span class="action-link">`)
with custom CSS classes referencing design token variables.

---

## 5. Always include fallback values in `var()` calls

Use `var(--clr-input-bg, rgba(255, 255, 255, 1))` so components degrade gracefully
if the global variable is missing.

---

## 6. Verify DOM structure matches design shape hierarchy

When the design shows multiple sibling shapes (e.g. two separate rectangles side by
side), each shape must correspond to an independent HTML element with its own
border, radius, and background. Merging siblings into a single container causes
missing visual separation. Check that the number of top-level visual elements in
the DOM matches the number of sibling shapes in the design.

---

## 7. Visual semantics over functional semantics

When a design shape (e.g. `矩形 1992`, 311×48px) visually looks like an input field,
the HTML element MUST use the same visual class (`.input-group`) — even if the
element is functionally read-only text, a label, or a display-only value.

**Rule**: The design shape determines the HTML class, not the functional role. If
a design rectangle has the same dimensions/style as input fields, wrap its content
in `.input-group` (with a modifier like `--readonly`) instead of inventing a new
class.

---

## 8. Use robust CSS spacing selectors — measure from design

Vertical gaps MUST be derived from actual Y-coordinate measurements in parsed JSON
(`shape.text.frame.top` deltas), not from memory or preset values. Adjacent sibling
selectors like `.input-group + .input-group` are fragile — they break when wrapper
elements (`.input-row`, error messages) sit between siblings.

**Rule**: Measure from design, then define spacing rules for ALL possible sibling
combinations:

```css
.input-group + .input-group {
  margin-top: 12px; /* value from actual design measurement */
}
.input-row + .input-group {
  margin-top: 12px;
}
.input-group + .input-row {
  margin-top: 12px;
}
```

Alternatively use `.auth-panel > * + *` or flex `gap` on the parent for
structure-agnostic spacing — but the gap value must still come from design
measurement.

---

## 9. Slice identification — never trust generic `icon-N.png` filenames

`lanhu_download_slices` emits slices in positional/alphabetical order as
`icon-1.png`, `icon-2.png`, …. The numbering does NOT correspond to visual
semantics or the `imageRef` names used in parsed JSON. See
[`./slice-mapping.md`](./slice-mapping.md) for the SHA-256 cross-reference method.

---

## 10. When 1:1 parity cannot be achieved, ESCALATE — never silently default

This skill's promise is pixel-exact parity with the design. Whenever a faithful
1:1 reproduction is blocked by ambiguity or missing information, stop and surface
the decision to the user with concrete options BEFORE writing code. Silently
picking a default, a "reasonable" fallback, or a prior convention is FORBIDDEN.

See [`./escalation.md`](./escalation.md) for trigger situations, required question format,
and the anti-patterns to avoid.
