# PR #13 Remaining Issues & Technical Debt

Post-merge follow-up items identified during code review of the
messages/orders/help feature branch.

## P1 — Should Address Soon

### 1. MessagesPage i18n strings won't react to locale changes

- **File**: `src/pages/stack/MessagesPage.vue` (lines 52–91)
- **Problem**: The `messages` array uses `ref()` with `i18n()` calls evaluated
  once at component setup. If the user switches locale at runtime, message
  titles and content remain in the original language.
- **Root cause**: `ref` is used because the array needs to be mutable (splice
  for deletion). A `computed` would re-evaluate on locale change but is
  read-only.
- **Suggested fix**: Separate concerns — use a `computed` for the base message
  data and a `ref<Set<string>>` for tracking deleted IDs:
  ```ts
  const deletedIds = ref<Set<string>>(new Set());
  const allMessages = computed<MessageItem[]>(() => [ /* i18n calls here */ ]);
  const messages = computed(() =>
    allMessages.value.filter((m) => !deletedIds.value.has(m.id)),
  );
  ```
  Then update `onDeleteClick` to add to `deletedIds` instead of splicing.
- **Impact**: Low if the app doesn't support runtime locale switching. High if
  it does (or will in the future).

### 2. navigations.ts labels are not reactive to locale changes

- **File**: `src/components/navigations.ts`
- **Problem**: `STACK_NAVIGATIONS` is a module-level constant. The `i18n()`
  calls are evaluated once at import time. Locale changes won't update
  navigation labels in StackHeader.
- **Note**: This is a **pre-existing pattern** — all existing entries have the
  same limitation. The new entries (messages, orders, help) just inherit it.
- **Suggested fix**: Convert `STACK_NAVIGATIONS` to a function or computed that
  re-evaluates, or have `StackHeader` resolve labels from i18n directly using
  the route name as a key.

## P2 — Nice to Have

### 3. FaqPage — "other" category has no items

- **File**: `src/pages/stack/help/FaqPage.vue`
- **Problem**: The `categories` array includes an "other" tab, but
  `allFaqItems` has no items with `category: 'other'`. Selecting "Other" shows
  an empty list with no empty-state message.
- **Suggested fix**: Either add mock items for "other", remove the tab until
  content exists, or add an empty-state message when `faqItems` is empty.

### 4. FaqPage — `:key="item.question"` may collide

- **File**: `src/pages/stack/help/FaqPage.vue` (line 63)
- **Problem**: Using the translated question string as `:key` means duplicate
  questions (even across categories) would cause Vue duplicate-key warnings.
- **Suggested fix**: Add a unique `id` field to `FaqItem` or use a composite
  key like `${item.category}-${index}`.

### 5. FeedbackPage — upload row is non-functional

- **File**: `src/pages/stack/help/FeedbackPage.vue` (line 55)
- **Problem**: The upload image row (icon + label) is rendered but has no click
  handler or file picker. It's visually present but does nothing.
- **Suggested fix**: Wire up a file input with image preview, or hide the row
  until the feature is implemented.

### 6. MessageDetailPage — inline styles

- **File**: `src/pages/stack/messages/MessageDetailPage.vue`
- **Problem**: Heavy use of inline `style` attributes for typography. This
  makes the component harder to maintain and inconsistent with other pages that
  use CSS classes in `app.scss`.
- **Suggested fix**: Extract styles to `.message-detail-*` classes in
  `app.scss`.

### 7. Mock data should be replaced with API calls

- **Files**: MessagesPage, OrdersPage, MessageDetailPage, ActivityMessagesPage,
  FaqPage
- **Problem**: All pages use hardcoded mock data. This is expected for the
  initial implementation but should be tracked for replacement.
- **Suggested fix**: Create API service functions and replace mock data when
  backend endpoints are available.
