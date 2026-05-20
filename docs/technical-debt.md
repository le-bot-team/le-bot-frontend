# Technical Debt & Planned Refactors

> Tracking known issues that are deferred to future PRs.
> Last updated: 2026-05-20

---

## Pending

### PersonalityEditor: Separate tag/textarea data model

**Priority**: High  
**Component**: `src/components/PersonalityEditor.vue`  
**Related**: `src/pages/stack/device-config/PersonalityDetailPage.vue`, `src/pages/stack/AddVirtualDevicePage.vue`

**Problem**:

The current implementation merges selected preset tags and free-text input into a single comma-separated string (`traits` / `goals`). This causes several issues:

1. If the user types a custom value that happens to match a preset tag string, it gets silently removed during `updateTraitsFromTags()`.
2. The join character is always `,` but the split accepts `，;；\n` — round-tripping changes the user's formatting.
3. Editing the textarea directly doesn't update `selectedTraitTags`, so the tag buttons become out of sync with the textarea content.

**Proposed Solution**:

Separate the data model into two distinct parts:
- `selectedTags: string[]` — preset tags selected via chip buttons
- `freeText: string` — user's free-form input in the textarea

Merge them only on submit:
```typescript
function onSubmit() {
  const mergedTraits = [...selectedTraitTags.value, freeTraitsText.value.trim()].filter(Boolean).join(',');
  const mergedGoals = [...selectedGoalTags.value, freeGoalsText.value.trim()].filter(Boolean).join(',');
  emit('submit', { enabled: enabled.value, traits: mergedTraits, goals: mergedGoals });
}
```

**Impact**:
- Props interface changes: `traits`/`goals` string props would need to be parsed on init to separate tags from free text (backward compatible).
- No backend changes needed — the stored format remains a comma-separated string.
- Affects both `PersonalityDetailPage` (device config) and `AddVirtualDevicePage` (onboarding Step 4).

**Acceptance Criteria**:
- [ ] Selecting/deselecting a tag chip does NOT modify the textarea content
- [ ] Typing in the textarea does NOT affect tag chip selection state
- [ ] On submit, both tags and free text are merged into the final string
- [ ] Loading saved data correctly restores both tag selections and free text
- [ ] Clearing all tags and text disables the submit button

---

## Completed

_(Move items here after they are resolved)_
