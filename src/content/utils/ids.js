/**
 * ids.js — stable ID generation utilities.
 *
 * IDs are URL-safe, sortable-ish (prefixed timestamp), and collision-resistant.
 * No external dependencies.
 */

/**
 * Generate a unique ID. Format: `<prefix>_<base36-timestamp>_<random>`.
 * Example: `ct_lq3abc0_1f2k`.
 *
 * @param {string} [prefix="id"] - short semantic prefix (e.g. "ct", "nt", "rp")
 * @returns {string}
 */
export function uid(prefix = "id") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  const safe = String(prefix || "id").replace(/[^a-z0-9_-]/gi, "").slice(0, 12) || "id";
  return `${safe}_${t}_${r}`;
}

/**
 * Determine whether a value looks like one of our generated IDs.
 * Used for light validation when restoring backups.
 * @param {string} id
 * @returns {boolean}
 */
export function isUid(id) {
  return typeof id === "string" && /^[a-z0-9_-]+_[a-z0-9]+_[a-z0-9]+$/i.test(id);
}

export default { uid, isUid };
