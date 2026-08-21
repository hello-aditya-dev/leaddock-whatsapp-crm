/**
 * dates.js — date helpers for follow-ups, timestamps, and formatting.
 *
 * Uses the user's locale for display but always stores ISO-8601 internally.
 */

const MS_DAY = 86400000;

/**
 * Return an ISO-8601 timestamp for "now".
 * @returns {string}
 */
export function nowIso() {
  return new Date().toISOString();
}

/** Parse an ISO date string; returns null if invalid. */
export function parseIso(input) {
  if (input === null || input === undefined || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/** Format an ISO date for display: "Mon, 12 Aug 2025". */
export function formatDate(iso, locale = undefined) {
  const d = parseIso(iso);
  if (!d) return "";
  try {
    return d.toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** Format an ISO date + time for display: "12 Aug 2025, 14:30". */
export function formatDateTime(iso, locale = undefined) {
  const d = parseIso(iso);
  if (!d) return "";
  try {
    return d.toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso || "";
  }
}

/** Convert an ISO date to a YYYY-MM-DD string for <input type="date"> values. */
export function toDateInputValue(iso) {
  const d = parseIso(iso);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD value (from a date input) into an ISO date at local midnight. */
export function fromDateInputValue(yyyymmdd) {
  if (!yyyymmdd || typeof yyyymmdd !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyymmdd);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Add days to a date and return ISO. null base => now. */
export function addDays(iso, days) {
  const base = parseIso(iso) || new Date();
  const next = new Date(base.getTime() + Number(days) * MS_DAY);
  return next.toISOString();
}

/** Today at local midnight, ISO. */
export function startOfToday() {
  const n = new Date();
  const d = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
  return d.toISOString();
}

/** End of today (local), ISO. Used to test "due today". */
export function endOfToday() {
  const n = new Date();
  const d = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Compare a follow-up date to now.
 * @returns {"overdue"|"due-today"|"upcoming"|"none"}
 */
export function dueState(iso) {
  const d = parseIso(iso);
  if (!d) return "none";
  const t = d.getTime();
  const start = new Date(startOfToday()).getTime();
  const end = new Date(endOfToday()).getTime();
  if (t < start) return "overdue";
  if (t <= end) return "due-today";
  return "upcoming";
}

/** Relative label like "Today", "Tomorrow", "In 3 days", "Overdue", "Aug 22". */
export function relativeLabel(iso) {
  const state = dueState(iso);
  const d = parseIso(iso);
  if (!d) return "";
  const startToday = new Date(startOfToday()).getTime();
  const diffDays = Math.round((d.getTime() - startToday) / MS_DAY);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return "Overdue";
  if (diffDays > 0 && diffDays <= 6) return `In ${diffDays} days`;
  return formatDate(iso);
}

export default {
  nowIso,
  parseIso,
  formatDate,
  formatDateTime,
  toDateInputValue,
  fromDateInputValue,
  addDays,
  startOfToday,
  endOfToday,
  dueState,
  relativeLabel,
};
