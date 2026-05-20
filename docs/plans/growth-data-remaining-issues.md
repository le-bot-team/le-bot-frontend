# Growth Data Pages — Remaining Issues & Technical Debt

Post-merge cleanup items identified during PR #11 code review.

## Medium Priority

### 1. `interactionOption` reactivity inconsistency

**File:** `src/pages/stack/GrowthDataPage.vue` (line ~198)

`interactionOption` uses `shallowRef` with a static object while all other chart
options (`emotionOption`, `radarOption`, `pieOption`) use `computed`. If the app
ever adds i18n strings to the bar chart (axis labels, tooltip text), they won't
react to locale changes.

**Fix:** Convert `interactionOption` from `shallowRef` to `computed(() => ({...}))`.

---

### 2. Tab bar missing ARIA tab semantics

**File:** `src/pages/stack/GrowthDataPage.vue` (lines ~339–350)

The anchor tab bar uses `<button>` elements but lacks proper WAI-ARIA tab
pattern attributes. Screen readers won't announce these as tabs or convey the
active state.

**Fix:**
- Add `role="tablist"` to `.growth-tab-bar` container
- Add `role="tab"` and `:aria-selected="activeTab === tab.name"` to each button
- Add `aria-controls` pointing to the corresponding section id

---

## Low Priority

### 3. OverviewCard stats row lacks semantic structure

**File:** `src/components/growth-data/OverviewCard.vue` (lines 50–65)

The stats row uses plain `<div>` elements. Screen readers won't convey the
relationship between values and their captions.

**Fix:** Use a definition list (`<dl>`/`<dt>`/`<dd>`) or add `role="group"` with
`aria-label` on each stat column.

---

### 4. Canvas charts have no text alternative

**Files:**
- `src/pages/stack/GrowthDataPage.vue` (all `<v-chart>` instances)
- `src/pages/stack/growth-data/CapabilityDetailPage.vue` (line 98)
- `src/pages/stack/growth-data/ChatWeeklyReportPage.vue` (line 80)

ECharts renders to `<canvas>` which is opaque to screen readers.

**Fix:** Add `aria-label` with a brief description of the chart content, or
provide a visually-hidden text summary (e.g., `<span class="sr-only">`).

---

### 5. Decorative images could use lazy loading

**File:** `src/pages/stack/GrowthDataPage.vue` (lines 307–309)

Three decorative `<img>` tags load eagerly. Since they're above the fold this is
marginal, but `loading="lazy"` would help on slow connections.

---

### 6. `capabilityKey` route param doesn't influence rendered content

**File:** `src/pages/stack/growth-data/CapabilityDetailPage.vue` (line 26)

The route param is read and bound to `data-capability` but the page renders
static mock data regardless of which capability is selected. When the backend API
is ready, this should drive data fetching and content selection.

---

### 7. Custom font fallback not verified

**File:** `src/pages/stack/growth-data/ChatWeeklyReportPage.vue` (lines 195, 207)

`'ZCOOL KuaiLe'` and `'HappyZcool-2016'` are referenced in CSS. Verify that
`@font-face` declarations exist and font files are bundled. If fonts fail to
load, the fallback `var(--font-family)` applies — not a bug, but the visual
design intent may be lost.

---

### 8. Dynamic i18n key in OverviewCard

**File:** `src/components/growth-data/OverviewCard.vue` (line 39)

`` i18n(`labels.${gender}`) `` uses dynamic key interpolation. This works at
runtime but static i18n extraction tools (e.g., `vue-i18n-extract`) won't detect
these keys automatically. Document the expected keys (`labels.male`,
`labels.female`) or add a comment for tooling.
