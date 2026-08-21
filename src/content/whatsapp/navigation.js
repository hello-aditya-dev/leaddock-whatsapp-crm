/**
 * whatsapp/navigation.js — open a chat by clicking its row in the chat list.
 *
 * Used by the follow-up dashboard "Open chat" action. Best-effort: matches a
 * chat row by title (contact name). Degrades gracefully if not found.
 *
 * NEVER automates sending a message. Only navigates.
 */
import { findAll, findFirst, SELECTORS } from "./selectors.js";

/**
 * Open a chat whose row title matches the given name (case-insensitive contains).
 * @param {{name?:string, phone?:string}} contact
 * @returns {boolean} true if a row was clicked
 */
export function openChat(contact) {
  if (!contact) return false;
  const targetName = String(contact.name || "").trim().toLowerCase();
  const targetPhone = String(contact.phone || "").replace(/[^\d]/g, "");
  const rows = findAll(SELECTORS.chatRow);
  for (const row of rows) {
    const titles = row.querySelectorAll("span[title]");
    let matched = false;
    if (targetName) {
      for (const t of titles) {
        const v = (t.getAttribute("title") || t.textContent || "").trim().toLowerCase();
        if (v && (v === targetName || v.includes(targetName) || targetName.includes(v))) {
          matched = true;
          break;
        }
      }
    }
    if (!matched && targetPhone) {
      const aria = (row.getAttribute("aria-label") || "").replace(/[^\d+]/g, "");
      if (aria && aria.includes(targetPhone)) matched = true;
    }
    if (matched) {
      try {
        row.click();
        return true;
      } catch (err) {
        // continue
      }
    }
  }
  return false;
}

/**
 * Type into the WhatsApp chat search box to surface a contact by name.
 * Best-effort; returns whether a search input was found.
 */
export function searchChats(query) {
  const input = findFirst(SELECTORS.searchInput);
  if (!input) return false;
  try {
    input.focus();
    if (input.tagName === "INPUT") {
      input.value = String(query || "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      // contenteditable search box
      input.textContent = String(query || "");
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: query }));
    }
    return true;
  } catch (err) {
    return false;
  }
}

export default { openChat, searchChats };
