/**
 * replies/renderer.js — template variable replacement.
 *
 * Supported variables: {{name}}, {{phone}}, {{company}}, {{product}}.
 * Unknown variables are LEFT VISIBLE (e.g. "{{foo}}") rather than silently
 * disappearing, so the user notices and fixes the template.
 */

const SUPPORTED = ["name", "phone", "company", "product"];

/**
 * Replace known template variables with contact field values.
 * Unknown variables remain as-is in the text.
 *
 * @param {string} content
 * @param {object} contact - { name, phone, company, product, ... }
 * @returns {string}
 */
export function render(content, contact = {}) {
  if (typeof content !== "string") return "";
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (full, key) => {
    if (SUPPORTED.includes(key)) {
      const val = contact && contact[key] != null ? String(contact[key]) : "";
      return val || full; // unknown value -> leave placeholder visible
    }
    return full; // unsupported variable -> leave visible
  });
}

/** Return the list of supported variable names. */
export function supported() {
  return SUPPORTED.slice();
}

export default { render, supported };
