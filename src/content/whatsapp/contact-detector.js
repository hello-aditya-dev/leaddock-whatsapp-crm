/**
 * whatsapp/contact-detector.js — extract the current contact context from the
 * open chat's header. Returns a normalized ref { id, phone, name } or null.
 *
 * WhatsApp Web does not expose a phone in the header for many contacts (only a
 * name / business name). We derive a stable key from the title text + (if
 * present) a phone-like string. The CRM `resolveOrCreate` handles dedup.
 *
 * This module NEVER scrapes message bodies — only the header title.
 */
import { findFirst, SELECTORS } from "./selectors.js";
import { normalizePhone } from "../utils/validators.js";

/** Try to read a phone-like string from the header area or its aria labels. */
function extractPhone(headerEl) {
  if (!headerEl) return "";
  // aria-label often reads like "+91 90000 00001, online"
  const aria = headerEl.getAttribute("aria-label") || "";
  const m = aria.match(/\+?[0-9][0-9\s-]{6,}/);
  if (m) return m[0].trim();
  // Sub-buttons sometimes expose a phone as a title.
  const titled = headerEl.querySelector("[title]");
  if (titled) {
    const t = titled.getAttribute("title") || "";
    const m2 = t.match(/\+?[0-9][0-9\s-]{6,}/);
    if (m2) return m2[0].trim();
  }
  return "";
}

/** Read the visible contact/chat title from the header. */
function readTitle(headerEl) {
  if (!headerEl) return "";
  const titleEl = findFirst(SELECTORS.headerTitle, headerEl);
  if (titleEl) {
    const t = titleEl.getAttribute("title") || titleEl.textContent || "";
    if (t.trim()) return t.trim();
  }
  // Fallback: any span with a title in the header.
  const any = headerEl.querySelector("span[title]");
  if (any && (any.getAttribute("title") || "").trim()) {
    return any.getAttribute("title").trim();
  }
  return "";
}

/** Heuristic: is this header a group chat? (affects whether we treat as a lead). */
function isGroupChat(headerEl) {
  if (!headerEl) return false;
  const aria = (headerEl.getAttribute("aria-label") || "").toLowerCase();
  if (aria.includes("group")) return true;
  // Group headers typically have a participants subtitle.
  const sub = headerEl.querySelector("span[title]");
  if (sub) {
    const t = (sub.getAttribute("title") || "").toLowerCase();
    if (/\b\d+\s*(member|participant)/.test(t)) return true;
  }
  return false;
}

/**
 * Detect the current contact context.
 * @returns {{key:string, name:string, phone:string, isGroup:boolean, title:string}|null}
 */
export function detectContact() {
  const header = findFirst(SELECTORS.chatHeader);
  if (!header) return null;
  const title = readTitle(header);
  if (!title) return null;
  const phone = extractPhone(header);
  const isGroup = isGroupChat(header);
  // Stable key: phone if available else normalized title.
  const key = phone ? normalizePhone(phone) : "name:" + title.toLowerCase();
  return { key, name: title, phone, isGroup, title };
}

export default { detectContact };
