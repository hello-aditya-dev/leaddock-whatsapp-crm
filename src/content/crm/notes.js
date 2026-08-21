/**
 * notes.js — contact notes CRUD. Newest-first display.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { nowIso } from "../utils/dates.js";
import { validateNote } from "../utils/validators.js";
import { stripUnsafeControlChars } from "../utils/sanitize.js";
import * as activity from "./activity.js";

export async function listForContact(contactId) {
  const db = await storage.load();
  return Object.values(db.notes)
    .filter((n) => n.contactId === contactId)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function listAll() {
  const db = await storage.load();
  return Object.values(db.notes);
}

export async function create(contactId, text) {
  const clean = stripUnsafeControlChars(String(text || ""));
  if (!clean.trim()) throw new Error("Note text is required");
  const now = nowIso();
  const note = {
    id: uid("nt"),
    contactId,
    text: clean,
    createdAt: now,
    updatedAt: now,
  };
  const v = validateNote(note);
  if (!v.ok) throw new Error(v.errors[0]);
  await storage.update((db) => {
    db.notes[note.id] = v.value;
    return db;
  });
  try { await activity.record(contactId, "note_added", { detail: clean.slice(0, 80) }); } catch (e) {}
  return note;
}

export async function update(id, text) {
  const clean = stripUnsafeControlChars(String(text || ""));
  if (!clean.trim()) throw new Error("Note text is required");
  let updated = null;
  let contactId = null;
  await storage.update((db) => {
    const cur = db.notes[id];
    if (!cur) throw new Error("Note not found: " + id);
    contactId = cur.contactId;
    updated = { ...cur, text: clean, updatedAt: nowIso() };
    db.notes[id] = updated;
    return db;
  });
  try { if (contactId) await activity.record(contactId, "note_edited", { detail: clean.slice(0, 80) }); } catch (e) {}
  return updated;
}

export async function remove(id) {
  let contactId = null;
  await storage.update((db) => {
    if (db.notes[id]) contactId = db.notes[id].contactId;
    delete db.notes[id];
    return db;
  });
  try { if (contactId) await activity.record(contactId, "note_deleted"); } catch (e) {}
  return true;
}

export default { listForContact, listAll, create, update, remove };
