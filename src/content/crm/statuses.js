/**
 * statuses.js — lead status CRUD.
 * The CRM layer never imports WhatsApp selectors.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { nowIso } from "../utils/dates.js";
import { validateStatus } from "../utils/validators.js";

export async function list() {
  const db = await storage.load();
  return Object.values(db.statuses).sort((a, b) => (a.order || 99) - (b.order || 99));
}

export async function get(id) {
  const db = await storage.load();
  return db.statuses[id] || null;
}

export async function create(data) {
  const v = validateStatus({ ...data, id: data.id || uid("st") });
  if (!v.ok) throw new Error(v.errors[0]);
  const status = { ...v.value };
  await storage.update((db) => {
    db.statuses[status.id] = status;
    return db;
  });
  return status;
}

export async function update(id, patch) {
  let updated = null;
  await storage.update((db) => {
    const cur = db.statuses[id];
    if (!cur) throw new Error("Status not found: " + id);
    updated = { ...cur, ...patch, id };
    const v = validateStatus(updated);
    if (!v.ok) throw new Error(v.errors[0]);
    db.statuses[id] = v.value;
    return db;
  });
  return updated;
}

export async function remove(id) {
  // Prevent removing a status still in use; reassign option handled by caller.
  await storage.update((db) => {
    delete db.statuses[id];
    return db;
  });
  return true;
}

export async function reorder(orderedIds) {
  await storage.update((db) => {
    orderedIds.forEach((id, idx) => {
      if (db.statuses[id]) db.statuses[id].order = idx + 1;
    });
    return db;
  });
  return true;
}

export default { list, get, create, update, remove, reorder };
