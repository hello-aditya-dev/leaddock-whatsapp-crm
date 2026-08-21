/**
 * followups.js — follow-up tracking. Never sends messages.
 * Follow-ups live as standalone records AND a convenience `followUpDate` on the
 * contact (kept in sync) so the dashboard can query cheaply.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { nowIso, dueState, addDays, fromDateInputValue, toDateInputValue } from "../utils/dates.js";
import { validateFollowUp } from "../utils/validators.js";
import * as contacts from "./contacts.js";

export const PRESETS = [
  { id: "today", label: "Today", days: 0 },
  { id: "tomorrow", label: "Tomorrow", days: 1 },
  { id: "3days", label: "In 3 Days", days: 3 },
  { id: "nextweek", label: "Next Week", days: 7 },
];

export async function listAll() {
  const db = await storage.load();
  return Object.values(db.followUps);
}

export async function listForContact(contactId) {
  const db = await storage.load();
  return Object.values(db.followUps).filter((f) => f.contactId === contactId);
}

/** Set (or clear) the follow-up for a contact. isoDate=null clears it. */
export async function setForContact(contactId, isoDate, note = "") {
  const db = await storage.load();
  // Remove existing follow-up records for this contact.
  for (const fid of Object.keys(db.followUps)) {
    if (db.followUps[fid].contactId === contactId) delete db.followUps[fid];
  }
  if (isoDate) {
    const fu = {
      id: uid("fu"),
      contactId,
      date: isoDate,
      note: String(note || ""),
      done: false,
    };
    const v = validateFollowUp(fu);
    if (!v.ok) throw new Error(v.errors[0]);
    db.followUps[fu.id] = v.value;
  }
  // Mirror onto the contact for cheap dashboard queries.
  const c = db.contacts[contactId];
  if (c) {
    c.followUpDate = isoDate || null;
    c.updatedAt = nowIso();
  }
  await storage.save(db);
  return isoDate ? db.followUps[Object.keys(db.followUps).find((k) => db.followUps[k].contactId === contactId)] : null;
}

/** Apply a preset (today/tomorrow/3days/nextweek) or a custom ISO date. */
export async function applyPreset(contactId, presetId, customIso) {
  const preset = PRESETS.find((p) => p.id === presetId);
  let iso = null;
  if (preset) {
    iso = addDays(null, preset.days);
  } else if (customIso) {
    iso = fromDateInputValue(customIso) || customIso;
  }
  return setForContact(contactId, iso);
}

/** Mark a follow-up done (keeps the record for history). */
export async function markDone(followUpId) {
  let updated = null;
  await storage.update((db) => {
    const f = db.followUps[followUpId];
    if (!f) throw new Error("Follow-up not found: " + followUpId);
    f.done = true;
    updated = f;
    // Clear the mirrored contact date when done.
    const c = db.contacts[f.contactId];
    if (c && c.followUpDate === f.date) {
      c.followUpDate = null;
      c.updatedAt = nowIso();
    }
    return db;
  });
  return updated;
}

/** Due follow-ups (overdue or due today), newest due first. */
export async function dueFollowUps() {
  const db = await storage.load();
  const items = [];
  for (const f of Object.values(db.followUps)) {
    if (f.done) continue;
    const st = dueState(f.date);
    if (st === "overdue" || st === "due-today") {
      const contact = db.contacts[f.contactId];
      items.push({ ...f, contact, state: st });
    }
  }
  items.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return items;
}

/** Upcoming follow-ups (next 14 days), for the dashboard. */
export async function upcoming(limit = 10) {
  const db = await storage.load();
  const items = [];
  for (const f of Object.values(db.followUps)) {
    if (f.done) continue;
    const st = dueState(f.date);
    if (st === "upcoming") {
      const contact = db.contacts[f.contactId];
      items.push({ ...f, contact, state: st });
    }
  }
  items.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return items.slice(0, limit);
}

export async function remove(followUpId) {
  await storage.update((db) => {
    const f = db.followUps[followUpId];
    delete db.followUps[followUpId];
    if (f) {
      const c = db.contacts[f.contactId];
      if (c && c.followUpDate === f.date) {
        c.followUpDate = null;
        c.updatedAt = nowIso();
      }
    }
    return db;
  });
  return true;
}

export default {
  PRESETS, listAll, listForContact, setForContact, applyPreset,
  markDone, dueFollowUps, upcoming, remove,
};
