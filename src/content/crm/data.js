/**
 * crm/data.js — data portability: CSV import/export, JSON backup/restore,
 * demo data loading/reset. These functions own the schema boundary so callers
 * stay simple.
 */
import * as storage from "../storage/storage.js";
import { createEmptyDb, DEFAULT_STATUSES, DEFAULT_TAGS, DEFAULT_REPLIES, SCHEMA_VERSION } from "../storage/schema.js";
import { toCsv, parseCsv, template as csvTemplate } from "../utils/csv.js";
import { nowIso } from "../utils/dates.js";
import { uid } from "../utils/ids.js";
import { validateContact, validateBackup } from "../utils/validators.js";

export const CSV_COLUMNS = [
  "name", "phone", "company", "email", "product", "budget", "source",
  "status", "tags", "notes", "followUpDate", "createdAt", "updatedAt",
];

/** Build a CSV template string for download. */
export function csvTemplateString() {
  return csvTemplate(CSV_COLUMNS, {
    name: "Jane Doe",
    phone: "+910000000000",
    company: "Acme",
    email: "jane@example.test",
    product: "Product X",
    budget: "50000",
    source: "Website",
    status: "New Lead",
    tags: "Hot|Website",
    notes: "Sample note.",
    followUpDate: "",
    createdAt: "",
    updatedAt: "",
  });
}

/** Export all contacts to CSV (plus their notes joined with " | "). */
export async function exportContactsCsv() {
  const db = await storage.load();
  const rows = Object.values(db.contacts).map((c) => {
    const tags = (c.tagIds || [])
      .map((tid) => (db.tags[tid] ? db.tags[tid].name : ""))
      .filter(Boolean)
      .join("|");
    const contactNotes = Object.values(db.notes)
      .filter((n) => n.contactId === c.id)
      .map((n) => n.text)
      .join(" | ");
    const status = db.statuses[c.statusId] ? db.statuses[c.statusId].name : "";
    return {
      name: c.name || "",
      phone: c.phone || "",
      company: c.company || "",
      email: c.email || "",
      product: c.product || "",
      budget: c.budget || "",
      source: c.source || "",
      status,
      tags,
      notes: contactNotes,
      followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "",
      createdAt: c.createdAt || "",
      updatedAt: c.updatedAt || "",
    };
  });
  return toCsv(rows, CSV_COLUMNS);
}

/**
 * Preview a CSV import: parse + validate without writing. Returns per-row
 * validation so the UI can show errors before committing.
 * @param {string} csvText
 * @returns {Promise<{rows:Array, errors:Array, summary:object}>}
 */
export async function previewImportCsv(csvText) {
  const db = await storage.load();
  const parsed = parseCsv(csvText);
  const rows = parsed.rows;
  const errors = [];
  const statusByName = {};
  for (const s of Object.values(db.statuses)) statusByName[s.name.toLowerCase()] = s.id;
  const tagByName = {};
  for (const t of Object.values(db.tags)) tagByName[t.name.toLowerCase()] = t.id;

  const prepared = rows.map((r, i) => {
    const lineNo = i + 2; // +1 header, +1 1-based
    const name = (r.name || "").trim();
    const phone = (r.phone || "").trim();
    if (!name && !phone) {
      errors.push({ row: lineNo, message: "Row has neither name nor phone; skipping." });
      return null;
    }
    const statusName = (r.status || "").trim().toLowerCase();
    const statusId = statusByName[statusName] || "new_lead";
    const tagIds = (r.tags || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((tn) => tagByName[tn.toLowerCase()])
      .filter(Boolean);
    const v = validateContact({
      id: uid("ct"),
      name, phone,
      company: r.company || "",
      email: r.email || "",
      product: r.product || "",
      budget: r.budget || "",
      source: r.source || "",
      statusId,
      tagIds,
      followUpDate: r.followUpDate ? r.followUpDate : null,
      createdAt: r.createdAt || nowIso(),
      updatedAt: r.updatedAt || nowIso(),
    });
    if (!v.ok) {
      errors.push({ row: lineNo, message: v.errors[0] });
      return null;
    }
    return { contact: v.value, noteText: (r.notes || "").trim(), followUpDate: r.followUpDate || null };
  }).filter(Boolean);

  return {
    rows: prepared,
    errors,
    summary: { totalRows: rows.length, valid: prepared.length, errors: errors.length },
  };
}

/**
 * Commit a previously-previewed import. Atomic-ish: writes in a single update().
 * @param {Array<{contact:object, noteText:string, followUpDate:string|null}>} prepared
 */
export async function commitImport(prepared) {
  const now = nowIso();
  await storage.update((db) => {
    for (const item of prepared) {
      const c = { ...item.contact, createdAt: item.contact.createdAt || now, updatedAt: now, lastSeenAt: null };
      db.contacts[c.id] = c;
      if (item.noteText) {
        const nId = uid("nt");
        db.notes[nId] = { id: nId, contactId: c.id, text: item.noteText, createdAt: now, updatedAt: now };
      }
    }
    return db;
  });
  return prepared.length;
}

/** Build a full JSON backup payload (validated shape). */
export async function exportBackup() {
  const db = await storage.load();
  return {
    app: "leaddock",
    version: SCHEMA_VERSION,
    exportedAt: nowIso(),
    data: {
      contacts: db.contacts,
      notes: db.notes,
      replies: db.replies,
      tags: db.tags,
      statuses: db.statuses,
      followUps: db.followUps,
      activity: db.activity || {},
      settings: db.settings,
      meta: db.meta,
    },
  };
}

/** Validate a parsed backup payload. Returns {ok, errors, value}. */
export function validateBackupPayload(payload) {
  return validateBackup(payload);
}

/** Restore a backup in REPLACE mode (after user confirmation). Atomic. */
export async function restoreBackup(payload) {
  const v = validateBackup(payload);
  if (!v.ok) throw new Error(v.errors.join("; "));
  const data = v.value.data;
  const next = {
    version: SCHEMA_VERSION,
    contacts: data.contacts || {},
    notes: data.notes || {},
    replies: data.replies || {},
    tags: data.tags || {},
    statuses: data.statuses || {},
    followUps: data.followUps || {},
    activity: data.activity || {},
    settings: data.settings || {},
    meta: Object.assign({ createdAt: nowIso(), lastSeenAt: nowIso() }, data.meta || {}),
  };
  return storage.replace(next);
}

/** Reset everything to a fresh seeded DB. */
export async function resetAll() {
  return storage.reset();
}

export default {
  CSV_COLUMNS, csvTemplateString, exportContactsCsv, previewImportCsv, commitImport,
  exportBackup, validateBackupPayload, restoreBackup, resetAll,
};
