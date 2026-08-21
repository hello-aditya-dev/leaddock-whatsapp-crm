/**
 * sanitize.js — minimal, dependency-free HTML/text sanitization.
 *
 * The extension never injects raw user data as HTML. Text is always escaped
 * via `escapeHtml` before being placed into markup. `setText` and `makeEl`
 * are the safe primitives used by the UI layer.
 */

const ESC_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape a string for safe insertion into HTML text content or attributes.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);
}

/**
 * Escape text for use inside a double-quoted HTML attribute value.
 */
export function escapeAttr(str) {
  return escapeHtml(str);
}

/**
 * Set text content safely (no HTML parsing).
 * @param {Element} el
 * @param {string} text
 */
export function setText(el, text) {
  if (!el) return;
  // textContent never parses HTML — this is the safe primitive.
  el.textContent = text == null ? "" : String(text);
}

/**
 * Create an element with attributes and children via safe APIs.
 * @param {string} tag
 * @param {Record<string,any>} [attrs]
 * @param {Array<Node|string>} [children]
 * @returns {HTMLElement}
 */
export function makeEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const key of Object.keys(attrs)) {
    const val = attrs[key];
    if (val === null || val === undefined || val === false) continue;
    if (key === "class" || key === "className") {
      el.className = String(val);
    } else if (key === "text") {
      el.textContent = String(val);
    } else if (key === "html") {
      // Only used internally for trusted, static markup. Never user data.
      el.innerHTML = String(val);
    } else if (key.startsWith("on") && typeof val === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === "dataset" && val && typeof val === "object") {
      for (const dk of Object.keys(val)) el.dataset[dk] = String(val[dk]);
    } else if (val === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, String(val));
    }
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c === null || c === undefined || c === false) continue;
    if (typeof c === "string" || typeof c === "number") {
      el.appendChild(document.createTextNode(String(c)));
    } else if (c instanceof Node) {
      el.appendChild(c);
    }
  }
  return el;
}

/**
 * Strip control characters that are unsafe in text contexts (zero-width etc.)
 * while preserving normal unicode. Used when persisting user-provided notes.
 */
export function stripUnsafeControlChars(str) {
  if (typeof str !== "string") return "";
  // Remove C0/C1 control chars except \t \n \r (intentional security sanitize).
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

export default { escapeHtml, escapeAttr, setText, makeEl, stripUnsafeControlChars };
