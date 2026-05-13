# Slice Identification via SHA-256 Cross-Reference

`lanhu_download_slices` emits all slices of a design as `icon-1.png`, `icon-2.png`,
… `icon-N.png` in positional / alphabetical order. The numbering does NOT
correspond to visual semantics or to the `imageRef` names in parsed JSON (e.g.
`img_member_center_me`, `icon_msg_home`). Copying and renaming blindly produces
wrong icons in the UI — observed at 7/8 wrong mappings on MePage 84fafb58 before
this method was adopted.

---

## Authoritative method — SHA-256 cross-reference (preferred)

Each `imageRef` in parsed JSON is a CDN URL of the form:

```
https://lanhu-oss-2537-2.lanhuapp.com/MasterSlicePNG{hash}.png
```

The same binary is emitted locally by `lanhu_download_slices` as `icon-N.png`.
Download each CDN PNG and SHA-256 compare against every local `icon-N.png`; exact
matches give a zero-ambiguity mapping from `icon-N.png` to the parsed-JSON
semantic name.

### Reference implementation

`page/lanhu-mcp-assets/slice-mapping.mjs` (MePage 84fafb58). It takes a
hard-coded table of `{ semantic, cdnHash, alias }` extracted from parsed JSON,
downloads each CDN PNG into `src/assets/lanhu/{module}/{alias}.png`, hashes both
sides, and prints a reproducible match table. On MePage this produced 8/8 exact
matches.

`page/lanhu-mcp-assets/home-slice-mapping.mjs` is the HomePage variant.

### Workflow

1. Extract every `imageRef` with its semantic name from parsed JSON.
2. Build a `{ semantic, cdnHash, alias }` table (one row per slice).
3. Copy & adapt `slice-mapping.mjs` for the module, then run:
   ```powershell
   node page/lanhu-mcp-assets/<module>-slice-mapping.mjs
   ```
4. Script downloads each CDN PNG, hashes both sides, prints the match table, and
   writes the aliased PNGs into `src/assets/lanhu/<module>/`.
5. Record the final mapping in `tokens.md` under `### Icon slices` so the mapping
   is auditable without rerunning.

---

## Fallback method — visual cross-check (only when CDN unreachable)

1. Open each `icon-N.png` against the design cover PNG to confirm its glyph.
2. A single mis-mapping cascades into visible UI errors (wrong card color, wrong
   icon in the top-bar).
3. Record the mapping in `tokens.md` under `### Icon slices`, pairing the semantic
   alias with the raw slice filename and a usage description.

---

## Edge cases to watch for

- `lanhu_download_slices` occasionally emits the full page cover as one of the
  `icon-N.png` entries (e.g. a 750×1624 PNG). Detect this by file size / aspect
  ratio before mapping.
- Some sprite icons are Sketch `symbolInstance` with `paths[0].type = "unknown"`
  and have no `imageRef` in raw JSON (e.g. bottom tab bar glyphs on HomePage).
  For these, use a designed mdi placeholder (Decision D6'-a on HomePage) and
  document the TODO in `tokens.md`.
