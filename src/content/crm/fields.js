/**
 * fields.js — editable custom contact fields helpers.
 *
 * Contacts have a fixed core schema (name, phone, company, email, product,
 * budget, source). "Custom fields" here are the editable field metadata used
 * to render the contact editor dynamically: label + key + whether to show.
 * Stored under settings.customFields so the editor adapts without code changes.
 */
import * as storage from "../storage/storage.js";
import { uid } from "../utils/ids.js";

const DEFAULT_FIELDS = [
  { key: "name", label: "Name", type: "text", show: true },
  { key: "phone", label: "Phone", type: "phone", show: true },
  { key: "company", label: "Company", type: "text", show: true },
  { key: "email", label: "Email", type: "email", show: true },
  { key: "product", label: "Product", type: "text", show: true },
  { key: "budget", label: "Budget", type: "text", show: true },
  { key: "source", label: "Source", type: "text", show: true },
];

export async function list() {
  const db = await storage.load();
  const custom = (db.settings && db.settings.customFields) || [];
  // Merge defaults with any saved overrides keyed by `key`.
  const byKey = {};
  for (const f of DEFAULT_FIELDS) byKey[f.key] = { ...f };
  for (const f of custom) {
    if (f && f.key) byKey[f.key] = { ...byKey[f.key], ...f };
  }
  // Append fully custom fields (keys not in defaults).
  for (const f of custom) {
    if (f && f.key && !byKey[f.key]) byKey[f.key] = { ...f };
  }
  return Object.values(byKey);
}

export async function save(fields) {
  await storage.update((db) => {
    db.settings = db.settings || {};
    db.settings.customFields = fields.map((f) => ({
      key: String(f.key),
      label: String(f.label || f.key),
      type: String(f.type || "text"),
      show: f.show !== false,
    }));
    return db;
  });
  return list();
}

export async function add(label, type = "text") {
  const cur = await list();
  const key = uid("cf");
  const next = cur.concat([{ key, label, type, show: true }]);
  await save(next);
  return key;
}

export async function remove(key) {
  const cur = await list();
  await save(cur.filter((f) => f.key !== key));
  return true;
}

export const CORE_FIELDS = DEFAULT_FIELDS.map((f) => f.key);

export default { list, save, add, remove, CORE_FIELDS };
