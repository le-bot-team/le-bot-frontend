---
name: lanhu-ui-sync
description: Sync frontend UI code with Blue Lake (lanhu / 蓝湖) design specs by fetching design tokens via lanhu-mcp tools, comparing against current implementation, and applying fixes in a layered cascade (global CSS → page → component). Use when aligning any frontend module with 蓝湖 designs, replacing UI styles, or when the user mentions 设计稿, design replacement, lanhu, 蓝湖, or UI 比对.
metadata:
  version: '2.0.0'
  domain: frontend
  triggers: 蓝湖, lanhu, 设计稿, design sync, UI 比对, design token, 切图, image_id, lanhu-mcp
  role: specialist
  scope: implementation
  output-format: code
  related-skills: vue-expert
---

# Blue Lake Design UI Sync

## Overview

Aligns frontend Vue/Quasar code with Blue Lake (蓝湖) design specs through a deterministic 9-step workflow. Treats design tokens (colors, gradients, radii, spacings, typography) as the single source of truth and applies fixes in a strict cascade: global CSS variables → page-scoped styles → component-local overrides.

## Prerequisites

- `lanhu-mcp` installed at `node_modules/@star_work/lanhu-mcp/dist/index.js`
- Blue Lake login cookie valid at `~/.lanhu-mcp/cookie.json` (re-run login if expired)
- Windows: invoke via `node node_modules/@star_work/lanhu-mcp/dist/index.js` directly (NOT `npx`)

**Project constants**:

| Key               | Value                                  |
| ----------------- | -------------------------------------- |
| `tid`             | `043c655d-def8-4d64-8b42-11143b799069` |
| `pid`             | `aba59ed3-cb41-4ddb-9e79-ccb13b416f04` |
| Design assets dir | `page/lanhu-mcp-assets/`               |
| Tokens reference  | [`tokens.md`](./tokens.md)             |

## Core Workflow

Use this checklist for every sync task. Details in [`references/workflow.md`](./references/workflow.md).

1. **Identify target** — resolve `image_id` via `lanhu_resolve_link` or `all-designs.json`
2. **Fetch data** — call `lanhu_get_design` + `lanhu_get_screenshot` for visual & structural reference
3. **Get raw JSON** — run `fetch-raw.mjs <image_id>` to obtain gradient / shape / color precise values
4. **Download slices** — call `lanhu_download_slices` for icons/backgrounds that cannot be reproduced in CSS
5. **Extract tokens** — consolidate colors, gradients, radii, spacings, typography into a token list; record in [`tokens.md`](./tokens.md)
6. **Diff current code** — read existing Vue/SCSS; list mismatches against tokens
7. **Apply fixes (cascaded)** — global CSS variables first → page-scoped styles → component-local only if truly unique
8. **Verify** — re-read changed files; visually diff against screenshot; confirm dark-mode parity
9. **Record** — append new/changed tokens to `tokens.md`; note pitfalls encountered

## Reference Guide

Load detailed guidance based on the current sub-task:

| Topic                                       | Reference                                                          | Load When                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Full workflow expansion (4 phases, 9 steps) | [`references/workflow.md`](./references/workflow.md)               | Starting a new sync task, need phase-by-phase detail                          |
| Raw JSON extraction & gradient decoding     | [`references/raw-json.md`](./references/raw-json.md)               | Screenshot shows gradients, alpha fills, arc shapes, or complex backgrounds   |
| 10 core principles                          | [`references/principles.md`](./references/principles.md)           | Deciding layer of fix, naming tokens, handling ambiguity                      |
| Common pitfalls table                       | [`references/pitfalls.md`](./references/pitfalls.md)               | Fix does not render as expected; before writing CSS                           |
| Slice identification (SHA-256 mapping)      | [`references/slice-mapping.md`](./references/slice-mapping.md)     | Need to map a design layer to an already-downloaded slice file                |
| Escalation protocol (Principle 10)          | [`references/escalation.md`](./references/escalation.md)           | Design clearly conflicts with current code; unable to reconcile automatically |
| Design token data overview                  | [`references/tokens-overview.md`](./references/tokens-overview.md) | Want a map of what already exists in `tokens.md`                              |
| **Design token data repository**            | [`tokens.md`](./tokens.md)                                         | Looking up concrete hex/rgba/radius values by module                          |

## Constraints

### MUST DO

- Fetch **raw JSON** (not only cleaned design JSON) whenever the screenshot contains gradients, radial fills, or shapes — cleaned JSON loses precision
- Apply fixes in the **global → page → component** cascade; promote repeated values to CSS variables before duplicating
- Cross-check every token against [`tokens.md`](./tokens.md); reuse existing names instead of inventing synonyms
- Verify both **light and dark** modes after every change
- For every downloaded slice, record its **SHA-256** and source `image_id` in the module's section of `tokens.md`
- Escalate (abort and report) when a design conflicts with documented code behaviour — follow [`references/escalation.md`](./references/escalation.md)

### MUST NOT DO

- Invent gradient stops or colors from the screenshot; always derive from raw JSON or token file
- Copy full design JSON into code comments or commits
- Duplicate a color/radius/spacing value that already exists as a CSS variable
- Hardcode slice paths before confirming the slice SHA matches the design layer
- Modify `tokens.md` formatting or rename existing tokens without running through the diff step
- Use short i18n key paths like `t('LanguagePage.xxx')`; always use project's `i18nSubPath('pages.stack.LanguagePage')` convention (see pitfalls)

## Knowledge Reference

Blue Lake (蓝湖) MCP API, design token extraction, CSS custom properties cascade, Quasar theming, Vue 3 `<style scoped>`, gradient decoding (linear / radial / conic), SHA-256 asset fingerprinting, raw design JSON schema (`_raw.json`), `fetch-raw.mjs` / `slice-mapping.mjs` helper scripts.
