/**
 * replies/manager.js — quick reply CRUD.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";
import { nowIso } from "../utils/dates.js";
import { validateReply } from "../utils/validators.js";
import { stripUnsafeControlChars } from "../utils/sanitize.js";

export async function list() {
  const db = await storage.load();
  return Object.values(db.replies).sort((a, b) =>
    (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name)
  );
}

export async function get(id) {
  const db = await storage.load();
  return db.replies[id] || null;
}

/** Find a reply by its slash shortcut (e.g. "/price"). */
export async function findByShortcut(shortcut) {
  if (!shortcut) return null;
  const norm = String(shortcut).trim();
  const target = norm.startsWith("/") ? norm : "/" + norm;
  const db = await storage.load();
  return Object.values(db.replies).find((r) => r.shortcut === target) || null;
}

export async function create(data) {
  const id = (data && data.id) || uid("rp");
  const v = validateReply({ ...data, id });
  if (!v.ok) throw new Error(v.errors[0]);
  const reply = v.value;
  await storage.update((db) => {
    db.replies[id] = reply;
    return db;
  });
  return reply;
}

export async function update(id, patch) {
  let updated = null;
  await storage.update((db) => {
    const cur = db.replies[id];
    if (!cur) throw new Error("Reply not found: " + id);
    updated = { ...cur, ...patch, id, updatedAt: nowIso() };
    const v = validateReply(updated);
    if (!v.ok) throw new Error(v.errors[0]);
    db.replies[id] = v.value;
    return db;
  });
  return updated;
}

export async function remove(id) {
  await storage.update((db) => {
    delete db.replies[id];
    return db;
  });
  return true;
}

/** Increment usage count when a reply is inserted. */
export async function incrementUsage(id) {
  let updated = null;
  await storage.update((db) => {
    const cur = db.replies[id];
    if (!cur) return db;
    cur.usageCount = (cur.usageCount || 0) + 1;
    cur.updatedAt = nowIso();
    updated = cur;
    return db;
  });
  return updated;
}

export async function categories() {
  const list = await this.list();
  const set = new Set(list.map((r) => r.category || "General"));
  return Array.from(set).sort();
}

export default { list, get, findByShortcut, create, update, remove, incrementUsage, categories };
