/**
 * validators.js — validation helpers for CRM entities and import payloads.
 *
 * All validators return a normalized record `{ ok, errors[], value }` so callers
 * can decide whether to discard, prompt the user, or coerce.
 */

import { parseIso } from "./dates.js";

/** @returns {{ok:boolean, errors:string[], value:any}} */
function ok(value) {
  return { ok: true, errors: [], value };
}
function fail(errors) {
  return { ok: false, errors: Array.isArray(errors) ? errors : [String(errors)], value: null };
}

/** Trim a string, coerce to "". */
export function asString(v) {
  return v == null ? "" : String(v).trim();
}

/** Validate a status object. */
export function validateStatus(s) {
  if (!s || typeof s !== "object") return fail("Status must be an object");
  const id = asString(s.id);
  const name = asString(s.name);
  if (!id) return fail("Status id is required");
  if (!name) return fail("Status name is required");
  const color = asString(s.color) || "#6B7280";
  const order = Number.isFinite(s.order) ? Number(s.order) : 100;
  return ok({ id, name, color, order });
}

/** Validate a tag object. */
export function validateTag(t) {
  if (!t || typeof t !== "object") return fail("Tag must be an object");
  const id = asString(t.id);
  const name = asString(t.name);
  if (!id) return fail("Tag id is required");
  if (!name) return fail("Tag name is required");
  const color = asString(t.color) || "#6B7280";
  return ok({ id, name, color });
}

/** Validate a contact object (used on import). Coerces + keeps known fields. */
export function validateContact(c) {
  if (!c || typeof c !== "object") return fail("Contact must be an object");
  const id = asString(c.id);
  const name = asString(c.name);
  const phone = asString(c.phone);
  if (!id && !phone && !name) {
    return fail("Contact requires at least an id, name, or phone");
  }
  const contact = {
    id: id || phone || name,
    phone,
    name,
    company: asString(c.company),
    email: asString(c.email),
    product: asString(c.product),
    budget: asString(c.budget),
    source: asString(c.source),
    statusId: asString(c.statusId),
    tagIds: Array.isArray(c.tagIds) ? c.tagIds.map(asString).filter(Boolean) : [],
    followUpDate: parseIso(c.followUpDate) ? c.followUpDate : null,
    createdAt: parseIso(c.createdAt) ? c.createdAt : new Date().toISOString(),
    updatedAt: parseIso(c.updatedAt) ? c.updatedAt : new Date().toISOString(),
    lastSeenAt: parseIso(c.lastSeenAt) ? c.lastSeenAt : null,
  };
  return ok(contact);
}

/** Validate a note object. */
export function validateNote(n) {
  if (!n || typeof n !== "object") return fail("Note must be an object");
  const id = asString(n.id);
  const contactId = asString(n.contactId);
  const text = asString(n.text);
  if (!id) return fail("Note id is required");
  if (!contactId) return fail("Note contactId is required");
  if (!text) return fail("Note text is required");
  return ok({
    id,
    contactId,
    text,
    createdAt: parseIso(n.createdAt) ? n.createdAt : new Date().toISOString(),
    updatedAt: parseIso(n.updatedAt) ? n.updatedAt : new Date().toISOString(),
  });
}

/** Validate a quick reply object. */
export function validateReply(r) {
  if (!r || typeof r !== "object") return fail("Reply must be an object");
  const id = asString(r.id);
  const name = asString(r.name);
  const content = asString(r.content);
  if (!name) return fail("Reply name is required");
  if (!content) return fail("Reply content is required");
  let shortcut = asString(r.shortcut);
  if (shortcut && !shortcut.startsWith("/")) shortcut = "/" + shortcut.replace(/^\/+/, "");
  return ok({
    id,
    name,
    shortcut,
    content,
    category: asString(r.category) || "General",
    usageCount: Number.isFinite(r.usageCount) ? Math.max(0, Number(r.usageCount)) : 0,
    createdAt: parseIso(r.createdAt) ? r.createdAt : new Date().toISOString(),
    updatedAt: parseIso(r.updatedAt) ? r.updatedAt : new Date().toISOString(),
  });
}

/** Validate a follow-up object. */
export function validateFollowUp(f) {
  if (!f || typeof f !== "object") return fail("Follow-up must be an object");
  const id = asString(f.id);
  const contactId = asString(f.contactId);
  if (!contactId) return fail("Follow-up contactId is required");
  return ok({
    id,
    contactId,
    date: parseIso(f.date) ? f.date : null,
    note: asString(f.note),
    done: f.done === true,
  });
}

/** Validate a full backup payload. Returns {ok, errors, value: normalizedPayload}. */
export function validateBackup(payload) {
  if (!payload || typeof payload !== "object") return fail("Backup must be a JSON object");
  if (!payload.app || payload.app !== "waflow") {
    return fail("Not a WaFlow backup (missing app=waflow marker)");
  }
  const version = Number(payload.version);
  if (!Number.isFinite(version) || version < 1) {
    return fail("Backup version is missing or invalid");
  }
  const data = payload.data || {};
  const collections = ["contacts", "notes", "replies", "tags", "statuses", "followUps"];
  for (const key of collections) {
    if (data[key] !== undefined && data[key] !== null && typeof data[key] !== "object") {
      return fail(`Backup collection '${key}' must be an object/map`);
    }
  }
  return ok({ app: "waflow", version, exportedAt: payload.exportedAt || new Date().toISOString(), data });
}

/** Validate an email-ish string loosely. */
export function isEmail(v) {
  const s = asString(v);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Validate a phone-ish string (allows leading +, digits, spaces, dashes). */
export function isPhone(v) {
  const s = asString(v);
  return /^\+?[0-9][0-9\s-]{4,}$/.test(s);
}

/** Normalize a phone for de-dup comparison: digits only. */
export function normalizePhone(v) {
  return asString(v).replace(/[^\d]/g, "");
}

export default {
  validateStatus,
  validateTag,
  validateContact,
  validateNote,
  validateReply,
  validateFollowUp,
  validateBackup,
  isEmail,
  isPhone,
  normalizePhone,
  asString,
};
