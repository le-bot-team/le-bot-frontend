# Design Token Quick Reference (Pointer)

The authoritative design token registry lives one directory up at
[`../tokens.md`](../tokens.md). That file is the project's living record of every
Blue Lake design token that has been verified against raw JSON — it grows with
every module sync.

Keep `tokens.md` at the skill root (sibling of SKILL.md) because:

- It is **data**, not methodology. Methodology files live under `references/`.
- It is referenced by multiple pages during an ongoing task and needs a short path.
- It already contains many cross-references that would break if moved.

---

## At-a-glance (auth module)

For quick recall only — always read `../tokens.md` for the full verified table
before writing code.

- **Primary button**: `311×56px`, radius `28px`, `rgba(18,14,44,1)` solid
- **Weak button**: `311×56px`, `1px solid rgba(33,186,69,1)`, text `rgba(99,104,104,1)`
- **Input field**: `311×48px`, `background rgba(255,255,255,1)`, radius `8px`,
  border `1px solid rgba(147,152,169,0.2)`
- **Verification code row**: code input `172×48px` + send button `127×48px`,
  gap `12px` (two independent input-groups in `.input-row`)
- **Stacked input vertical gap**: `12px` between ALL adjacent form elements
- **Read-only display fields** (email/phone): same `311×48px` input-group
  container with `--readonly` modifier
- **Placeholder**: `15px Regular`, `rgba(147,152,169,1)`
- **Error text**: `15px Medium`, `rgba(255,93,93,1)`
- **Link text**: `15px Regular`, `rgba(32,204,249,1)`
- **Font**: `AlibabaPuHuiTi` (Medium=500, Regular=400)

---

## Modules currently documented in `tokens.md`

- Typography, Buttons, Inline Action Links, Input Fields (auth module baseline)
- Page Background Gradient (auth) + Neutral Background (me module `#F1F8F8`)
- Cards & Menu Rows (me module)
- Danger Button (me module, 335×56)
- Profile Avatar (me/profile)
- MePage Highlight Cards (会员中心 / 服务中心) + glow shapes 171/172 + icon slices
- Profile ID Account label
- Brand Colors registry
- Sizing table
- HomePage (ed2b5fdd): artboard, hero glows, speech bubble, mascot placeholder,
  top nav, hot topics, bottom tab, slice mapping, global theme cascade
- SettingsPage (daac9da5): layout, menu row typography, menu groups, bottom
  action, i18n keys
- VoiceprintPage (94e98b66): layout, row typography, add button, decisions, i18n
- Voiceprint DetailPage (d2a7b5f3): full layout + typography + decisions + i18n
