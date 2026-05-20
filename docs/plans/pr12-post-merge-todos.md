# PR #12 Post-Merge Remaining Issues

Residual issues and potential concerns identified during review of the
`feat/home-me-pages` branch. None are blocking — address after merge.

## 1. Navigation entries for unimplemented pages

**Priority:** Medium  
**Files:** `src/components/navigations.ts`, `src/router/routes.ts`

`STACK_NAVIGATIONS` contains entries with `available: true` for routes that do
not yet exist in `routes.ts`. These are used only for StackHeader title lookup
and won't cause runtime errors, but they imply pages that need to be created:

- `help-faq` — no route/page
- `help-feedback` — no route/page
- `settings-addresses` — no route/page
- `settings-app-language` — no route/page
- `settings-notifications` — no route/page
- `settings-general` — no route/page
- `settings-privacy` — no route/page
- `settings-permissions` — no route/page
- `settings-word-filter` — no route/page
- `settings-clear-cache` — no route/page
- `settings-network` — no route/page
- `settings-storage` — no route/page
- `settings-info-list` — no route/page

**Action:** Either create stub pages with routes, or set `available: false`
until implemented.

## 2. StackLayout inline style may not integrate perfectly with Quasar layout

**Priority:** Low  
**File:** `src/layouts/StackLayout.vue`

The current inline style on `q-page-container`:

```html
style="display: flex; flex-direction: column; flex: 1; overflow-y: auto;"
```

`q-page-container` is managed by Quasar's `q-layout` system which uses its own
height calculations. The `flex: 1` may be ignored since the parent isn't a flex
container we control. The critical part (`overflow-y: auto`) works, but this
should be validated visually on:

- Long-content stack pages (scrolling works)
- Short-content stack pages (no unnecessary scrollbar)
- iOS Safari (rubber-band scrolling behavior)

**Action:** Test on real devices; consider moving styles to a scoped CSS class
or using Quasar's built-in scroll mechanisms (`q-scroll-area`).

## 3. Deep-link detection heuristic in StackHeader

**Priority:** Low  
**File:** `src/layouts/headers/StackHeader.vue`

```ts
if (window.history.length <= 1) {
  router.replace('/main/home');
}
```

`window.history.length` is an approximation. Some browsers (notably Safari)
start new tabs with `history.length === 2`. This means the fallback to
`/main/home` might not trigger in all deep-link scenarios.

**Action:** Consider using a more robust approach such as tracking in-app
navigation via a Pinia store counter or `router.afterEach` hook.

## 4. Placeholder routes in MePage menu

**Priority:** Medium  
**File:** `src/pages/main/MePage.vue`

Two menu items redirect to placeholder pages with TODO comments:

- "My Orders" → `/stack/devices` (should be `/stack/orders`)
- "Help & Feedback" → `/stack/about` (should be `/stack/help`)

**Action:** Create `OrdersPage` and `HelpPage` with their routes, then update
the menu entries.

## 5. Messages route placeholder

**Priority:** Medium  
**Files:** `src/pages/main/MePage.vue`, `src/pages/main/HomePage.vue`

Both notification/message buttons redirect to `/stack/chat/history` as a
temporary fallback. The intended destination is `/stack/messages`.

**Action:** Create `MessagesPage` with route, then update both files (search
for TODO comments mentioning MessagesPage).

## 6. Mock data in HomePage

**Priority:** Low  
**File:** `src/pages/main/HomePage.vue`

- `unreadMessages` — hardcoded mock array
- `companionDays` — hardcoded to 263
- `topics` — static list

**Action:** Replace with real data from backend APIs when available.
