/**
 * whatsapp/adapter.js — the STABLE WhatsApp adapter interface.
 *
 * This is the ONLY surface the CRM/UI layers use to interact with WhatsApp Web.
 * If WhatsApp's DOM changes, only selectors.js (and possibly composer.js /
 * contact-detector.js) need updating — CRM code is untouched.
 *
 * Interface:
 *   isReady(): boolean
 *   diagnostics(): object
 *   getCurrentChat(): { name, phone, isGroup } | null
 *   getCurrentContact(): { key, name, phone, isGroup, title } | null
 *   getComposer(): Element | null
 *   insertMessage(text, opts?): boolean
 *   openChat(contact): boolean
 *   observeChatChanges(cb): stop()
 *
 * The adapter never sends messages. insertMessage only places text in the
 * composer — the user presses send themselves.
 */
import { isWhatsAppReady, diagnostics as runDiag } from "./selectors.js";
import { detectContact } from "./contact-detector.js";
import * as composer from "./composer.js";
import * as nav from "./navigation.js";
import { observeChatSwitches } from "./observer.js";

export function isReady() {
  return isWhatsAppReady();
}

export function diagnostics() {
  return runDiag();
}

export function getCurrentChat() {
  const c = detectContact();
  if (!c) return null;
  return { name: c.name, phone: c.phone, isGroup: c.isGroup };
}

export function getCurrentContact() {
  return detectContact();
}

export function getComposer() {
  return composer.getComposer();
}

export function insertMessage(text, opts) {
  return composer.insertText(text, opts);
}

export function readComposerText() {
  return composer.readText();
}

export function openChat(contact) {
  return nav.openChat(contact);
}

export function searchChats(query) {
  return nav.searchChats(query);
}

export function observeChatChanges(callback) {
  return observeChatSwitches(callback);
}

export default {
  isReady,
  diagnostics,
  getCurrentChat,
  getCurrentContact,
  getComposer,
  insertMessage,
  readComposerText,
  openChat,
  searchChats,
  observeChatChanges,
};
