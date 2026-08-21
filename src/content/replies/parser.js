/**
 * replies/parser.js — slash-shortcut detection in composer text.
 *
 * Detects a trailing token like `/price`, `/hi`, `/followup`. Does NOT send.
 * Returns the matched reply shortcut + the text before it so the UI can offer
 * to expand it into the composer.
 */

/**
 * Find a trailing slash shortcut in text.
 * A shortcut is a `/word` at the end of the input, optionally preceded by
 * whitespace or start of string.
 *
 * @param {string} text
 * @returns {{shortcut:string, prefix:string, start:number, end:number}|null}
 */
export function detectTrailingShortcut(text) {
  if (typeof text !== "string" || !text) return null;
  // Match /word at end. Allow letters/digits/underscore, 1..24 chars.
  const m = /(^|\s)(\/[a-zA-Z0-9_]{1,24})$/.exec(text);
  if (!m) return null;
  const shortcut = m[2];
  const start = m.index + m[1].length;
  const end = text.length;
  return { shortcut, prefix: text.slice(0, m.index + m[1].length), start, end };
}

/**
 * Given composer text and a set of replies, find a matching reply by shortcut.
 * @param {string} text
 * @param {Array<{shortcut:string}>} replies
 * @returns {{reply:object, match:object}|null}
 */
export function matchShortcut(text, replies) {
  const detected = detectTrailingShortcut(text);
  if (!detected) return null;
  const target = detected.shortcut.toLowerCase();
  const reply = (replies || []).find((r) => r.shortcut && r.shortcut.toLowerCase() === target);
  if (!reply) return null;
  return { reply, match: detected };
}

export default { detectTrailingShortcut, matchShortcut };
