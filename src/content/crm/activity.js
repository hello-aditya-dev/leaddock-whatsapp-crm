/**
 * crm/activity.js — lightweight lead activity timeline.
 *
 * Records discrete events for a contact (status changed, note added, tag
 * added/removed, follow-up set, reply inserted). Stored in the `activity`
 * collection keyed by event id. Newest-first display.
 *
 * Deliberately simple — no lead-scoring, no analytics. This is a per-contact
 * history to help the user remember what happened with a lead.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { nowIso, formatDateTime } from "../utils/dates.js";

/**
 * @typedef {"status_changed"|"note_added"|"note_edited"|"note_deleted"|"tag_added"|"tag_removed"|"followup_set"|"followup_cleared"|"reply_inserted"|"contact_created"|"contact_updated"} ActivityType
 */

/**
 * Record an activity event for a contact.
 * @param {string} contactId
 * @param {ActivityType} type
 * @param {{label?:string, detail?:string}} [meta]
 * @returns {Promise<object>} the created activity record
 */
export async function record(contactId, type, meta = {}) {
  if (!contactId || !type) return null;
  const now = nowIso();
  const event = {
    id: uid("act"),
    contactId,
    type,
    label: String(meta.label || ""),
    detail: String(meta.detail || ""),
    at: now,
  };
  await storage.update((db) => {
    db.activity = db.activity || {};
    db.activity[event.id] = event;
    // Cap per-contact history to the most recent 100 events to keep storage tidy.
    const forContact = Object.values(db.activity)
      .filter((a) => a.contactId === contactId)
      .sort((a, b) => (b.at || "").localeCompare(a.at || ""));
    if (forContact.length > 100) {
      const toRemove = forContact.slice(100);
      for (const r of toRemove) delete db.activity[r.id];
    }
    return db;
  });
  return event;
}

/** List activity for a contact, newest-first. */
export async function listForContact(contactId, limit = 50) {
  const db = await storage.load();
  db.activity = db.activity || {};
  return Object.values(db.activity)
    .filter((a) => a.contactId === contactId)
    .sort((a, b) => (b.at || "").localeCompare(a.at || ""))
    .slice(0, limit);
}

/** List recent activity across all contacts (for dashboard), newest-first. */
export async function recent(limit = 20) {
  const db = await storage.load();
  db.activity = db.activity || {};
  return Object.values(db.activity)
    .sort((a, b) => (b.at || "").localeCompare(a.at || ""))
    .slice(0, limit);
}

/** Remove all activity for a contact (used when a contact is deleted). */
export async function clearForContact(contactId) {
  await storage.update((db) => {
    db.activity = db.activity || {};
    for (const id of Object.keys(db.activity)) {
      if (db.activity[id].contactId === contactId) delete db.activity[id];
    }
    return db;
  });
  return true;
}

/** Human-readable label for an activity type, for display. */
export function labelFor(type) {
  const map = {
    status_changed: "Status changed",
    note_added: "Note added",
    note_edited: "Note edited",
    note_deleted: "Note deleted",
    tag_added: "Tag added",
    tag_removed: "Tag removed",
    followup_set: "Follow-up set",
    followup_cleared: "Follow-up cleared",
    reply_inserted: "Quick reply inserted",
    contact_created: "Contact created",
    contact_updated: "Contact updated",
  };
  return map[type] || type;
}

export default { record, listForContact, recent, clearForContact, labelFor };
