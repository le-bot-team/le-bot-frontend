# Telemetry System — Known Issues & Technical Debt

Post-merge follow-up items identified during PR #15 code review.
Priority: Low — none of these cause runtime errors or data loss in current usage.

---

## 1. First page_enter event may be missed

**File**: `src/boot/telemetry.ts` line 59  
**Risk**: Low  
**Impact**: First page view not tracked in rare edge cases

`router.afterEach` is registered during the async boot plugin execution. If the initial
route resolves before the guard is registered (e.g., if an earlier boot plugin triggers
navigation), the first `page_enter` event will be lost.

In practice, Quasar's boot system runs before app mount, so the initial navigation
typically hasn't resolved yet. But this is not guaranteed.

**Possible fix**: Use `router.isReady().then(...)` to emit the initial page_enter
retroactively, or register the guard synchronously before `await engine.init(...)`.

---

## 2. `isSessionExpired` is always true on cold start before `init()`

**File**: `src/stores/telemetry/index.ts` line 60-62  
**Risk**: Low  
**Impact**: None in current code (init order is correct)

When `lastActivity.value` is 0 (store just created, no sessionStorage data),
`Date.now() - 0 > SESSION_TIMEOUT_MS` is always true. This means if `refreshActivity()`
is called before `init()`, it will always create a new session.

Currently the boot file guarantees `init()` runs first, so this is safe. But if
`useTracker` or the directive fires before boot completes (unlikely but possible in
edge cases), it could create spurious sessions.

**Possible fix**: Guard `refreshActivity()` with an `initialized` flag, or initialize
`lastActivity` to `Date.now()` as default value.

---

## 3. `engine.trackPageLeave()` is dead code

**File**: `src/utils/telemetry/engine.ts` lines 224-239  
**Risk**: None (unused code)  
**Impact**: Maintenance confusion

The boot file directly calls `engine.trackEvent('page_leave', ...)` with its own
duration calculation (lines 67-76 of boot/telemetry.ts), bypassing the engine's
`trackPageLeave()` method entirely. The engine method exists but is never called.

This means `engine.currentPageEnter` is set by `trackPageEnter()` but never cleared
by `trackPageLeave()`. It accumulates stale state, though this is harmless because
it's only used for `pageName` resolution in sampling (which works correctly with
stale data — it just reflects the current page).

**Possible fix**: Either remove `trackPageLeave()` from the engine and keep the
boot file's inline approach, or refactor the boot file to use `engine.trackPageLeave()`
exclusively. The latter is cleaner but requires the engine to own the page timing state.

---

## 4. `sendBeacon` URL assumes same-origin in standard production builds

**File**: `src/utils/telemetry/engine.ts` line 373  
**Risk**: Low (deployment-dependent)  
**Impact**: Beacon events lost if frontend/backend are on different origins

`LE_BOT_BACKEND_HTTP_BASE_URL` is empty string in non-dev, non-GitHub-Pages builds
(see `quasar.config.ts` lines 59-68). This means `beaconUrl` resolves to
`/api/v1/telemetry/batch` — a same-origin relative path.

This is consistent with the axios baseURL behavior and works when the frontend is
served from the same origin as the backend (or behind a reverse proxy). But if the
deployment topology changes (e.g., frontend on CDN, backend on separate domain),
beacon events will silently fail.

**Possible fix**: Add a runtime check or configuration option for the beacon URL.
Or document that same-origin deployment is required for beacon flush to work.

---

## 5. PII pattern `/token/i` blocks legitimate whitelist keys containing "token"

**File**: `src/utils/telemetry/privacy.ts` line 89  
**Risk**: Low  
**Impact**: If a future whitelist key contains "token" (e.g., `deviceToken`), it will be silently dropped

The PII pattern `/token/i` matches any key containing "token" as a substring. This is
intentionally aggressive for security, but could cause confusion if someone adds a
non-sensitive key like `fcmToken` or `deviceToken` to the whitelist and wonders why
it's being dropped.

PII patterns take precedence over the whitelist (by design), so this is working as
intended. But it's worth documenting this behavior for future developers.

**Possible fix**: Add a comment in the whitelist section explaining that PII patterns
override the whitelist, and list known "blocked despite whitelist" patterns. Or tighten
`/token/i` to `/^(access|auth|refresh|api|session)[-_]?token$/i` for more precision.
