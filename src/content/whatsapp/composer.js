/**
 * whatsapp/composer.js — read/insert text into the WhatsApp composer.
 *
 * CRITICAL: This only INSERTS text. It never clicks the send button, never
 * simulates Enter-to-send, and never schedules automated messages. The user
 * always confirms and sends manually.
 *
 * WhatsApp's composer is a contenteditable div. To make text appear reliably we
 * use the InputEvent path: focus, document.execCommand('insertText'), and as a
 * fallback set textContent + fire an InputEvent.
 */
import { findFirst, SELECTORS } from "./selectors.js";

/** Get the composer element or null. */
export function getComposer() {
  return findFirst(SELECTORS.composer);
}

/** Read current composer text. */
export function readText() {
  const el = getComposer();
  if (!el) return "";
  // contenteditable may use <br> or text nodes.
  return (el.textContent || "").replace(/\u00a0/g, " ");
}

/**
 * Insert text at the cursor, replacing a trailing slash shortcut if provided.
 * @param {string} text
 * @param {{replaceRange?:{start:number,end:number}, append?:boolean}} [opts]
 * @returns {boolean} true if insertion succeeded
 */
export function insertText(text, opts = {}) {
  const el = getComposer();
  if (!el) return false;
  try {
    el.focus();
  } catch (err) {}

  // If a range to replace is given (slash shortcut expansion), select it first.
  if (opts.replaceRange && typeof opts.replaceRange.start === "number") {
    const sel = window.getSelection();
    const range = document.createRange();
    // Use the composer as the text node source.
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let charCount = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const len = (node.nodeValue || "").length;
      if (!startNode && charCount + len >= opts.replaceRange.start) {
        startNode = node;
        startOffset = opts.replaceRange.start - charCount;
      }
      if (charCount + len >= opts.replaceRange.end) {
        endNode = node;
        endOffset = opts.replaceRange.end - charCount;
        break;
      }
      charCount += len;
    }
    if (startNode && endNode) {
      range.setStart(startNode, Math.max(0, startOffset));
      range.setEnd(endNode, Math.max(0, endOffset));
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      // Fallback: select all
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } else if (opts.append) {
    // Move caret to end.
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Preferred path: execCommand insertText fires WhatsApp's input handlers.
  let done;
  try {
    done = document.execCommand("insertText", false, text);
  } catch (err) {
    done = false;
  }

  if (!done) {
    // Fallback: append textContent and dispatch an InputEvent so listeners react.
    const current = el.textContent || "";
    el.textContent = current + text;
    try {
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    } catch (err) {}
  }

  return true;
}

/**
 * Clear the composer (used when a slash shortcut is fully expanded and replaced).
 * Not required for normal flow — kept for completeness.
 */
export function clear() {
  const el = getComposer();
  if (!el) return false;
  try {
    el.focus();
    document.execCommand("selectAll");
    document.execCommand("delete");
  } catch (err) {
    el.textContent = "";
    try {
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    } catch (e) {}
  }
  return true;
}

export default { getComposer, readText, insertText, clear };
