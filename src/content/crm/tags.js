/**
 * tags.js — tag CRUD.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { validateTag } from "../utils/validators.js";

export async function list() {
  const db = await storage.load();
  return Object.values(db.tags).sort((a, b) => a.name.localeCompare(b.name));
}

export async function get(id) {
  const db = await storage.load();
  return db.tags[id] || null;
}

export async function create(data) {
  const id = data.id || uid("tag");
  const v = validateTag({ ...data, id });
  if (!v.ok) throw new Error(v.errors[0]);
  const tag = v.value;
  await storage.update((db) => {
    db.tags[id] = tag;
    return db;
  });
  return tag;
}

/** Find-or-create a tag by name (case-insensitive). Returns the tag. */
export async function ensureByName(name, color = "#6B7280") {
  const db = await storage.load();
  const lower = String(name || "").trim().toLowerCase();
  const existing = Object.values(db.tags).find((t) => t.name.toLowerCase() === lower);
  if (existing) return existing;
  return create({ name, color });
}

export async function update(id, patch) {
  let updated = null;
  await storage.update((db) => {
    const cur = db.tags[id];
    if (!cur) throw new Error("Tag not found: " + id);
    updated = { ...cur, ...patch, id };
    const v = validateTag(updated);
    if (!v.ok) throw new Error(v.errors[0]);
    db.tags[id] = v.value;
    return db;
  });
  return updated;
}

export async function remove(id) {
  await storage.update((db) => {
    delete db.tags[id];
    // Detach from contacts.
    for (const c of Object.values(db.contacts)) {
      if (Array.isArray(c.tagIds)) {
        c.tagIds = c.tagIds.filter((t) => t !== id);
      }
    }
    return db;
  });
  return true;
}

export default { list, get, create, ensureByName, update, remove };
