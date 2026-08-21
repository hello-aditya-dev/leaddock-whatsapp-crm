/**
 * contacts.js — contact CRUD + search.
 * Contacts are keyed by a stable id. The WhatsApp adapter supplies a
 * `key` (phone or normalized identifier) so we can re-find the same contact.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { nowIso } from "../utils/dates.js";
import { validateContact, normalizePhone } from "../utils/validators.js";
import { dueState } from "../utils/dates.js";

/**
 * Resolve a contact by phone (normalized) or id. Used by the WhatsApp adapter
 * when it detects the current chat's contact.
 * @param {{phone?:string, name?:string, id?:string}} ref
 */
export async function resolveOrCreate(ref) {
  const db = await storage.load();
  const phone = normalizePhone(ref && ref.phone);
  let contact = null;
  if (ref && ref.id && db.contacts[ref.id]) {
    contact = db.contacts[ref.id];
  } else if (phone) {
    contact = Object.values(db.contacts).find((c) => normalizePhone(c.phone) === phone);
  }
  const now = nowIso();
  if (contact) {
    let dirty = false;
    if (ref && ref.name && contact.name !== ref.name) {
      contact.name = ref.name;
      dirty = true;
    }
    contact.lastSeenAt = now;
    if (dirty) {
      contact.updatedAt = now;
      await storage.save(db);
    }
    return contact;
  }
  // Create a new contact from the detected ref.
  const c = {
    id: uid("ct"),
    phone: (ref && ref.phone) || "",
    name: (ref && ref.name) || "",
    company: "",
    email: "",
    product: "",
    budget: "",
    source: "",
    statusId: "new_lead",
    tagIds: [],
    followUpDate: null,
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
  };
  await storage.update((db2) => {
    db2.contacts[c.id] = c;
    return db2;
  });
  return c;
}

export async function list() {
  const db = await storage.load();
  return Object.values(db.contacts);
}

export async function get(id) {
  const db = await storage.load();
  return db.contacts[id] || null;
}

export async function create(data) {
  const id = (data && data.id) || uid("ct");
  const v = validateContact({ ...data, id });
  if (!v.ok) throw new Error(v.errors[0]);
  const contact = { ...v.value, id };
  await storage.update((db) => {
    db.contacts[id] = contact;
    return db;
  });
  return contact;
}

export async function update(id, patch) {
  let updated = null;
  await storage.update((db) => {
    const cur = db.contacts[id];
    if (!cur) throw new Error("Contact not found: " + id);
    const next = { ...cur, ...patch, id, updatedAt: nowIso() };
    const v = validateContact(next);
    if (!v.ok) throw new Error(v.errors[0]);
    db.contacts[id] = v.value;
    updated = v.value;
    return db;
  });
  return updated;
}

export async function remove(id) {
  await storage.update((db) => {
    delete db.contacts[id];
    // Remove notes + follow-ups for this contact.
    for (const nId of Object.keys(db.notes)) {
      if (db.notes[nId].contactId === id) delete db.notes[nId];
    }
    for (const fId of Object.keys(db.followUps)) {
      if (db.followUps[fId].contactId === id) delete db.followUps[fId];
    }
    return db;
  });
  return true;
}

/** Add/remove a tag on a contact. */
export async function toggleTag(contactId, tagId) {
  let added = false;
  await storage.update((db) => {
    const c = db.contacts[contactId];
    if (!c) throw new Error("Contact not found");
    const set = new Set(c.tagIds || []);
    if (set.has(tagId)) {
      set.delete(tagId);
      added = false;
    } else {
      set.add(tagId);
      added = true;
    }
    c.tagIds = Array.from(set);
    c.updatedAt = nowIso();
    return db;
  });
  return added;
}

export async function setStatus(contactId, statusId) {
  return update(contactId, { statusId });
}

export async function setFollowUp(contactId, isoDate) {
  return update(contactId, { followUpDate: isoDate });
}

/**
 * Search contacts across name, phone, company, notes, tags.
 * @param {string} query
 * @param {{statusId?:string, tagId?:string, due?:boolean}} [filters]
 * @returns {Promise<Array>}
 */
export async function search(query, filters = {}) {
  const db = await storage.load();
  const q = String(query || "").trim().toLowerCase();
  const noteIndex = new Map(); // contactId -> concatenated note text
  for (const n of Object.values(db.notes)) {
    const prev = noteIndex.get(n.contactId) || "";
    noteIndex.set(n.contactId, prev + " " + (n.text || ""));
  }

  let results = Object.values(db.contacts);

  if (filters.statusId) {
    results = results.filter((c) => c.statusId === filters.statusId);
  }
  if (filters.tagId) {
    results = results.filter((c) => Array.isArray(c.tagIds) && c.tagIds.includes(filters.tagId));
  }
  if (filters.due) {
    results = results.filter((c) => {
      const st = dueState(c.followUpDate);
      return st === "overdue" || st === "due-today";
    });
  }
  if (q) {
    results = results.filter((c) => {
      const tags = (c.tagIds || [])
        .map((tid) => (db.tags[tid] ? db.tags[tid].name : ""))
        .join(" ")
        .toLowerCase();
      const hay = [
        c.name, c.phone, c.company, c.email, c.product, c.source,
        tags, noteIndex.get(c.id) || "",
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  results.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return results;
}

/** Counts by status — for the dashboard. */
export async function countsByStatus() {
  const db = await storage.load();
  const counts = {};
  for (const s of Object.values(db.statuses)) counts[s.id] = 0;
  for (const c of Object.values(db.contacts)) {
    const k = c.statusId || "new_lead";
    counts[k] = (counts[k] || 0) + 1;
  }
  return counts;
}

export default {
  resolveOrCreate, list, get, create, update, remove,
  toggleTag, setStatus, setFollowUp, search, countsByStatus,
};
