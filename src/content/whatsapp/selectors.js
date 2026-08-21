/**
 * whatsapp/selectors.js — CENTRAL registry of WhatsApp Web DOM selectors.
 *
 * WhatsApp Web's DOM is dynamic and changes between releases. This module is
 * the ONLY place that hard-codes selectors. Everything else calls adapter
 * methods, never reaching into the DOM directly.
 *
 * Each selector entry is a list of candidate selectors tried in order. The
 * `find*` helpers return the first match or null — callers MUST handle null.
 *
 * When WhatsApp changes its UI, update ONLY this file. Document every
 * assumption inline so the next maintainer knows why a fallback exists.
 */

export const SELECTORS = {
  /** Root app container. */
  appRoot: ["#app", "#wa-web-container", "[data-app-version]"],

  /** The chat list (left pane). */
  chatList: [
    "#pane-side",
    "[data-testid='panel-side-list-container']",
    "div[role='grid'][aria-label*='hat list' i]",
  ],

  /** A single chat row in the list. */
  chatRow: [
    "[data-testid='cell-frame-container']",
    "div[role='row']",
    "#pane-side [role='listitem']",
  ],

  /** The currently open chat pane (right side). */
  mainPane: [
    "#main",
    "[data-testid='conversation-panel-wrapper']",
    "section[data-testid='conversation-panel']",
  ],

  /** The chat header containing the contact name/title. */
  chatHeader: [
    "header[data-testid='conversation-info-header']",
    "#main > header",
    "[data-testid='conversation-info-header']",
    "section#main header",
  ],

  /** The contact/title element inside the header (has title attr or visible text). */
  headerTitle: [
    "header span[dir='auto'][title]",
    "header div[role='button'] span[title]",
    "header span[title]",
    "header div[dir='auto'] span[title]",
  ],

  /** The composer (editable text box). */
  composer: [
    "div[contenteditable='true'][data-tab][role='textbox']",
    "footer div[contenteditable='true']",
    "div[contenteditable='true'][role='textbox']",
    "[data-testid='conversation-compose-box-input']",
    "footer [role='textbox']",
  ],

  /** The composer's parent footer. */
  composerFooter: [
    "footer",
    "#main footer",
    "[data-testid='conversation-compose-box']",
  ],

  /** A chat row's title (contact name) for opening a chat. */
  rowTitle: [
    "span[title]",
    "div[role='gridcell'] span[dir='auto'][title]",
    "[data-testid='cell-frame-title'] span",
  ],

  /** The element used for searching chats. */
  searchInput: [
    "[data-testid='chat-list-search']",
    "input[title='Search input' i]",
    "div[role='textbox'][contenteditable='true'][data-tab='3']",
    "input[placeholder*='earch' i]",
  ],
};

/**
 * Try a list of selectors against a root, returning the first match.
 * @param {string[]} list
 * @param {ParentNode} [root=document]
 * @returns {Element|null}
 */
export function findFirst(list, root = document) {
  for (const sel of list) {
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (err) {
      // Invalid selector — skip silently rather than crash.
    }
  }
  return null;
}

/**
 * Try a list of selectors returning ALL matches (concatenated, deduped).
 */
export function findAll(list, root = document) {
  const seen = new Set();
  const out = [];
  for (const sel of list) {
    try {
      root.querySelectorAll(sel).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          out.push(el);
        }
      });
    } catch (err) {
      // skip
    }
  }
  return out;
}

/** Convenience: is WhatsApp Web loaded enough to inject? */
export function isWhatsAppReady() {
  return !!findFirst(SELECTORS.appRoot) && !!findFirst(SELECTORS.chatList || SELECTORS.mainPane);
}

/** Diagnostic snapshot of which selector groups currently resolve. */
export function diagnostics() {
  const groups = ["appRoot", "chatList", "mainPane", "chatHeader", "headerTitle", "composer", "composerFooter"];
  const out = {};
  for (const g of groups) {
    const el = findFirst(SELECTORS[g]);
    out[g] = el ? "ok" : "missing";
  }
  out.ready = out.appRoot === "ok" && (out.chatList === "ok" || out.mainPane === "ok");
  return out;
}

export default { SELECTORS, findFirst, findAll, isWhatsAppReady, diagnostics };
