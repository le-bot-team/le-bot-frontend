# Principle 10 — Escalation Protocol

When a faithful 1:1 reproduction is blocked by ambiguity or missing information,
you MUST surface the decision to the user BEFORE writing code. Silently picking a
default, a "reasonable" fallback, or a prior convention is FORBIDDEN.

---

## Trigger situations (non-exhaustive)

In any of these, stop and call `ask_user_question` with 2–4 concrete,
mutually-exclusive options:

1. **Responsive / viewport ambiguity**: the design is authored at a fixed
   viewport (e.g. 375×812) but the product runs at variable widths. The design
   cannot tell you whether to pin the artboard, scale proportionally, or stretch.
2. **Overflow behaviour**: a shape extends past the artboard (negative `left`,
   or `left + width > artboard.width`). Without explicit guidance the correct
   clipping strategy is unknowable.
3. **Raw JSON unavailable**: `fetch-raw.mjs` fails, cookie expired, or the
   design has no raw data. Inform the user that the available fallback (pixel
   sampling) loses gradients / radii / borders, and ask whether to proceed with
   reduced fidelity or pause until raw data is recovered.
4. **Gradient type / geometry mismatch with CSS primitives**: e.g. a Sketch
   `conic-gradient` with non-standard `transform` matrix, or a radial whose `to`
   falls outside the shape. Present the closest CSS approximations and let the
   user pick.
5. **Design values conflict across related pages**: e.g. the same component
   name has different fills in two `_raw.json` files. List both values and ask
   which is canonical.
6. **Slice CDN hash match fails**: after running `slice-mapping.mjs`, one or
   more semantic aliases have zero SHA-256 matches. Ask the user to download
   the missing slice manually or confirm the visual mapping, rather than
   guessing.

---

## Required format when escalating

Every escalation MUST include:

1. **The exact raw-JSON values you extracted** (so the user can audit them).
2. **The specific unknown / ambiguous decision point**, phrased as a question.
3. **2–4 concrete options with tradeoffs**, each grounded in either the design
   or a named engineering strategy. Do NOT include a "let me decide for you"
   option.
4. **Explicit statement of what you WILL NOT do until the user answers** (e.g.
   "I will not write any CSS for this shape until a strategy is chosen").

---

## Anti-patterns

- Writing code with a hardcoded value plus a comment like
  `// FIXME: confirm this with design` is NOT escalation. It hides the decision
  and leaves the codebase in a state that claims parity it doesn't have.
  **Escalate first; write second.**
- Producing 4 options where 3 are obviously wrong just to make one look "safe" —
  every option must be defensible.
- Continuing to code other parts of the page while the question is open without
  labeling the ambiguous region as on-hold.

---

## Recorded escalation examples

Look at `tokens.md` for real decisions that passed through this protocol; each is
tagged with an ID and a one-line rationale:

- MePage: A2 (alpha model) + B1 (glow placed directly on viewport)
- HomePage: D1 (B3 scale strategy) + D2 (mascot placeholder) + D5 (global
  primary color cascade) + D6'-a (mdi tab icons)
- VoiceprintPage: D1 (hide test button) + D2 (row caption strict)
- Voiceprint DetailPage: D1–D5 (feature scope, edit UX, avatar source, header
  title, submit spacing)

Each recorded decision pair (design context + chosen option) shows the required
format.
