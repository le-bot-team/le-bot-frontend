/**
 * Composable for tracking which daily chat summaries have been read.
 *
 * Persistence: localStorage key `chat-summary-read:{deviceId}` stores a
 * JSON array of YYYY-MM-DD date strings that the user has already viewed.
 *
 * Usage:
 *   const { hasUnreadYesterdaySummary, checkYesterdaySummary, markDateAsRead } =
 *     useChatSummaryRead(deviceId);
 */
import { computed, onUnmounted, ref, watch } from 'vue';

import { fetchChatSummary } from 'src/utils/api/chat-summary';

const STORAGE_PREFIX = 'chat-summary-read:';
/** Keep at most this many dates per device to avoid unbounded growth. */
const MAX_DATES = 120;

// ─── Cross-instance notification ─────────────────────────────────────────────
//
// Each composable instance registers a listener here.  When any instance calls
// markDateAsRead, all listeners fire so every instance can re-sync its local
// _dates Set from localStorage and bump its _tick ref for reactivity.
type ReadListener = () => void;
const _listeners = new Set<ReadListener>();
function notifyAll(): void {
  _listeners.forEach((fn) => fn());
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storageKey(deviceId: string): string {
  return `${STORAGE_PREFIX}${deviceId}`;
}

function readDates(deviceId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(deviceId));
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeDates(deviceId: string, dates: Set<string>): void {
  try {
    // Cap size — keep the most recent dates
    const arr = [...dates].sort().slice(-MAX_DATES);
    localStorage.setItem(storageKey(deviceId), JSON.stringify(arr));
  } catch {
    // localStorage unavailable (private mode) — silently ignore
  }
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useChatSummaryRead(
  deviceId: () => string | null | undefined,
  accessToken: () => string | null | undefined,
) {
  // Internal Set copy — mutations go through markDateAsRead
  let _dates = new Set<string>(readDates(deviceId() ?? ''));

  // Monotonic counter to force computed() re-evaluation after mutations
  const _tick = ref(0);

  // Cross-instance sync: re-read from storage when another instance writes
  function _onPeerUpdate(): void {
    const id = deviceId();
    if (!id) return;
    _dates = readDates(id);
    _tick.value++;
  }
  _listeners.add(_onPeerUpdate);
  onUnmounted(() => {
    _listeners.delete(_onPeerUpdate);
  });

  // Re-hydrate when device changes
  watch(
    () => deviceId(),
    (id) => {
      _dates = readDates(id ?? '');
      _tick.value++;
    },
  );

  /** Whether a specific date has been viewed */
  function isDateRead(date: string): boolean {
    void _tick.value; // track dependency
    return _dates.has(date);
  }

  /** Persist a date as "read" — idempotent, no-ops if already read */
  function markDateAsRead(date: string): void {
    const id = deviceId();
    if (!id) return;
    if (!_dates.has(date)) {
      _dates.add(date);
      writeDates(id, _dates);
      _tick.value++;
      // Notify other composable instances (e.g. HomePage) to re-sync
      notifyAll();
    }
  }

  /**
   * Whether yesterday's summary should show an unread red dot.
   *
   * This only checks the local read-state; callers must combine with
   * `hasYesterdayData` (fetched via API) to avoid showing the dot when
   * there was no summary content at all.
   */
  const isYesterdayUnread = computed(() => {
    void _tick.value;
    const yDate = fmtDate(getYesterday());
    return !_dates.has(yDate);
  });

  /**
   * Fetch yesterday's summary from the API and return whether it
   * contains data (i.e. summary exists).  Call this on mount so the
   * red dot is only shown when there is actual content to view.
   *
   * Returns `{ hasData: boolean, dateStr: string }`
   */
  async function checkYesterdayHasData(): Promise<{ hasData: boolean; dateStr: string }> {
    const id = deviceId();
    const token = accessToken();
    const yDate = fmtDate(getYesterday());

    if (!id || !token) return { hasData: false, dateStr: yDate };

    try {
      const resp = await fetchChatSummary(token, id, yDate);
      const body = resp.data;
      return { hasData: body.success && body.data !== null, dateStr: yDate };
    } catch {
      return { hasData: false, dateStr: yDate };
    }
  }

  return {
    isDateRead,
    markDateAsRead,
    isYesterdayUnread,
    checkYesterdayHasData,
  };
}
