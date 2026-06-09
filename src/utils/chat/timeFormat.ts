/**
 * WeChat-style time formatting utilities for chat messages.
 *
 * Rules:
 *  - Same day:       "上午 10:30" / "下午 2:15"
 *  - Yesterday:      "昨天 14:20"
 *  - Same week:      "周三 09:00"
 *  - Same year:      "03月15日 10:30"
 *  - Different year: "2025年12月31日 08:00"
 */

const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Zero-pad a number to two digits. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Return "上午"/"下午" (or AM/PM when locale is 'en'). */
function meridiem(hours: number, locale: 'zh' | 'en' = 'zh'): string {
  return locale === 'zh' ? (hours < 12 ? '上午' : '下午') : hours < 12 ? 'AM' : 'PM';
}

/** Format as "HH:MM" in 12-hour clock. */
function format12Hour(date: Date): string {
  const h = date.getHours();
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${pad2(displayH)}:${pad2(date.getMinutes())}`;
}

/**
 * Determine whether two dates fall on the same calendar day
 * in the user's local time-zone.
 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format a UNIX-ms timestamp into a WeChat-style time string.
 *
 * @param timestamp - UNIX milliseconds
 * @param locale    - 'zh' (default) or 'en'
 */
export function formatChatTime(timestamp: number, locale: 'zh' | 'en' = 'zh'): string {
  const date = new Date(timestamp);
  const now = new Date();
  const time12 = `${meridiem(date.getHours(), locale)} ${format12Hour(date)}`;

  // Today
  if (isSameDay(date, now)) {
    return time12;
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return locale === 'zh' ? `昨天 ${format12Hour(date)}` : `Yesterday ${format12Hour(date)}`;
  }

  // Same week (2-6 days ago)
  const daysDiff = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );
  if (daysDiff >= 2 && daysDiff <= 6) {
    const weekday = locale === 'zh' ? WEEKDAY_ZH[date.getDay()] : WEEKDAY_EN[date.getDay()];
    return `${weekday} ${format12Hour(date)}`;
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return locale === 'zh'
      ? `${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${time12}`
      : `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()} ${time12}`;
  }

  // Different year
  return locale === 'zh'
    ? `${date.getFullYear()}年${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${time12}`
    : `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()} ${time12}`;
}

/**
 * Format a UNIX-ms timestamp into a date-separator label (no time portion).
 *
 * Used to render the horizontal date divider between message groups.
 *
 * @param timestamp - UNIX milliseconds
 * @param locale    - 'zh' (default) or 'en'
 */
export function formatDateSeparator(timestamp: number, locale: 'zh' | 'en' = 'zh'): string {
  const date = new Date(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) {
    return locale === 'zh' ? '今天' : 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return locale === 'zh' ? '昨天' : 'Yesterday';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return locale === 'zh'
      ? `${date.getMonth() + 1}月${date.getDate()}日`
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return locale === 'zh'
    ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Return a stable "YYYY-MM-DD" key for a given timestamp.
 * Used for grouping messages by calendar day.
 */
export function toDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
